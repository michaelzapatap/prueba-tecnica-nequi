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
- Integración desacoplada de Firebase Remote Config mediante su SDK modular.
- Implementación de la bandera `task_search_enabled` con default local, caché y fallback offline.
- Implementación de búsqueda de tareas por título, combinable con el filtro de categoría.
- Pruebas unitarias de valores remotos, modo offline, Firebase no configurado y bandera desactivada.
- Caché en memoria para evitar deserializaciones repetidas del almacenamiento local.
- Actualizaciones incrementales de estado sin recargar el repositorio tras cada mutación de tarea.
- Renderizado incremental en lotes de 30, `OnPush`, contadores en una pasada y lookup de categorías indexado.
- Benchmark reproducible sobre 50.000 tareas mediante `npm run benchmark`.
- Ampliación a 34 pruebas, incluidas interacciones de pantalla y listas grandes.
- Instalación de JDK 17 y configuración persistente de `JAVA_HOME`, `CORDOVA_JAVA_HOME`, `ANDROID_HOME` y herramientas Android en `PATH`.
- Creación del emulador `Nequi_API_34`, compilación del APK debug e instalación/arranque verificados tanto en emulador como en dispositivo Android físico.
- Verificación visual en emulador y corrección del contraste forzando la paleta clara soportada actualmente.

## En progreso

- Sin tareas activas; la siguiente fase prioriza configuración Firebase real y endurecimiento Cordova.

## Pendiente

- Registrar la aplicación web en un proyecto Firebase personal, copiar su configuración pública y publicar `task_search_enabled` en Remote Config.
- Revisar los plugins Cordova heredados y la configuración de splash screen.
- Resolver avisos de seguridad de herramientas cuando existan versiones compatibles.
- Generar APK de release firmado y preparar la generación firmada del IPA.
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
