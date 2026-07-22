# Memoria del proyecto

## Objetivo y alcance

Aplicación móvil híbrida para administrar tareas y categorías, desarrollada como prueba técnica. Debe demostrar funcionalidad, UX, calidad, rendimiento, Git e integración con Firebase Remote Config.

Permitirá crear, completar y eliminar tareas; crear, editar y eliminar categorías; asignar una categoría; filtrar y conservar todo localmente. La búsqueda será una mejora controlada remotamente.

## Estado actual

La aplicación funcional incluye dominio, persistencia local versionada, casos de uso, store reactivo, facades especializados, Firebase Remote Config real, búsqueda y optimizaciones para listas grandes. La suite contiene 55 pruebas unitarias/de interacción y exige umbrales globales mínimos de cobertura. Cordova genera Android 15 e iOS 8.1; el APK público correctivo `v0.1.2` fue descargado, verificado por checksum, firma y attestations de provenance/SBOM, instalado y sometido a un smoke completo en un Samsung Galaxy S21 FE físico con Android 16. GitHub Actions valida cada cambio y construye releases Android firmadas desde tags, con SBOM, checksums y attestations. Las evidencias reproducibles cubren Remote Config, tareas, categorías, búsqueda, completado, persistencia, fallback offline y eliminación. Solo sigue pendiente el IPA firmado, que requiere macOS y credenciales Apple Developer; el repositorio público tampoco figura como fork porque no existe un upstream identificable en la especificación o los remotos.

## Arquitectura

Arquitectura por capas orientada a funcionalidades:

- `domain`: entidades, reglas y contratos sin dependencias de framework.
- `application`: casos de uso, store de estado, consultas puras y facades especializados con Angular Signals.
- `infrastructure`: persistencia, Firebase y adaptadores.
- `features`: pantallas de tareas y categorías.
- `core`: configuración y servicios transversales singleton.
- `shared`: piezas reutilizables sin reglas de negocio.

La UI depende de abstracciones mediante inyección de dependencias. Se usan Repository, Use Case, Adapter, Store, Query y Facade. `TaskBoardStore` conserva únicamente el estado compartido; `TaskListFacade` coordina carga y lectura, `TaskCommandFacade` las mutaciones de tareas y `CategoryCommandFacade` las mutaciones de categorías. `TaskBoardFeedbackService` centraliza errores de aplicación. La configuración remota se consume mediante `FeatureFlagService`; el SDK de Firebase queda aislado en infraestructura.

## Tecnologías y dependencias críticas

- Ionic 8, Angular 20.3.26 standalone, Angular CLI/build 20.3.32, TypeScript 5.9 estricto y RxJS 7.8.
- Cordova 13, Cordova Android 15 y Cordova iOS 8.1.
- Firebase JavaScript SDK 12.16 y Remote Config modular.
- Jasmine/Karma, ESLint, Prettier y `tsx` 4.23 para benchmarks.
- GitHub Actions con acciones oficiales fijadas por SHA, SBOM CycloneDX de npm y artifact attestations GitHub/Sigstore.

Cordova está deprecado en Ionic, pero es requisito explícito de la prueba y se mantiene fijado localmente para builds reproducibles.

La auditoría npm de producción no reporta vulnerabilidades. La auditoría completa conserva avisos moderados transitivos de `uuid` en herramientas Cordova/webpack sin corrección compatible; no se usa `npm audit fix --force` porque propone cambios regresivos o fuera de rango.

## Repositorio

- `src/app/domain`: modelos, reglas, factories, errores y contratos de repositorio.
- `src/app/application`: configuración tipada, casos de uso, providers, store, consultas y facades especializados.
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
- `.github/workflows`: CI continua y release Android firmada/atestada.
- `docs`: procedimiento de firma y exportación iOS en macOS.
- `DELIVERY_CHECKLIST.md`: matriz auditable contra el PDF.
- `resources`: iconos adaptativos, monocromáticos, fallbacks y splash nativos.
- `config.xml`: configuración Cordova.
- `tools`: benchmark reproducible, control de seguridad y automatización de Remote Config y firma/verificación Android.
- PDF de la prueba: especificación original.

No se versionan `node_modules`, `www`, `platforms`, `plugins`, `coverage`, `tmp`, `.local-signing` ni `build.json`.

## Convenciones

- Código, identificadores, archivos, rutas internas, pruebas y commits en inglés.
- Interfaz y accesibilidad en español.
- TypeScript estricto; evitar `any`.
- Componentes sin reglas de negocio ni acceso directo a almacenamiento/Firebase.
- Inmutabilidad, funciones pequeñas e inyección de dependencias.
- Commits Conventional Commits en inglés y ramas `feature/`, `fix/`, `refactor/` o `docs/`.
- Tags de entrega `vMAJOR.MINOR.PATCH`; la versión debe coincidir en `package.json` y `config.xml`.
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

- La pantalla principal consulta el tablero mediante `TaskListFacade` y envía comandos mediante `TaskCommandFacade` y `CategoryCommandFacade`.
- Se pueden crear tareas con o sin categoría.
- Se pueden completar y eliminar tareas.
- Se pueden crear, editar y eliminar categorías.
- El filtro por categoría permite ver todas las tareas, tareas sin categoría o tareas de una categoría específica.
- Cuando `task_search_enabled` está activa, el buscador filtra por título dentro del filtro de categoría seleccionado.
- La UI renderiza inicialmente 30 tareas y amplía la ventana en lotes de 30 mediante “Mostrar más”. Cambiar filtro o búsqueda reinicia la ventana.
- Los formularios visibles están en español; identificadores, métodos y archivos se mantienen en inglés.
- Cada creación o mutación por entidad expone un estado pendiente explícito. Los controles afectados se deshabilitan durante la operación y los campos solo se limpian después de una confirmación exitosa.

## Estrategia de rendimiento

- `TaskBoardStore` y los tres facades usan Angular Signals; `HomePage` usa `ChangeDetectionStrategy.OnPush`.
- Contadores de estado se calculan juntos en una sola iteración.
- Las categorías se indexan en un `Map` para lookup O(1) durante el render.
- Crear, completar, eliminar o editar actualiza Signals con el resultado del caso de uso, sin releer ni reordenar el repositorio completo.
- Eliminar una categoría sí recarga ambas colecciones porque la regla desacopla tareas afectadas dentro del repositorio.
- `selectTaskListPage` cuenta coincidencias y retiene únicamente la ventana solicitada en una sola pasada cuando hay filtros, evitando materializar un arreglo filtrado completo para renderizar 30 elementos.
- El render incremental limita nodos Ionic y memoria visual sin asumir una altura fija de fila.
- `npm run benchmark` mide los algoritmos reales, incluida la selección de página, con 50.000 tareas y emite JSON con runtime, memoria aproximada y tiempos.

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
- La allowlist Cordova limita navegación de red a Firebase Installations y Firebase Remote Config; no existen intents HTTP/HTTPS comodín.
- `src/index.html` aplica una Content Security Policy restrictiva. `npm run security:check` impide regresiones hacia orígenes comodín o una política `connect-src` abierta.
- Cordova core provee WebView, splash, teclado básico y barras del sistema; no hay plugins Cordova instalados porque la aplicación no consume APIs nativas adicionales.
- Android usa splash vectorial moderno e iconos adaptativos con capa monocromática; los PNG por densidad son fallback para API 24 y 25.
- La firma release local usa PKCS#12, RSA de 3072 bits y APK Signature Scheme v2. `.local-signing` y `build.json` contienen material sensible local y nunca se versionan.
- El APK release firmado se genera en `platforms/android/app/build/outputs/apk/release/app-release.apk` y se valida con `apksigner`.
- El workflow de release reconstruye el APK desde el tag usando cuatro GitHub Secrets, material efímero y permisos mínimos; nunca imprime ni publica la llave o sus contraseñas.
- Release Android vigente: `v0.1.2`, con APK, `SHA256SUMS.txt`, SBOM CycloneDX y attestations de provenance/SBOM verificables mediante GitHub CLI.
- El asset público `nequi-tasks-v0.1.2.apk` tiene SHA-256 `bf07978620c4257715f347c6bf5a5d954858e288c2ec77d4cd26dc91ae82a9bf`; el smoke físico final cubrió creación/asignación, búsqueda remota activa, completado, persistencia, fallback offline y eliminación.
- Una instalación debug no puede actualizarse directamente con la release porque usa otro certificado. Deben respaldarse los datos relevantes y desinstalar el paquete anterior antes de instalar la release.
- Las capturas de aceptación se obtienen con ADB en el Samsung físico y se conservan en `evidence/android`; no se registra el serial del dispositivo.
- La llave generada localmente sirve para la entrega técnica; debe respaldarse de forma segura porque perderla impide actualizar una instalación firmada con ella.
- Cordova Android 15.0.0, última versión disponible, aún usa APIs Java y construcciones Gradle deprecadas; las advertencias provienen de `CordovaLib`, no del código ni de plugins del proyecto.
- Karma genera HTML, LCOV y resumen JSON; CI exige al menos 85 % de sentencias, 65 % de ramas, 85 % de funciones y 85 % de líneas.
- Un IPA firmado requiere macOS, Xcode, cuenta Apple Developer, certificados y perfiles. El procedimiento seguro, el preflight y la plantilla no sensible están en `docs/IOS_RELEASE.md`, `tools/verify-ios-release-environment.sh` y `tools/ios-release.build.example.json`. TestFlight es la distribución pública recomendada; un IPA `ad-hoc` con UDID debe entregarse por canal privado.

## Autenticación y autorización

No forman parte del alcance. Los datos pertenecen a la instalación local.
