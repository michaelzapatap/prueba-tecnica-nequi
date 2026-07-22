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

Usar capas orientadas a funcionalidades y los patrones Repository, Use Case, Adapter, Store, Query y Facade. Angular Signals maneja el estado reactivo. Esto aplica SOLID, facilita pruebas y evita el coste de NgRx para el alcance actual.

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

Mantener la colección completa en Signals y renderizar lotes de 30 con una acción explícita “Mostrar más”. Se combina con `OnPush`, consultas puras, selección de página en una sola pasada, caché de deserialización y actualizaciones incrementales del store. La estrategia tolera alturas variables, conserva búsqueda/filtros y no añade una dependencia de virtualización.

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

## ADR-007: Plantilla versionada y despliegue autenticado de Remote Config

Fecha: 2026-07-17

### Contexto y problema

La prueba requiere una integración demostrable con un proyecto Firebase real. La bandera debe poder alternarse de forma reproducible sin copiar credenciales administrativas al código ni depender de cambios manuales no auditables en la consola.

### Alternativas

- Configurar y publicar la bandera únicamente desde Firebase Console.
- Consumir un endpoint propio que replique una feature flag.
- Versionar la plantilla de Remote Config y desplegarla con Firebase CLI autenticado localmente.

### Decisión y justificación

Usar el proyecto `nequi-tasks-mz-20260717`, centralizar su configuración web pública en `firebase-options.ts` y mantener `firebase/remote-config.template.json` como fuente de verdad. Los scripts del proyecto actualizan exclusivamente `task_search_enabled` y despliegan la plantilla con Firebase CLI. La sesión autenticada vive fuera del repositorio y no se versionan tokens, cuentas de servicio ni claves privadas.

### Consecuencias

Los cambios de la bandera quedan representados por una plantilla revisable y por versiones de Remote Config. Para publicar se requiere Firebase CLI y acceso autorizado al proyecto; ejecutar la app o usar el fallback offline no requiere credenciales administrativas. La configuración web pública queda en Git por ser necesaria en el cliente, pero debe protegerse con reglas y restricciones de API adecuadas si se añaden servicios con datos.

Estado: Activa

## ADR-008: CI con permisos mínimos y release Android atestada

Fecha: 2026-07-17

### Contexto y problema

La entrega necesita controles repetibles y un APK cuya procedencia, dependencias e integridad puedan verificarse sin versionar la llave de firma. Un build local firmado prueba funcionalidad, pero no ofrece por sí solo provenance vinculada a un commit o SBOM verificable.

### Alternativas

- Conservar únicamente validaciones y firma locales.
- Subir el keystore o `build.json` al repositorio para simplificar CI.
- Construir desde tags en GitHub Actions, guardar la firma en secretos cifrados y generar checksums, SBOM y attestations.

### Decisión y justificación

Separar CI de cambios y release. CI usa permisos de solo lectura y ejecuta formato, lint, tipos, auditoría, pruebas, benchmark y build web. La release se activa desde tags semánticos, valida que coincidan con `package.json`, reconstruye el APK con material efímero proveniente de GitHub Secrets y publica CycloneDX, SHA-256 y attestations GitHub/Sigstore. Todas las acciones se fijan por commit SHA.

### Consecuencias

La release requiere cuatro secretos de repositorio y permisos `contents`, `id-token` y `attestations` de escritura únicamente en ese workflow. La llave base64 también se trata como secreto. El runner elimina `build.json` y el keystore al finalizar. Los consumidores pueden verificar el APK con `gh attestation verify`; esto demuestra procedencia e integridad, no ausencia de vulnerabilidades. El IPA continúa fuera de este flujo hasta disponer de runner macOS y credenciales Apple protegidas.

Estado: Activa

## ADR-009: Separar lectura, comandos y estado del tablero

Fecha: 2026-07-22

### Contexto y problema

Una facade única coordinaba carga, consultas, feature flags, comandos de tareas, comandos de categorías y errores. Esto concentraba demasiadas razones de cambio y no exponía estados pendientes suficientemente precisos para bloquear operaciones concurrentes sobre una misma entidad.

### Alternativas

- Mantener una facade única y agregar más Signals.
- Introducir NgRx con acciones, reducers y effects.
- Separar store compartido, lectura, comandos de tareas, comandos de categorías y feedback.

### Decisión y justificación

Usar `TaskBoardStore` como contenedor mínimo de entidades; `TaskListFacade` para carga, filtros, búsqueda y ventana de render; `TaskCommandFacade` y `CategoryCommandFacade` para sus respectivos casos de uso; y `TaskBoardFeedbackService` para errores. Los comandos retornan éxito explícito y mantienen estados pendientes globales o por identificador.

### Consecuencias

Cada servicio tiene una razón de cambio y puede probarse aisladamente. La UI no limpia entradas ante un fallo, deshabilita únicamente los controles afectados y rechaza comandos duplicados mientras una operación equivalente está en curso. Aumenta el número de clases, pero disminuye el acoplamiento y la complejidad de cada una.

Estado: Activa

## ADR-010: Política de red móvil con privilegio mínimo

Fecha: 2026-07-22

### Contexto y problema

La configuración Cordova permitía cualquier origen y exponía intents HTTP/HTTPS comodín. Esa amplitud no era necesaria para una aplicación que solo consulta dos servicios Firebase y aumenta la superficie de navegación y exfiltración ante una inyección.

### Alternativas

- Conservar comodines por simplicidad.
- Permitir dominios Firebase completos.
- Autorizar únicamente los endpoints usados y aplicar CSP en el documento web.

### Decisión y justificación

Autorizar solamente Firebase Installations y Firebase Remote Config en `config.xml`, retirar intents externos no utilizados y aplicar una Content Security Policy con `default-src 'self'`, `object-src 'none'` y `connect-src` limitado. Una comprobación ejecutable valida la política en local y CI.

### Consecuencias

La aplicación conserva el funcionamiento requerido con Remote Config y reduce privilegios innecesarios. Cualquier servicio de red o enlace externo futuro deberá agregarse explícitamente, justificarse y cubrirse en la validación de seguridad.

Estado: Activa
