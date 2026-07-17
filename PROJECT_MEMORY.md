# Memoria del proyecto

## Objetivo y alcance

Aplicación móvil híbrida para administrar tareas y categorías, desarrollada como prueba técnica. Debe demostrar funcionalidad, UX, calidad, rendimiento, Git e integración con Firebase Remote Config.

Permitirá crear, completar y eliminar tareas; crear, editar y eliminar categorías; asignar una categoría; filtrar y conservar todo localmente. La búsqueda será una mejora controlada remotamente.

## Estado actual

La aplicación funcional incluye dominio, persistencia local versionada, casos de uso, `TaskBoardFacade`, Firebase Remote Config real, búsqueda y optimizaciones para listas grandes. La suite contiene 34 pruebas unitarias/de interacción. Cordova genera Android 15 e iOS 8.1; el entorno Windows actual compila APK debug y release, y la instalación, el arranque y la inspección visual se verificaron en un Samsung Galaxy S21 FE físico con Android 16. El APK release está firmado, validado y se distribuye mediante GitHub Releases. Las evidencias reproducibles incluyen los estados remoto activado, desactivado y fallback offline. Sigue pendiente únicamente el IPA firmado, que requiere macOS y credenciales Apple Developer.

## Arquitectura

Arquitectura por capas orientada a funcionalidades:

- `domain`: entidades, reglas y contratos sin dependencias de framework.
- `application`: casos de uso y facade de estado con Angular Signals.
- `infrastructure`: persistencia, Firebase y adaptadores.
- `features`: pantallas de tareas y categorías.
- `core`: configuración y servicios transversales singleton.
- `shared`: piezas reutilizables sin reglas de negocio.

La UI depende de abstracciones mediante inyección de dependencias. Se usan Repository, Use Case, Adapter y Facade. El estado reactivo se expone con Angular Signals en `TaskBoardFacade`. La configuración remota se consume mediante `FeatureFlagService`; el SDK de Firebase queda aislado en infraestructura.

## Tecnologías y dependencias críticas

- Ionic 8, Angular 20 standalone, TypeScript 5.9 estricto y RxJS 7.8.
- Cordova 13, Cordova Android 15 y Cordova iOS 8.1.
- Firebase JavaScript SDK 12.16 y Remote Config modular.
- Jasmine/Karma, ESLint, Prettier y `tsx` 4.23 para benchmarks.

Cordova está deprecado en Ionic, pero es requisito explícito de la prueba y se mantiene fijado localmente para builds reproducibles.

## Repositorio

- `src/app/domain`: modelos, reglas, factories, errores y contratos de repositorio.
- `src/app/application`: casos de uso, providers y facades de estado.
- `src/app/application/queries`: consultas puras y medibles sobre listas.
- `src/app/infrastructure/persistence`: adaptador de persistencia local versionada.
- `src/app/infrastructure/remote-config`: adaptador Firebase, cliente, providers y fallback.
- `src/app/home`: pantalla principal de tareas y categorías.
- `src/app`: shell y rutas Angular.
- `src/assets`: recursos web.
- `src/environments`: configuración pública por entorno.
- `src/theme`: tokens visuales.
- `firebase`: plantilla versionada de Remote Config.
- `evidence/android`: capturas y protocolo reproducible de validación física.
- `resources`: iconos adaptativos, monocromáticos, fallbacks y splash nativos.
- `config.xml`: configuración Cordova.
- `tools`: benchmark reproducible y automatización de Remote Config y firma/verificación Android.
- PDF de la prueba: especificación original.

No se versionan `node_modules`, `www`, `platforms`, `plugins`, `coverage`, `tmp`, `.local-signing` ni `build.json`.

## Convenciones

- Código, identificadores, archivos, rutas internas, pruebas y commits en inglés.
- Interfaz y accesibilidad en español.
- TypeScript estricto; evitar `any`.
- Componentes sin reglas de negocio ni acceso directo a almacenamiento/Firebase.
- Inmutabilidad, funciones pequeñas e inyección de dependencias.
- Commits Conventional Commits en inglés y ramas `feature/`, `fix/`, `refactor/` o `docs/`.
- Cada commit debe ser cohesivo, compilable y no contener secretos.

## Modelos y reglas estables

- `Task`: `id`, `title`, `isCompleted`, `categoryId`, `createdAt` y `updatedAt`.
- `Category`: `id`, `name`, `color`, `createdAt` y `updatedAt`.
- `FeatureFlags`: valores booleanos normalizados.
- Título de tarea y nombre de categoría obligatorios.
- Título de tarea: máximo 120 caracteres.
- Nombre de categoría: máximo 40 caracteres.
- Color de categoría: hexadecimal `#rrggbb`; si es inválido se normaliza al color predeterminado.
- Cada tarea admite máximo una categoría.
- Eliminar una categoría conserva sus tareas y las deja sin categoría.
- La aplicación funciona sin conexión y Firebase nunca bloquea el inicio.
- Categorías es funcionalidad obligatoria y no depende de feature flags.

## Persistencia local

La persistencia local usa un `VersionedLocalStore` sobre la abstracción `KeyValueStorage`. El adaptador actual es `BrowserKeyValueStorage`, respaldado por `localStorage`.

- Clave de almacenamiento: `nequi-tasks-state`.
- Versión actual del esquema: `1`.
- Esquema `v1`: `{ version, tasks, categories }`.
- Si el JSON almacenado está corrupto o pertenece a una versión desconocida, la aplicación recupera un estado vacío `v1`.
- Los repositorios concretos son `LocalTaskRepository` y `LocalCategoryRepository`.
- La UI debe consumir `TASK_REPOSITORY` y `CATEGORY_REPOSITORY`, no clases concretas.
- `VersionedLocalStore` mantiene en memoria el último estado deserializado; `write` actualiza la caché y `clear` la invalida.

## Flujos principales

- La pantalla principal carga tareas y categorías a través de `TaskBoardFacade`.
- Se pueden crear tareas con o sin categoría.
- Se pueden completar y eliminar tareas.
- Se pueden crear, editar y eliminar categorías.
- El filtro por categoría permite ver todas las tareas, tareas sin categoría o tareas de una categoría específica.
- Cuando `task_search_enabled` está activa, el buscador filtra por título dentro del filtro de categoría seleccionado.
- La UI renderiza inicialmente 30 tareas y amplía la ventana en lotes de 30 mediante “Mostrar más”. Cambiar filtro o búsqueda reinicia la ventana.
- Los formularios visibles están en español; identificadores, métodos y archivos se mantienen en inglés.

## Estrategia de rendimiento

- `TaskBoardFacade` usa Angular Signals y `ChangeDetectionStrategy.OnPush`.
- Contadores de estado se calculan juntos en una sola iteración.
- Las categorías se indexan en un `Map` para lookup O(1) durante el render.
- Crear, completar, eliminar o editar actualiza Signals con el resultado del caso de uso, sin releer ni reordenar el repositorio completo.
- Eliminar una categoría sí recarga ambas colecciones porque la regla desacopla tareas afectadas dentro del repositorio.
- El render incremental limita nodos Ionic y memoria visual sin asumir una altura fija de fila.
- `npm run benchmark` mide el algoritmo real con 50.000 tareas y emite JSON con runtime, memoria aproximada y tiempos.

## Servicios externos y configuración

Firebase Remote Config controla `task_search_enabled` a través de `FeatureFlagService` y `FirebaseFeatureFlagService`.

- Proyecto Firebase: `nequi-tasks-mz-20260717`.
- Aplicación web Firebase: `Nequi Tasks Web`.
- La configuración pública se centraliza en `src/environments/firebase-options.ts` y es compartida por ambos entornos Angular.
- `firebase/remote-config.template.json` es la fuente versionada de la plantilla; `firebase.json` y `.firebaserc` vinculan el despliegue con el proyecto real.
- Los scripts `firebase:remote-config:enable`, `firebase:remote-config:disable` y `firebase:remote-config:verify` publican o consultan la bandera usando Firebase CLI autenticado.
- El valor local predeterminado es `true`, para conservar la búsqueda cuando no hay red o configuración.
- El fetch tiene timeout de 3 segundos; el intervalo mínimo es 1 minuto en desarrollo y 12 horas en producción.
- La carga de tareas y categorías se inicia en paralelo y no depende de la respuesta remota.
- Si el fetch falla, se utiliza el último valor activado en caché o el default local del SDK.
- Si Firebase no está configurado, no es soportado o no puede inicializarse, se usa el default local.
- La configuración pública requerida contiene `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId` y `appId`.
- Los valores de configuración Firebase para web identifican el proyecto, pero no deben confundirse con credenciales administrativas. Nunca se versionan claves privadas, cuentas de servicio ni credenciales de firma.

- ID nativo: `com.nequitasks.app`.
- Nombre visible: `Mis tareas`.
- Salida web Cordova: `www`.
- Android compila en Windows con JDK 17, Android SDK Platform 36 y Build Tools 36.0.0.
- El entorno actual usa Temurin 17.0.19, `ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk` y el AVD opcional `Nequi_API_34`.
- El APK de depuración se genera en `platforms/android/app/build/outputs/apk/debug/app-debug.apk`; `platforms` no se versiona.
- Android usa el origen local seguro `https://localhost` provisto por `WebViewAssetLoader`; no se permite tráfico HTTP local explícitamente.
- Cordova core provee WebView, splash, teclado básico y barras del sistema; no hay plugins Cordova instalados porque la aplicación no consume APIs nativas adicionales.
- Android usa splash vectorial moderno e iconos adaptativos con capa monocromática; los PNG por densidad son fallback para API 24 y 25.
- La firma release local usa PKCS#12, RSA de 3072 bits y APK Signature Scheme v2. `.local-signing` y `build.json` contienen material sensible local y nunca se versionan.
- El APK release firmado se genera en `platforms/android/app/build/outputs/apk/release/app-release.apk` y se valida con `apksigner`.
- Release Android `v0.1.0`: asset `nequi-tasks-v0.1.0.apk`, 2.995.647 bytes y SHA-256 `3E38B6DC0DDA99BF5DD8311BDBC675B8403D9D8B16934D4AD24F5B4938A06E31`.
- Las capturas de aceptación se obtienen con ADB en el Samsung físico y se conservan en `evidence/android`; no se registra el serial del dispositivo.
- La llave generada localmente sirve para la entrega técnica; debe respaldarse de forma segura porque perderla impide actualizar una instalación firmada con ella.
- Cordova Android 15.0.0, última versión disponible, aún usa APIs Java y construcciones Gradle deprecadas; las advertencias provienen de `CordovaLib`, no del código ni de plugins del proyecto.
- Un IPA firmado requiere macOS, Xcode, cuenta Apple Developer, certificados y perfiles.

## Autenticación y autorización

No forman parte del alcance. Los datos pertenecen a la instalación local.
