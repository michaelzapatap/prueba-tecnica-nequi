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
- Creación del AVD `Nequi_API_34` como opción local de pruebas.
- Compilación del APK debug e instalación, arranque e inspección visual verificados en un Samsung Galaxy S21 FE físico.
- Corrección del contraste detectado en el dispositivo físico, forzando la paleta clara soportada actualmente.
- Migración al splash screen vectorial de Cordova Android 15 y a iconos adaptativos con variante monocromática.
- Eliminación de plugins Cordova obsoletos o no utilizados y adopción del WebView HTTPS incorporado por Cordova.
- Estrategia segura de firma local con material ignorado por Git, llave PKCS#12/RSA 3072 y verificación mediante `apksigner`.
- Generación satisfactoria del APK release firmado con APK Signature Scheme v2.
- Creación del proyecto Firebase `nequi-tasks-mz-20260717` y registro de la aplicación web real.
- Versionado y publicación de `task_search_enabled` mediante Firebase CLI.
- Validación física de los estados activado, desactivado y offline en un Samsung Galaxy S21 FE con Android 16.
- Captura de evidencias reproducibles y preparación de las respuestas técnicas de la prueba.
- Publicación del APK firmado en GitHub Releases sin llaves, contraseñas ni cuentas de servicio.
- Evidencias físicas adicionales de creación/administración de categorías y asignación/filtro de tareas.
- Descarga, verificación SHA-256/attestation, instalación y smoke completo del APK público exacto `v0.1.1` en el Samsung físico, incluyendo persistencia, offline y limpieza.
- Auditoría punto por punto contra las tres páginas del PDF y checklist de entrega trazable.
- GitHub Actions para formato, lint, tipos, auditoría, pruebas, benchmark y build web.
- Workflow de release Android desde tag con firma efímera, SBOM CycloneDX, checksums y attestations GitHub/Sigstore.
- Guía y plantilla segura para generar, verificar y publicar el IPA desde macOS.
- Actualización de seguridad compatible de Angular; auditoría de producción sin vulnerabilidades y eliminación de avisos altos del toolchain.

## En progreso

- Sin tareas activas.

## Pendiente

- Actualizar las dependencias transitivas `uuid` de Cordova/webpack cuando sus proveedores publiquen una corrección compatible.
- Ejecutar en macOS el preflight, definir TestFlight o distribución `ad-hoc` privada, generar el IPA firmado, completar el smoke iOS y publicar el enlace seguro.
- Asociar el repositorio como fork solo si el evaluador proporciona el upstream original correcto.

## Backlog

- Acciones masivas.
- Ordenamiento configurable.
- Fechas límite y recordatorios.
- Exportación e importación de respaldo.

## Mejoras futuras

- Automatizar pruebas end-to-end en dispositivos reales.
- Runner macOS para el IPA firmado.
- Telemetría de rendimiento respetuosa de la privacidad.
