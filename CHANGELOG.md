# Historial de cambios

## 2026-07-22 07:54

### Refactored

La facade monolítica del tablero se dividió en `TaskListFacade`, `TaskCommandFacade` y `CategoryCommandFacade`. `TaskBoardStore` conserva exclusivamente las entidades compartidas y `TaskBoardFeedbackService` centraliza el feedback de errores. La pantalla principal ahora depende de estos servicios especializados.

### Fixed

Las operaciones asíncronas de creación y mutación exponen estados pendientes globales o por entidad, evitan solicitudes duplicadas, deshabilitan únicamente los controles afectados y conservan los datos ingresados si un caso de uso falla. Se añadieron constantes compartidas para colores de categoría y tamaño de lote.

### Performance

El selector `selectTaskListPage` cuenta coincidencias y retiene solo la ventana solicitada en una pasada cuando hay filtros, evitando crear un arreglo filtrado completo para renderizar el primer lote. El benchmark mide ahora este mismo camino de producción.

### Security

La allowlist Cordova quedó limitada a Firebase Installations y Firebase Remote Config; se retiraron intents externos comodín o no utilizados y se agregó una Content Security Policy restrictiva. `npm run security:check` protege estas invariantes en local y GitHub Actions.

### Changed

La suite se amplió de 34 a 55 pruebas para cubrir casos de uso, store, facades, concurrencia, CRUD de categorías e interacciones críticas de `HomePage`. Karma genera HTML, LCOV y JSON y exige mínimos globales de 85 % en sentencias, 65 % en ramas, 85 % en funciones y 85 % en líneas.

Archivos:

- `src/app/application/config`, `facades`, `queries`, `state`, `src/app/domain/config` y pruebas de casos de uso
- `src/app/home/home.page.ts`, `home.page.html` y `home.page.spec.ts`
- `src/app/testing/in-memory-repositories.ts`
- `config.xml`, `src/index.html` y `tools/validate-security-config.mjs`
- `angular.json`, `karma.conf.js`, `package.json`, `.github/workflows/ci.yml` y `tools/task-list.benchmark.ts`
- `PROJECT_MEMORY.md`, `CHANGELOG.md`, `ROADMAP.md`, `DECISIONS.md`, `README.md`, `TECHNICAL_ANSWERS.md` y `DELIVERY_CHECKLIST.md`

Motivo:

Resolver las seis observaciones recibidas del evaluador con cambios ejecutables y verificables en cobertura, control asíncrono, rendimiento, diseño SOLID, seguridad móvil y reutilización de constantes.

## 2026-07-17 17:30

### Added

Smoke final del asset público exacto `nequi-tasks-v0.1.1.apk` en un Samsung Galaxy S21 FE físico. Se verificaron SHA-256 y provenance SLSA antes de instalar, y se cubrieron creación/asignación de categoría, creación/búsqueda/completado/eliminación de tarea, persistencia tras cierre forzado y fallback sin Wi-Fi ni datos.

Se añadieron cuatro capturas finales reproducibles y un preflight macOS para validar Xcode, Node.js 22, Cordova, Bundle ID, identidades de firma y configuración local antes de generar el IPA.

### Changed

La guía iOS ahora separa TestFlight/App Store de distribución `ad-hoc`, preserva el tag inmutable al ejecutar el preflight desde `/tmp`, incorpora verificación de firma, Bundle ID, entitlements y perfil embebido, y documenta la publicación segura del IPA y su checksum. La instalación Android documenta la incompatibilidad esperada entre firmas debug y release.

### Security

La build debug previa se respaldó temporalmente antes de desinstalarla; el respaldo, APK descargado y capturas intermedias permanecieron fuera de Git y se eliminaron al terminar. La conectividad del dispositivo fue restaurada después del escenario offline. La guía iOS evita publicar un IPA `ad-hoc` que exponga UDID en `embedded.mobileprovision`.

Archivos:

- `evidence/README.md` y `evidence/android/07-*.png` a `10-*.png`
- `tools/verify-ios-release-environment.sh`, `package.json` y `docs/IOS_RELEASE.md`
- `DELIVERY_CHECKLIST.md` y `RELEASE_NOTES.md`
- `PROJECT_MEMORY.md`, `CHANGELOG.md`, `ROADMAP.md` y `README.md`

Motivo:

Validar el mismo binario entregado públicamente bajo condiciones reales, cerrar la evidencia funcional Android y preparar una ejecución iOS segura y guiada en macOS.

## 2026-07-17 15:45

### Added

Auditoría completa contra el PDF y checklist final con trazabilidad por requisito. Se añadieron dos evidencias físicas para administración de categorías y asignación/filtro de tareas, además de una guía segura y una plantilla no sensible para producir el IPA en macOS.

GitHub Actions ahora valida formato, lint, TypeScript, auditoría de producción, 34 pruebas, benchmark y build web. Un workflow separado construye releases Android desde tags, verifica la firma, genera SBOM CycloneDX y checksums, crea attestations GitHub/Sigstore y publica los assets.

### Security

Las acciones oficiales están fijadas por SHA y cada workflow usa permisos mínimos. El keystore base64, contraseñas y alias se suministran mediante GitHub Secrets, se reconstruyen solo en el directorio efímero del runner y se eliminan al finalizar. No se versiona material Apple o Android sensible.

Se actualizaron Angular CLI/build a `20.3.32` y el framework a `20.3.26`, eliminando los avisos altos detectados en herramientas de desarrollo. La auditoría de dependencias de producción reporta cero vulnerabilidades; permanecen avisos moderados transitivos de `uuid` en herramientas Cordova/webpack sin corrección compatible disponible.

### Changed

Versión alineada a `0.1.1` en npm y Cordova. Las notas de release y respuestas técnicas incorporan CI y cadena de suministro verificable.

El workflow Android resuelve `sdkmanager` desde `ANDROID_SDK_ROOT`/`ANDROID_HOME` y valida su ejecutable, compatible con la distribución de herramientas de los runners hospedados de GitHub. Además, genera `www` antes de restaurar la plataforma, requisito de Cordova en un checkout limpio. El verificador de firma localiza `apksigner` de forma portable en Linux y `apksigner.bat` en Windows. Las attestations reciben rutas explícitas del APK y SBOM para evitar ambigüedad de comodines.

Archivos:

- `.github/workflows/ci.yml` y `.github/workflows/android-release.yml`
- `DELIVERY_CHECKLIST.md`
- `docs/IOS_RELEASE.md` y `tools/ios-release.build.example.json`
- `evidence/README.md` y `evidence/android/05-*.png`, `06-*.png`
- `package.json`, `package-lock.json`, `config.xml` y `.gitignore`
- `TECHNICAL_ANSWERS.md` y `RELEASE_NOTES.md`
- `PROJECT_MEMORY.md`, `CHANGELOG.md`, `ROADMAP.md`, `DECISIONS.md` y `README.md`

Motivo:

Cerrar las brechas verificables de la entrega, automatizar sus controles y permitir que terceros validen la procedencia e inventario del APK sin exponer secretos.

## 2026-07-17 12:45

### Added

Conexión con el proyecto Firebase real `nequi-tasks-mz-20260717`, aplicación web pública y plantilla versionada de Remote Config. Se añadieron comandos reproducibles para publicar y consultar `task_search_enabled`, respuestas técnicas, notas de release y evidencias tomadas en un Samsung Galaxy S21 FE físico con Android 16.

Se validaron las versiones remotas 1 (`true`), 2 (`false`) y 3 (`true`). Las capturas demuestran la aparición y desaparición del buscador, además del fallback offline sobre el valor activado en caché. El estado remoto final quedó activado.

### Security

La sesión autenticada de Firebase, la autenticación de GitHub, las cuentas de servicio, la llave de firma, contraseñas y archivos de build sensibles permanecen fuera de Git. La configuración Firebase versionada contiene únicamente identificadores públicos necesarios para el cliente web.

### Docs

Se prepararon las respuestas a las preguntas exactas de la prueba, el protocolo de evidencia física y las notas de la versión Android. El APK firmado de 2.995.647 bytes y SHA-256 `3E38B6DC0DDA99BF5DD8311BDBC675B8403D9D8B16934D4AD24F5B4938A06E31` se organizó para su publicación como GitHub Release `v0.1.0`.

Archivos:

- `.firebaserc`, `firebase.json` y `firebase/remote-config.template.json`
- `src/environments/firebase-options.ts` y `src/environments/environment*.ts`
- `tools/publish-task-search-flag.ps1` y `package.json`
- `evidence/README.md` y `evidence/android/*`
- `TECHNICAL_ANSWERS.md` y `RELEASE_NOTES.md`
- `PROJECT_MEMORY.md`, `CHANGELOG.md`, `ROADMAP.md`, `DECISIONS.md` y `README.md`

Motivo:

Completar la integración externa exigida, demostrar de forma reproducible el comportamiento remoto y offline, y preparar una entrega verificable sin exponer secretos.

## 2026-07-17 11:30

### Changed

Modernización de la plataforma móvil: migración de Android al splash screen vectorial incorporado por Cordova 15, iconos adaptativos con variante monocromática, origen local HTTPS y paleta nativa clara. Se eliminaron los recursos Android heredados y los plugins `splashscreen`, `statusbar`, `device`, `ionic-keyboard` e `ionic-webview`, cuyas APIs no eran utilizadas por la aplicación.

Se corrigió la evidencia de ejecución: la instalación, el arranque, la inspección visual y la detección del contraste oscuro se realizaron en un Samsung Galaxy S21 FE físico; el AVD quedó solamente como opción configurada.

### Security

Automatización de firma Android release con llave PKCS#12 RSA de 3072 bits, contraseña aleatoria, material sensible excluido de Git y validación con `apksigner`. Se generó un APK release de 2.995.527 bytes, firmado mediante APK Signature Scheme v2.

Archivos:

- `config.xml`
- `package.json` y `package-lock.json`
- `.gitignore`
- `resources/android/*` y `resources/README.md`
- `tools/setup-android-release-signing.ps1`
- `tools/verify-android-release.ps1`
- `src/index.html`
- `PROJECT_MEMORY.md`, `CHANGELOG.md`, `ROADMAP.md`, `DECISIONS.md` y `README.md`

Motivo:

Eliminar configuración móvil obsoleta, reducir la superficie nativa, adoptar APIs actuales de Android y producir un binario release verificable sin exponer secretos de firma.

## 2026-07-15 22:10

### Added

Creación de la aplicación base con Ionic 8, Angular 20 standalone y soporte Cordova para Android e iOS. Se añadieron herramientas de formato, scripts de calidad, pruebas, preparación móvil y la documentación permanente.

Se verificaron lint, tipos estrictos, build de producción, pruebas unitarias y preparación de ambas plataformas. La auditoría de dependencias de producción no reportó vulnerabilidades.

Archivos:

- `package.json` y `package-lock.json`
- `angular.json`, `ionic.config.json` y `config.xml`
- `src/` y `resources/`
- `.prettierrc.json` y `.prettierignore`
- `PROJECT_MEMORY.md`, `CHANGELOG.md`, `ROADMAP.md`, `DECISIONS.md` y `README.md`

Motivo:

Establecer una base reproducible, estricta y documentada para implementar los requisitos de la prueba técnica.

## 2026-07-15 22:55

### Added

Implementación de la arquitectura de dominio inicial con modelos `Task` y `Category`, factories de reglas de negocio, contratos de repositorio, persistencia local versionada y pruebas unitarias.

Archivos:

- `src/app/domain/errors/domain-error.ts`
- `src/app/domain/factories/*`
- `src/app/domain/models/*`
- `src/app/domain/repositories/*`
- `src/app/domain/services/*`
- `src/app/infrastructure/persistence/*`
- `src/main.ts`
- `PROJECT_MEMORY.md`, `CHANGELOG.md`, `ROADMAP.md`, `DECISIONS.md` y `README.md`

Motivo:

Crear una base de negocio testeable y desacoplada de Ionic para soportar los flujos de tareas, categorías y persistencia offline.

## 2026-07-16 07:25

### Added

Implementación de los casos de uso de tareas y categorías, `TaskBoardFacade` con Angular Signals y pantalla principal funcional en español para gestionar tareas y categorías.

Archivos:

- `src/app/application/*`
- `src/app/home/home.page.ts`
- `src/app/home/home.page.html`
- `src/app/home/home.page.scss`
- `src/app/home/home.page.spec.ts`
- `src/main.ts`
- `PROJECT_MEMORY.md`, `CHANGELOG.md`, `ROADMAP.md`, `DECISIONS.md` y `README.md`

Motivo:

Entregar los flujos obligatorios de creación, finalización, eliminación, asignación y filtrado sobre la arquitectura desacoplada del proyecto.

## 2026-07-16 07:59

### Added

Integración de Firebase Remote Config mediante el SDK modular y abstracciones de aplicación/infraestructura. Se añadió la bandera `task_search_enabled`, búsqueda reactiva por título combinada con categorías y fallback offline basado en caché o default local.

Se incorporaron pruebas para configuración ausente, valor remoto, fallo de red, entorno no soportado y bandera desactivada. La suite quedó en 25 pruebas y se validaron formato, lint, tipos y build de producción.

Archivos:

- `package.json` y `package-lock.json`
- `src/app/application/feature-flags/*`
- `src/app/application/facades/task-board.facade.ts` y sus pruebas
- `src/app/infrastructure/remote-config/*`
- `src/app/home/*`
- `src/environments/*`
- `src/main.ts`
- `PROJECT_MEMORY.md`, `CHANGELOG.md`, `ROADMAP.md`, `DECISIONS.md` y `README.md`

Motivo:

Permitir que Firebase active o desactive una mejora visible sin comprometer el arranque, la funcionalidad offline ni el desacoplamiento de la aplicación.

## 2026-07-16 08:55

### Performance

Optimización de listas grandes mediante caché de deserialización, actualizaciones incrementales de Signals, contadores en una pasada, categorías indexadas, `OnPush` y renderizado en lotes de 30. Se añadió un benchmark reproducible de 50.000 tareas y pruebas de interacción que elevaron la suite a 34 casos.

También se habilitó el entorno Android: instalación de JDK 17, configuración de SDK/variables, creación del AVD opcional `Nequi_API_34`, compilación del APK debug e instalación verificada en un dispositivo físico. La inspección visual en ese dispositivo detectó y corrigió el contraste inconsistente bajo modo oscuro.

Archivos:

- `src/app/application/queries/*`
- `src/app/application/facades/task-board.facade.ts` y sus pruebas
- `src/app/infrastructure/persistence/versioned-local-store.ts` y sus pruebas
- `src/app/home/*`
- `src/global.scss` y `src/theme/variables.scss`
- `tools/task-list.benchmark.ts`
- `package.json` y `package-lock.json`
- `PROJECT_MEMORY.md`, `CHANGELOG.md`, `ROADMAP.md`, `DECISIONS.md` y `README.md`

Motivo:

Mantener una carga y navegación fluidas con volúmenes grandes, reducir memoria de render, medir regresiones y habilitar ciclos reales de prueba web/Android.
