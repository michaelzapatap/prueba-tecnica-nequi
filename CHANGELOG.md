# Historial de cambios

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
