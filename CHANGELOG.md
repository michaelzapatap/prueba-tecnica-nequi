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
