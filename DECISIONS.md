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

Usar capas orientadas a funcionalidades, Repository, Use Case, Adapter y Facade; Angular Signals maneja el estado de UI mediante `TaskBoardFacade`. Esto aplica SOLID, facilita pruebas y evita el coste de NgRx para el alcance actual.

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

## ADR-003: Feature flag para búsqueda de tareas

Fecha: 2026-07-15

### Contexto y problema

Remote Config debe modificar una característica visible sin desactivar funcionalidades obligatorias.

### Alternativas

- Controlar categorías.
- Controlar modo oscuro.
- Controlar búsqueda.

### Decisión y justificación

Usar el booleano `task_search_enabled` y consumirlo a través del puerto `FeatureFlagService`. `FirebaseFeatureFlagService` coordina el fallback y un `RemoteConfigClient` encapsula el SDK modular. La búsqueda aporta valor en listas grandes, su efecto es demostrable y su ausencia no incumple requisitos.

### Consecuencias

El default local es `true`. La carga de datos no espera a Firebase; un fetch exitoso usa el valor activado y un fallo conserva caché/default. La UI muestra u oculta el buscador al resolver la bandera y limpia consultas activas si esta se deshabilita. Se añaden abstracciones, pero el facade y las pruebas no dependen del SDK.

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

## ADR-005: Ventana incremental para listas grandes

Fecha: 2026-07-16

### Contexto y problema

Renderizar todas las tareas con componentes Ionic aumenta el DOM, el tiempo de detección de cambios y la memoria. Las filas pueden variar de altura por título, categoría y estado.

### Alternativas

- Renderizar la colección completa con `@for` y `track`.
- Usar virtual scrolling con altura de fila fija.
- Paginar los datos en el repositorio.
- Mantener todos los datos locales y renderizar una ventana incremental.

### Decisión y justificación

Mantener la colección completa en Signals y renderizar lotes de 30 con una acción explícita “Mostrar más”. Se combina con `OnPush`, consultas puras, caché de deserialización y actualizaciones incrementales del facade. La estrategia tolera alturas variables, conserva búsqueda/filtros y no añade una dependencia de virtualización.

### Consecuencias

El DOM queda acotado al lote solicitado y las mutaciones comunes evitan lecturas completas. La búsqueda sigue recorriendo la colección local, pero el benchmark con 50.000 tareas permite detectar regresiones. Para volúmenes que excedan el alcance de `localStorage`, deberá reemplazarse el adaptador por IndexedDB/SQLite y añadir paginación de repositorio.

Estado: Activa

## ADR-006: Runtime Cordova sin plugins y firma Android local aislada

Fecha: 2026-07-17

### Contexto y problema

La configuración inicial dependía de plugins heredados para splash, status bar, dispositivo, teclado y WebView, aunque la aplicación no invoca sus APIs. Android 12+ exige la SplashScreen API, Android 13 admite iconos temáticos y la entrega requiere un APK release sin exponer credenciales.

### Alternativas

- Mantener o actualizar todos los plugins heredados.
- Migrar a Capacitor y apartarse del requisito Cordova.
- Usar las capacidades incorporadas de Cordova Android/iOS y retirar plugins no utilizados.
- Versionar una llave de evaluación o pasar contraseñas en comandos manuales.
- Generar localmente una llave persistente y excluir todo material sensible.

### Decisión y justificación

Usar el WebView HTTPS, splash y comportamiento base incorporados en Cordova 13/Android 15/iOS 8.1, sin plugins nativos mientras no exista un caso de uso que los requiera. Android usa recursos vectoriales adaptativos y monocromáticos. La firma local se automatiza con una llave PKCS#12 RSA 3072 y un `build.json` generado; ambos se excluyen de Git y el APK se verifica con `apksigner`.

### Consecuencias

Se reduce superficie nativa, deuda de plugins y advertencias accionables. El origen Android cambia del HTTP proporcionado por Ionic WebView al `https://localhost` seguro de Cordova; los datos de prueba almacenados bajo el origen anterior no se migran. La llave local debe respaldarse para publicar actualizaciones. Cordova Android 15.0.0 conserva deprecaciones internas de Java/Gradle que solo podrá resolver una versión upstream; no se modifican ni silencian fuentes generadas.

Estado: Activa
