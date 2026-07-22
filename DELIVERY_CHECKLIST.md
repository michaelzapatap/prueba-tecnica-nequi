# Checklist final de evaluación

Auditoría realizada contra las tres páginas de `Prueba Técnica para Desarrollador Mobile - Aplicación Ionic.pdf` el 17 de julio de 2026.

Estados: **Cumplido**, **Parcial** o **Pendiente externo**.

## Requisitos funcionales

| Requisito del PDF                   | Estado   | Evidencia                                                                                                        |
| ----------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
| Agregar tareas                      | Cumplido | `CreateTaskUseCase`, pantalla principal, pruebas de comando/interacción y captura `06-task-category-filter.png`. |
| Marcar tareas como completadas      | Cumplido | `SetTaskCompletionUseCase`, pruebas y evidencia release `12-release-v0.1.2-persistence.png`.                     |
| Eliminar tareas                     | Cumplido | `DeleteTaskUseCase`, pruebas y limpieza física visible en `14-release-v0.1.2-delete-cleanup.png`.                |
| Persistencia local                  | Cumplido | Repositorios/esquema `v1`, pruebas y relanzamiento físico del APK release en evidencia `12`.                     |
| Crear, editar y eliminar categorías | Cumplido | Casos de uso, UI y captura física `05-category-management.png` con acciones editar/eliminar.                     |
| Asignar una categoría a cada tarea  | Cumplido | Selector, dominio y captura física `06-task-category-filter.png`.                                                |
| Filtrar tareas por categoría        | Cumplido | Segmentos dinámicos, consultas puras, pruebas y filtro “TRABAJO” visible en evidencia física.                    |

## Requisitos técnicos

| Requisito del PDF                    | Estado            | Evidencia                                                                                                                           |
| ------------------------------------ | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Repositorio Git público              | Cumplido          | `https://github.com/michaelzapatap/prueba-tecnica-nequi`.                                                                           |
| Desarrollo en una rama nueva         | Cumplido          | Rama `feature/project-foundation` e historial de commits cohesivos.                                                                 |
| Fork del repositorio base            | Parcial           | GitHub reporta `isFork=false`; el PDF y los remotos locales no identifican un upstream que pueda añadirse sin inventar procedencia. |
| Estructura Cordova Android/iOS       | Cumplido          | Cordova 13, Android 15, iOS 8.1, `config.xml` y recursos de ambas plataformas.                                                      |
| Instrucciones para ejecutar/compilar | Cumplido          | `README.md` y `docs/IOS_RELEASE.md`.                                                                                                |
| Firebase desde cuenta personal       | Cumplido          | Proyecto real `nequi-tasks-mz-20260717` y app web registrada.                                                                       |
| Feature flag Remote Config           | Cumplido          | `task_search_enabled`, plantilla versionada y scripts de publicación.                                                               |
| Demostración del feature flag        | Cumplido          | Capturas físicas de versiones remotas activada, desactivada y fallback offline en `evidence/android`.                               |
| Optimizar carga inicial              | Cumplido          | Carga local/remota en paralelo, timeout remoto y estado incremental.                                                                |
| Grandes cantidades de tareas         | Cumplido          | Render por lotes, selector de página en una pasada, consultas puras y benchmark de 50.000 tareas.                                   |
| Minimizar memoria                    | Cumplido          | DOM acotado, Signals/OnPush, caché de deserialización e índice de categorías.                                                       |
| APK exportado                        | Cumplido          | Asset público `v0.1.2` verificado por SHA-256, firma y attestations de provenance/SBOM; smoke físico completo.                      |
| IPA exportado                        | Pendiente externo | Requiere Mac y credenciales Apple; guía, preflight y rutas seguras TestFlight/`ad-hoc` en `docs/IOS_RELEASE.md`.                    |

## Entregables

| Entregable                                 | Estado            | Ubicación                                                                 |
| ------------------------------------------ | ----------------- | ------------------------------------------------------------------------- |
| Código fuente actualizado                  | Cumplido          | Repositorio público y tag `v0.1.2`.                                       |
| README con ejecución y cambios             | Cumplido          | `README.md`, `CHANGELOG.md` y `PROJECT_MEMORY.md`.                        |
| Capturas o video de funcionalidades nuevas | Cumplido          | `evidence/README.md` y catorce capturas del Samsung Galaxy S21 FE físico. |
| Respuestas técnicas                        | Cumplido          | `TECHNICAL_ANSWERS.md`.                                                   |
| Enlace de descarga APK                     | Cumplido          | GitHub Release `v0.1.2`.                                                  |
| Enlace de descarga IPA                     | Pendiente externo | Se añadirá después de ejecutar y validar la guía macOS.                   |

## Criterios de evaluación y controles adicionales

- **Funcionalidad:** reglas de tareas/categorías y fallback offline cubiertos por 55 pruebas.
- **Calidad:** TypeScript estricto, arquitectura por capas, facades con responsabilidad única, SOLID, ESLint, Prettier y umbrales de cobertura.
- **UX:** interfaz responsive en español, etiquetas accesibles, estados vacíos y feedback de carga/error.
- **Rendimiento:** benchmark reproducible, render incremental y métricas documentadas.
- **Creatividad:** búsqueda controlada remotamente, categorías con color y operación offline.
- **Versionamiento/nube:** Conventional Commits, Firebase real, plantilla Remote Config y GitHub Releases.
- **Automatización:** GitHub Actions valida formato, lint, tipos, política Cordova/CSP, auditoría, pruebas con cobertura, benchmark y build web.
- **Seguridad de runtime:** allowlist Cordova limitada a Firebase Installations/Remote Config, sin intents web comodín, y CSP restrictiva.
- **Cadena de suministro:** release Android construida desde tag, firma en secretos cifrados, CycloneDX, SHA-256 y attestations GitHub/Sigstore.
- **Seguridad de dependencias:** cero vulnerabilidades de producción; los avisos moderados restantes pertenecen al toolchain de desarrollo y están registrados para seguimiento.

## Resultado honesto

La entrega Android y web cumple los requisitos funcionales y técnicos verificables. No debe declararse cumplimiento total del PDF hasta generar y proporcionar el IPA firmado. El estado de fork tampoco puede afirmarse: el repositorio es público y usa rama de desarrollo, pero no está asociado a un upstream en GitHub.
