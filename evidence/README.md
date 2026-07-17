# Evidencias de validación

## Entorno

- Dispositivo físico: Samsung Galaxy S21 FE (`SM-G990E`).
- Sistema: Android 16, API 36, `arm64-v8a`.
- Aplicación: `com.nequitasks.app` instalada por ADB.
- Proyecto Firebase: `nequi-tasks-mz-20260717`.
- Plantilla: `firebase/remote-config.template.json`.
- Build de evidencia: configuración Angular `development`, con intervalo mínimo de fetch de 60 segundos.

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
