# Mis tareas 0.1.1

Entrega final Android de la aplicación Ionic para gestión de tareas y categorías.

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
- Build reproducido desde el tag por GitHub Actions con material de firma cifrado en GitHub Secrets.

## Validación

- Format, lint y typecheck aprobados.
- 34 pruebas automatizadas aprobadas.
- Build web y Android release aprobados.
- Auditoría de dependencias de producción sin vulnerabilidades.
- Estados Remote Config activado, desactivado y offline verificados en un Samsung Galaxy S21 FE físico.
- CRUD, asignación y filtro de categorías evidenciados en el mismo dispositivo físico.
- Asset público exacto `v0.1.1` verificado con SHA-256 `1a3ba55925a3cb112285563b7e44201a488884369d0d1a9503e928a8e33f2559` y attestation SLSA.
- Smoke release físico aprobado: creación/asignación, búsqueda, completado, reinicio persistente, fallback offline y eliminación.

## Cadena de suministro

- APK: `nequi-tasks-v0.1.1.apk`.
- SBOM CycloneDX: `nequi-tasks-v0.1.1.sbom.cdx.json`.
- Checksums: `SHA256SUMS.txt`.
- Provenance de build y asociación SBOM verificables con GitHub CLI:

  ```bash
  gh attestation verify nequi-tasks-v0.1.1.apk --repo michaelzapatap/prueba-tecnica-nequi
  ```

## Limitación conocida

El IPA firmado requiere macOS, Xcode y credenciales Apple Developer, por lo que no forma parte del asset Android de esta release. `docs/IOS_RELEASE.md` incluye preflight y rutas seguras para TestFlight o distribución `ad-hoc` privada.
