# Mis tareas 0.1.2

Release correctiva Android de la aplicación Ionic para gestión de tareas y categorías, preparada a partir de las observaciones de la evaluación técnica.

## Correcciones principales

- Separación del tablero en store compartido y facades especializados para lectura, comandos de tareas y comandos de categorías.
- Estados asíncronos explícitos para creación y operaciones por entidad, con prevención de solicitudes duplicadas y conservación de formularios ante errores.
- Cobertura ampliada a 55 pruebas, incluidos casos de uso, store, concurrencia, CRUD de categorías e interacciones críticas de la pantalla principal.
- Umbrales obligatorios de cobertura para sentencias, ramas, funciones y líneas.
- Selección eficiente de la ventana renderizada en una sola pasada para listas filtradas.
- Benchmark reproducible sobre 50.000 tareas usando el mismo selector de producción.
- Allowlist Cordova limitada a los endpoints Firebase utilizados y Content Security Policy restrictiva.
- Validación automática contra regresiones de seguridad mediante `npm run security:check`.
- Constantes compartidas para colores, validación de categorías y tamaño de los lotes de render.

## Funcionalidad conservada

- Creación, finalización y eliminación de tareas.
- Creación, edición, eliminación, asignación y filtro de categorías.
- Persistencia local versionada y funcionamiento offline.
- Búsqueda por título controlada por Firebase Remote Config mediante `task_search_enabled`.
- Interfaz responsive en español y código fuente en inglés.

## Validación automatizada

- Format, lint, typecheck y validación de seguridad aprobados.
- 55 pruebas automatizadas aprobadas.
- Cobertura global superior a los umbrales configurados.
- Benchmark, build web y build Android aprobados.
- Auditoría de dependencias de producción sin vulnerabilidades.
- GitHub Actions construye el APK desde el tag con material de firma cifrado en GitHub Secrets.

## Cadena de suministro

- APK: `nequi-tasks-v0.1.2.apk`.
- SBOM CycloneDX: `nequi-tasks-v0.1.2.sbom.cdx.json`.
- Checksums: `SHA256SUMS.txt`.
- Provenance de build y asociación SBOM verificables con GitHub CLI:

  ```bash
  gh attestation verify nequi-tasks-v0.1.2.apk --repo michaelzapatap/prueba-tecnica-nequi
  ```

## Validación física

El protocolo de smoke sobre el asset público exacto se ejecuta después de que GitHub Actions publica esta release. Sus resultados y capturas se incorporan a `evidence/README.md` sin alterar el tag ni el binario atestado.

## Limitación conocida

El IPA firmado requiere macOS, Xcode y credenciales Apple Developer, por lo que no forma parte del asset Android de esta release. `docs/IOS_RELEASE.md` incluye el procedimiento reproducible para un Mac autorizado.
