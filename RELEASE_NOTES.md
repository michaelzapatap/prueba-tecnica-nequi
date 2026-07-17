# Mis tareas 0.1.0

Primera entrega evaluable de la aplicación Ionic para gestión de tareas y categorías.

## Funcionalidad

- Creación, finalización y eliminación de tareas.
- Creación, edición, eliminación, asignación y filtro de categorías.
- Persistencia local versionada y funcionamiento offline.
- Búsqueda por título controlada por Firebase Remote Config mediante `task_search_enabled`.
- Renderizado incremental y optimizaciones verificadas con 50.000 tareas.
- Interfaz responsive en español y código fuente en inglés.

## Android

- Cordova Android 15, splash screen moderno e iconos adaptativos.
- APK release firmado con RSA 3072 y APK Signature Scheme v2.
- Firma verificada con `apksigner`.

## Validación

- Format, lint y typecheck aprobados.
- 34 pruebas automatizadas aprobadas.
- Build web y Android release aprobados.
- Auditoría de dependencias de producción sin vulnerabilidades.
- Estados Remote Config activado, desactivado y offline verificados en un Samsung Galaxy S21 FE físico.

## Integridad del APK

- Archivo: `nequi-tasks-v0.1.0.apk`.
- Tamaño: 2.995.647 bytes.
- SHA-256: `3E38B6DC0DDA99BF5DD8311BDBC675B8403D9D8B16934D4AD24F5B4938A06E31`.

## Limitación conocida

El IPA firmado requiere macOS, Xcode y credenciales Apple Developer, por lo que no forma parte del asset Android de esta release.
