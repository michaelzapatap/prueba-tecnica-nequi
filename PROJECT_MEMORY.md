# Memoria del proyecto

## Objetivo y alcance

Aplicación móvil híbrida para administrar tareas y categorías, desarrollada como prueba técnica. Debe demostrar funcionalidad, UX, calidad, rendimiento, Git e integración con Firebase Remote Config.

Permitirá crear, completar y eliminar tareas; crear, editar y eliminar categorías; asignar una categoría; filtrar y conservar todo localmente. La búsqueda será una mejora controlada remotamente.

## Estado actual

La base Ionic/Angular standalone existe. Cordova puede generar y preparar Android 15 e iOS 8.1. El dominio ejecutable, los modelos `Task` y `Category`, los contratos de repositorio, la persistencia local versionada, los casos de uso, el facade de aplicación y la pantalla principal funcional ya están implementados y cubiertos con pruebas unitarias. Firebase Remote Config, optimizaciones de listas grandes, evidencias visuales y binarios finales siguen pendientes.

## Arquitectura

Arquitectura por capas orientada a funcionalidades:

- `domain`: entidades, reglas y contratos sin dependencias de framework.
- `application`: casos de uso y facade de estado con Angular Signals.
- `infrastructure`: persistencia, Firebase y adaptadores.
- `features`: pantallas de tareas y categorías.
- `core`: configuración y servicios transversales singleton.
- `shared`: piezas reutilizables sin reglas de negocio.

La UI depende de abstracciones mediante inyección de dependencias. Se usan Repository, Use Case, Adapter y Facade. El estado reactivo se expone con Angular Signals en `TaskBoardFacade`.

## Tecnologías y dependencias críticas

- Ionic 8, Angular 20 standalone, TypeScript 5.9 estricto y RxJS 7.8.
- Cordova 13, Cordova Android 15 y Cordova iOS 8.1.
- Jasmine/Karma, ESLint y Prettier.
- Firebase Remote Config, pendiente de integración.

Cordova está deprecado en Ionic, pero es requisito explícito de la prueba y se mantiene fijado localmente para builds reproducibles.

## Repositorio

- `src/app/domain`: modelos, reglas, factories, errores y contratos de repositorio.
- `src/app/application`: casos de uso, providers y facades de estado.
- `src/app/infrastructure/persistence`: adaptador de persistencia local versionada.
- `src/app/home`: pantalla principal de tareas y categorías.
- `src/app`: shell y rutas Angular.
- `src/assets`: recursos web.
- `src/environments`: configuración pública por entorno.
- `src/theme`: tokens visuales.
- `resources`: iconos y splash nativos.
- `config.xml`: configuración Cordova.
- PDF de la prueba: especificación original.

No se versionan `node_modules`, `www`, `platforms`, `plugins`, `coverage` ni `tmp`.

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

## Flujos principales

- La pantalla principal carga tareas y categorías a través de `TaskBoardFacade`.
- Se pueden crear tareas con o sin categoría.
- Se pueden completar y eliminar tareas.
- Se pueden crear, editar y eliminar categorías.
- El filtro por categoría permite ver todas las tareas, tareas sin categoría o tareas de una categoría específica.
- Los formularios visibles están en español; identificadores, métodos y archivos se mantienen en inglés.

## Servicios externos y configuración

Firebase Remote Config controlará `task_search_enabled`, con valor predeterminado local y recuperación ante fallos. No se registrarán secretos ni credenciales de firma.

- ID nativo: `com.nequitasks.app`.
- Nombre visible: `Mis tareas`.
- Salida web Cordova: `www`.
- Android puede compilarse en Windows.
- El entorno actual necesita Android SDK Command-line Tools (`avdmanager`) y la plataforma SDK 36 antes de generar el APK.
- Un IPA firmado requiere macOS, Xcode, cuenta Apple Developer, certificados y perfiles.

## Autenticación y autorización

No forman parte del alcance. Los datos pertenecen a la instalación local.
