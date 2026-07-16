# Decisiones de arquitectura

## ADR-001: Arquitectura por capas orientada a funcionalidades

Fecha: 2026-07-15

### Contexto y problema

La lógica de tareas, persistencia y configuración remota no debe quedar acoplada a Ionic, pero el tamaño del proyecto tampoco justifica infraestructura compleja.

### Alternativas

- Componentes y servicios organizados solo por tipo.
- Capas con dominio, casos de uso, adaptadores y funcionalidades.
- NgRx y arquitectura basada en eventos.

### Decisión y justificación

Usar capas orientadas a funcionalidades, Repository, Use Case, Adapter y Facade; Angular Signals manejará el estado de UI. Esto aplica SOLID, facilita pruebas y evita el coste de NgRx para el alcance actual.

### Consecuencias

Habrá más abstracciones que en una aplicación mínima. La UI no accederá directamente a almacenamiento o Firebase y cada capa podrá probarse o sustituirse aisladamente.

Estado: Activa

## ADR-002: Cordova como runtime híbrido

Fecha: 2026-07-15

### Contexto y problema

La prueba exige Cordova, aunque Ionic recomienda Capacitor y marca Cordova como deprecado.

### Alternativas

- Solo Capacitor.
- Solo Cordova.
- Ambos runtimes.

### Decisión y justificación

Usar Cordova 13, Cordova Android 15 y Cordova iOS 8.1, fijados como dependencias de desarrollo. Cumple literalmente la evaluación, es compatible con Node.js 22 y evita mantener dos proyectos nativos.

### Consecuencias

Se acepta deuda tecnológica y algunos plugins heredados requerirán revisión. Android puede construirse en Windows; un IPA firmado requiere macOS y Xcode. Migrar a Capacitor exigirá reemplazar este ADR.

Estado: Activa

## ADR-004: Persistencia local versionada sobre adaptador intercambiable

Fecha: 2026-07-15

### Contexto y problema

La aplicación debe conservar tareas y categorías localmente, funcionar sin conexión y permitir evolución futura del esquema sin acoplar la UI al mecanismo de almacenamiento.

### Alternativas

- Acceso directo a `localStorage` desde componentes.
- IndexedDB o Ionic Storage desde el inicio.
- SQLite nativo mediante plugin.
- Store versionado sobre una abstracción `KeyValueStorage`.

### Decisión y justificación

Usar `VersionedLocalStore` con esquema `v1`, repositorios locales y una abstracción `KeyValueStorage`. El adaptador actual usa `localStorage`, sin añadir dependencias, y queda aislado para poder migrar a IndexedDB/Ionic Storage si el volumen de datos lo exige.

### Consecuencias

La solución es simple, testeable y suficiente para la primera versión offline. `localStorage` es síncrono y no es ideal para volúmenes muy grandes; la optimización futura debe reemplazar solo el adaptador de infraestructura, no el dominio ni los contratos.

Estado: Activa

## ADR-003: Feature flag para búsqueda de tareas

Fecha: 2026-07-15

### Contexto y problema

Remote Config debe modificar una característica visible sin desactivar funcionalidades obligatorias.

### Alternativas

- Controlar categorías.
- Controlar modo oscuro.
- Controlar búsqueda.

### Decisión y justificación

Usar el booleano `task_search_enabled`. La búsqueda aporta valor en listas grandes, su efecto es demostrable y su ausencia no incumple requisitos.

### Consecuencias

Existirá un valor local predeterminado; la UI reaccionará sin reinicio y cualquier fallo de Firebase será recuperable.

Estado: Activa
