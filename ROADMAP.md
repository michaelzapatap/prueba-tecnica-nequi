# Hoja de ruta

## Completado

- Análisis completo de la especificación PDF.
- Creación de la aplicación Ionic/Angular standalone.
- Habilitación de Cordova y dependencias Android/iOS.
- Configuración inicial de TypeScript estricto, ESLint y Prettier.
- Creación de la documentación permanente.
- Validación satisfactoria de lint, tipos, pruebas y build de producción.
- Generación y preparación satisfactoria de Android 15 e iOS 8.1 con Cordova.
- Definición ejecutable del dominio y la arquitectura base.
- Implementación de modelos `Task` y `Category`.
- Implementación de contratos de repositorio para tareas y categorías.
- Implementación de persistencia local versionada con repositorios concretos.
- Cobertura unitaria inicial para factories de dominio, migración de almacenamiento y repositorios locales.
- Implementación de casos de uso de tareas y categorías.
- Implementación de `TaskBoardFacade` con Angular Signals.
- Implementación de pantalla principal para crear, completar y eliminar tareas.
- Implementación de creación, edición, eliminación, asignación y filtro por categorías.
- Construcción de una primera UX responsive y completamente en español.
- Pruebas unitarias de facade y arranque de la pantalla principal.

## En progreso

- Integración de Firebase Remote Config para la bandera `task_search_enabled`.

## Pendiente

- Integrar Firebase Remote Config y `task_search_enabled`.
- Optimizar listas grandes, carga inicial y memoria.
- Ampliar pruebas de integración, componentes e interacción de UI.
- Instalar Android SDK Command-line Tools y SDK 36 en el entorno de build.
- Revisar los plugins Cordova heredados y la configuración de splash screen.
- Resolver avisos de seguridad de herramientas cuando existan versiones compatibles.
- Generar APK y preparar la generación firmada del IPA.
- Crear evidencias visuales y respuestas técnicas.
- Publicar repositorio y enlaces de binarios.

## Backlog

- Acciones masivas.
- Ordenamiento configurable.
- Fechas límite y recordatorios.
- Exportación e importación de respaldo.

## Mejoras futuras

- Pruebas end-to-end en dispositivos reales.
- CI para calidad y builds.
- Runner macOS para el IPA firmado.
- Telemetría de rendimiento respetuosa de la privacidad.
