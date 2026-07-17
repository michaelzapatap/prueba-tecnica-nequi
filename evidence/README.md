# Evidencias de validación

## Entorno

- Dispositivo físico: Samsung Galaxy S21 FE (`SM-G990E`).
- Sistema: Android 16, API 36, `arm64-v8a`.
- Aplicación: `com.nequitasks.app`; validación final sobre el APK publicado `v0.1.1`.
- Proyecto Firebase: `nequi-tasks-mz-20260717`.
- Plantilla: `firebase/remote-config.template.json`.
- Evidencias `01` a `06`: build debug de control con intervalo mínimo de fetch de 60 segundos.
- Evidencias `07` a `10`: asset release exacto `nequi-tasks-v0.1.1.apk` descargado desde GitHub Releases.

El serial ADB, las credenciales de Firebase y la llave de firma no forman parte de estas evidencias.

## Matriz verificada

| Caso        | Versión Remote Config | Condición                    | Resultado observado              | Evidencia                                                                    |
| ----------- | --------------------: | ---------------------------- | -------------------------------- | ---------------------------------------------------------------------------- |
| Activado    |             1, `true` | Dispositivo online           | Se muestra “Buscar tareas”       | [01-task-search-enabled.png](android/01-task-search-enabled.png)             |
| Desactivado |            2, `false` | Dispositivo online           | El buscador no se renderiza      | [02-task-search-disabled.png](android/02-task-search-disabled.png)           |
| Restaurado  |             3, `true` | Dispositivo online           | El buscador vuelve a mostrarse   | [03-task-search-restored.png](android/03-task-search-restored.png)           |
| Offline     |    Caché de versión 3 | Wi‑Fi y datos deshabilitados | El buscador permanece disponible | [04-task-search-offline-cache.png](android/04-task-search-offline-cache.png) |

Versiones publicadas el 17 de julio de 2026 a las 12:23, 12:30 y 12:32, hora de Colombia. El estado remoto final es `true`.

## Protocolo reproducible

1. Autenticar Firebase CLI con una cuenta autorizada: `firebase login`.
2. Construir una versión de evidencia: `npx ng build --configuration development` y `npx cordova build android --debug -- --packageType=apk`.
3. Instalar sin borrar datos: `adb install -r platforms/android/app/build/outputs/apk/debug/app-debug.apk`.
4. Ejecutar `npm run firebase:remote-config:enable`, esperar al menos 60 segundos desde el fetch anterior, forzar cierre y abrir la app.
5. Capturar la pantalla con `adb shell screencap -p /sdcard/evidence.png` y transferirla con `adb pull`; no redirigir la salida binaria desde el shell.
6. Repetir con `npm run firebase:remote-config:disable` y comprobar que el buscador desaparezca.
7. Publicar nuevamente `true`, esperar el intervalo, abrir online para activar y cachear el valor.
8. Deshabilitar temporalmente Wi‑Fi y datos, reiniciar la app y comprobar que el buscador siga visible por caché. Restaurar ambas conexiones inmediatamente.
9. Confirmar el estado final con `npm run firebase:remote-config:verify`.

La build release usa un intervalo de 12 horas para evitar fetches innecesarios. El intervalo corto se reserva para validación controlada.

## Categorías y tareas

| Caso                              | Resultado observado                                                                        | Evidencia                                                          |
| --------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Crear y administrar una categoría | “Trabajo” aparece con color y acciones de edición/eliminación                              | [05-category-management.png](android/05-category-management.png)   |
| Asignar y filtrar por categoría   | La tarea “Preparar entrega final” muestra “Trabajo” y el segmento dinámico correspondiente | [06-task-category-filter.png](android/06-task-category-filter.png) |

Estas acciones se ejecutaron sobre la build debug instalada en el Samsung físico. Para hacer la interacción repetible sin depender de coordenadas frágiles del WebView, se enviaron al formulario los mismos eventos DOM que emiten los controles Ionic; la creación siguió los casos de uso y repositorios reales de la aplicación. Las capturas se obtuvieron posteriormente con ADB. El dispositivo conserva estos datos únicamente en su almacenamiento local.

## Smoke final del APK publicado v0.1.1

El 17 de julio de 2026, aproximadamente entre las 17:03 y las 17:24 (America/Bogota), se descargó el asset público de la release `v0.1.1`, se verificó antes de instalar y se probó en el Samsung físico.

- Release: <https://github.com/michaelzapatap/prueba-tecnica-nequi/releases/tag/v0.1.1>
- Asset: `nequi-tasks-v0.1.1.apk`.
- SHA-256 verificado: `1a3ba55925a3cb112285563b7e44201a488884369d0d1a9503e928a8e33f2559`.
- Attestation: provenance SLSA v1 verificada con `gh attestation verify` contra el repositorio público.
- Paquete instalado: `com.nequitasks.app`, `versionName=0.1.1`, `versionCode=101`.
- La conectividad inicial y final fue Wi-Fi/datos habilitados; durante la prueba offline ambos valores se confirmaron en `0` y se restauraron a `1` inmediatamente después.

La instalación `adb install -r` detectó correctamente que la build debug previa y la release tenían certificados diferentes (`INSTALL_FAILED_UPDATE_INCOMPATIBLE`). Antes de desinstalar la build debuggable se creó un respaldo forense temporal mediante `run-as`; luego se instaló el APK release desde cero. El respaldo, el APK descargado y las capturas intermedias permanecieron en `tmp`, fuera de Git, y se eliminaron al cerrar la validación.

| Caso                  | Acción reproducible                                     | Resultado observado                                                      | Evidencia                                                                                |
| --------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Tareas y categorías   | Crear `Entrega`, crear `Smoke final v0.1.1` y asignarla | La tarea y su categoría aparecen en la vista `ENTREGA`                   | [07-release-v0.1.1-search-enabled.png](android/07-release-v0.1.1-search-enabled.png)     |
| Búsqueda activada     | Buscar `final` con `task_search_enabled=true`           | El buscador permanece visible y devuelve la tarea coincidente            | [07-release-v0.1.1-search-enabled.png](android/07-release-v0.1.1-search-enabled.png)     |
| Completar y persistir | Marcar la tarea, forzar cierre y relanzar               | Estado `Lista`, categoría y tarea sobreviven al reinicio del proceso     | [08-release-v0.1.1-persistence.png](android/08-release-v0.1.1-persistence.png)           |
| Fallback offline      | Deshabilitar Wi-Fi/datos, relanzar y buscar `final`     | La búsqueda cacheada funciona y los datos locales permanecen disponibles | [09-release-v0.1.1-offline-fallback.png](android/09-release-v0.1.1-offline-fallback.png) |
| Eliminación           | Eliminar primero la tarea y luego `Entrega`             | No quedan tareas coincidentes ni categorías de prueba                    | [10-release-v0.1.1-delete-cleanup.png](android/10-release-v0.1.1-delete-cleanup.png)     |

### Protocolo exacto de instalación

```bash
gh release download v0.1.1 \
  --repo michaelzapatap/prueba-tecnica-nequi \
  --pattern nequi-tasks-v0.1.1.apk \
  --pattern SHA256SUMS.txt
grep 'nequi-tasks-v0.1.1.apk$' SHA256SUMS.txt | sha256sum --check -
gh attestation verify nequi-tasks-v0.1.1.apk \
  --repo michaelzapatap/prueba-tecnica-nequi
adb install -r nequi-tasks-v0.1.1.apk
```

Si Android devuelve `INSTALL_FAILED_UPDATE_INCOMPATIBLE`, existe una instalación firmada con otro certificado. Respalde primero cualquier dato importante, desinstale el paquete anterior y repita la instalación. Una app release no debuggable no permite extraer sus datos con `run-as`.

Las interacciones finales se enviaron como entradas táctiles y de teclado ADB sobre la WebView release no debuggable, equivalentes al uso manual en pantalla. No se habilitó depuración WebView ni se modificó el APK publicado.
