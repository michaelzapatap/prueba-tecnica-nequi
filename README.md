# Mis tareas

[![Continuous integration](https://github.com/michaelzapatap/prueba-tecnica-nequi/actions/workflows/ci.yml/badge.svg?branch=feature%2Fproject-foundation)](https://github.com/michaelzapatap/prueba-tecnica-nequi/actions/workflows/ci.yml)
[![Release Android](https://github.com/michaelzapatap/prueba-tecnica-nequi/actions/workflows/android-release.yml/badge.svg)](https://github.com/michaelzapatap/prueba-tecnica-nequi/actions/workflows/android-release.yml)

Aplicación híbrida de gestión de tareas y categorías para la prueba técnica mobile. El código utiliza identificadores en inglés y la interfaz se presenta en español.

## Características

- Crear, completar y eliminar tareas.
- Administrar categorías, asignarlas y filtrar por ellas.
- Persistir localmente y funcionar sin conexión.
- Habilitar búsqueda con Firebase Remote Config.
- Manejar listados grandes eficientemente.
- Compilar Android e iOS con Cordova.

La base técnica, el dominio, la persistencia local versionada, la pantalla principal funcional y la integración de Remote Config están implementados. Consulte `ROADMAP.md` para el estado exacto.

## Tecnologías y arquitectura

Ionic 8, Angular 20 standalone, TypeScript 5.9, Firebase JavaScript SDK 12.16, Cordova 13, Android 15, iOS 8.1, Jasmine/Karma, ESLint y Prettier.

Se usa arquitectura por capas: dominio independiente de Ionic, casos de uso en aplicación, `TaskBoardFacade` con Angular Signals, repositorios y feature flags como contratos, y persistencia/Firebase como adaptadores. El store `v1` usa caché de deserialización sobre `localStorage`; la UI aplica `OnPush` y renderiza las tareas en lotes de 30. Detalles en `PROJECT_MEMORY.md` y `DECISIONS.md`.

## Requisitos

- Node.js `>=20.17.0` o `>=22.9.0` y npm 10+.
- Para Android: JDK 17, SDK Platform 36, Build Tools 36.0.0, Command-line Tools, `JAVA_HOME` y `ANDROID_HOME`.
- Para iOS: macOS, Xcode, Command Line Tools y credenciales Apple Developer.
- Para publicar Remote Config: Firebase CLI 15 o posterior y una cuenta autorizada en el proyecto.

Windows no puede compilar ni firmar un IPA.

El entorno de desarrollo actual ya tiene Temurin 17.0.19, Android Studio, SDK 36, Build Tools 36.0.0 y el AVD opcional `Nequi_API_34`. Las variables se guardaron para el usuario de Windows; abra una terminal nueva para heredarlas. La validación funcional y visual realizada hasta ahora corresponde a un Samsung Galaxy S21 FE físico, no al emulador.

## Instalación

```bash
git clone https://github.com/michaelzapatap/prueba-tecnica-nequi.git
cd prueba-tecnica-nequi
npm ci
```

## Configuración y variables de entorno

La aplicación está conectada al proyecto Firebase `nequi-tasks-mz-20260717`. La configuración web pública se centraliza en `src/environments/firebase-options.ts`; los timeouts, intervalos y defaults tipados permanecen en `environment.ts` y `environment.prod.ts`.

La plantilla versionada `firebase/remote-config.template.json` define el booleano `task_search_enabled`. Para consultarlo o publicarlo:

```bash
npm install --global firebase-tools
firebase login
npm run firebase:remote-config:verify
npm run firebase:remote-config:disable
npm run firebase:remote-config:enable
```

El último comando debe ejecutarse al finalizar una demostración para conservar la búsqueda activada. En desarrollo se permite un fetch por minuto; producción usa un intervalo de 12 horas.

El fallback incluido es `true`: la búsqueda permanece disponible si falta configuración, no hay conexión, Remote Config no es soportado o el fetch excede 3 segundos. Si existe un valor activado en caché, Firebase lo conserva y lo usa antes del default local.

El objeto de configuración web identifica el proyecto y no es una cuenta de servicio. Nunca registre tokens de sesión, cuentas de servicio, claves privadas, certificados ni contraseñas. El ID nativo es `com.nequitasks.app` y el nombre visible es `Mis tareas`.

## Ejecución local

```bash
npm start
```

Normalmente estará disponible en `http://localhost:4200`.

Para verla desde otro teléfono en la misma red Wi-Fi:

```bash
npm run start:network
```

Consulte la IPv4 del computador con `ipconfig` y abra `http://<ipv4>:4200` en el teléfono. Si Windows lo solicita, permita Node.js en redes privadas. Para simular tamaños de pantalla en Chrome use DevTools > Toggle device toolbar.

## Calidad y pruebas

```bash
npm run lint
npm run typecheck
npm test
npm run test:ci
npm run format:check
```

`test:ci` requiere Chrome o Chromium compatible con Karma. La suite actual contiene 34 pruebas y valida dominio, migración/caché de almacenamiento, repositorios, facade, búsqueda, Remote Config, lotes grandes e interacciones de pantalla.

Las respuestas solicitadas por la prueba están en [TECHNICAL_ANSWERS.md](TECHNICAL_ANSWERS.md). La matriz y las diez capturas realizadas en el Samsung físico están en [evidence/README.md](evidence/README.md), incluido el smoke final del APK público exacto `v0.1.1`.

### Integración continua

`.github/workflows/ci.yml` ejecuta en cada push y pull request:

- Prettier, ESLint, TypeScript y auditoría de dependencias de producción.
- Pruebas unitarias/de interacción con cobertura.
- Benchmark de 50.000 tareas y build web de producción.

Los reportes de cobertura, benchmark y `www` se conservan como artefactos temporales de GitHub Actions. El workflow usa permisos de solo lectura y acciones oficiales fijadas por SHA.

`npm audit --omit=dev` reporta cero vulnerabilidades. La auditoría completa conserva avisos moderados transitivos de `uuid` en herramientas Cordova/webpack sin una actualización compatible; no afectan el bundle de producción y se mantienen registrados en `ROADMAP.md` para seguimiento.

## Rendimiento reproducible

```bash
npm run benchmark
```

El benchmark ejecuta las consultas reales con 50.000 tareas y entrega JSON. La referencia obtenida en Windows x64 con Node.js 22.17 fue: dataset aproximado de 10 MB, ordenamiento promedio de 6,9 ms, conteo de 0,4–0,6 ms, búsqueda de 1,3 ms y slice de 30 filas por debajo de 0,01 ms. Los valores son orientativos y deben compararse en la misma máquina/runtime.

## Compilación

Web:

```bash
npm run build
```

La salida optimizada se genera en `www`.

Plataformas, que se generan localmente y no se versionan:

```bash
npx cordova platform add android@15.0.0
npx cordova platform add ios@8.1.1
npm run cordova:prepare
```

Android:

```bash
npm run android:build
```

El APK debug queda en:

```text
platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

### Generar y verificar un APK release firmado

Para una entrega técnica local reproducible:

```bash
npm run android:release
```

La primera ejecución crea una llave PKCS#12 RSA de 3072 bits con contraseña aleatoria dentro de `.local-signing/`, genera el `build.json` local, construye el APK release y valida su firma con `apksigner`. Estos archivos sensibles están ignorados por Git. No copie sus valores a commits, logs, tickets ni documentación.

El APK firmado queda en:

```text
platforms/android/app/build/outputs/apk/release/app-release.apk
```

También puede ejecutar las fases por separado:

```bash
npm run android:signing:setup
npm run android:build:release
npm run android:verify:release
```

Respalde la llave en un almacén seguro: sin la misma llave no podrá publicar una actualización sobre una instalación existente. En CI o producción, aprovisione una llave institucional desde el gestor de secretos y genere `build.json` solo durante el job. La llave local creada por el script es adecuada para esta entrega técnica, no sustituye una política organizacional de custodia y rotación.

### Release Android reproducible y verificable

Al subir un tag `vMAJOR.MINOR.PATCH`, `.github/workflows/android-release.yml` comprueba que coincida con `package.json`, construye el APK firmado y publica:

- `nequi-tasks-vX.Y.Z.apk`.
- `nequi-tasks-vX.Y.Z.sbom.cdx.json` en formato CycloneDX.
- `SHA256SUMS.txt`.
- Attestations de provenance y SBOM vinculadas al repositorio, commit y workflow.

La firma se aprovisiona mediante `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` y `ANDROID_KEY_PASSWORD` en GitHub Secrets. El runner crea el keystore y `build.json` de forma efímera y los elimina incluso si falla el job.

Para verificar una descarga de `v0.1.1`:

```bash
gh release download v0.1.1 --repo michaelzapatap/prueba-tecnica-nequi
sha256sum --check SHA256SUMS.txt
gh attestation verify nequi-tasks-v0.1.1.apk --repo michaelzapatap/prueba-tecnica-nequi
# SHA-256 esperado del APK:
# 1a3ba55925a3cb112285563b7e44201a488884369d0d1a9503e928a8e33f2559
```

Una attestation prueba procedencia e integridad respecto del workflow; no sustituye revisión de código, pruebas ni análisis de vulnerabilidades.

Cordova Android 15.0.0 todavía emite avisos de deprecación desde `CordovaLib` y sus scripts Gradle. Es la última versión publicada; el proyecto no los silencia ni modifica código generado. La advertencia heredada de `<splash>` y las originadas por plugins antiguos sí fueron eliminadas.

### Probar en emulador Android

```bash
npm run android:requirements
emulator -avd Nequi_API_34
npm run android:run:emulator
```

También puede abrir Android Studio > Device Manager y ejecutar `Nequi_API_34` antes del último comando.

### Probar en dispositivo Android físico

1. Active Opciones de desarrollador y Depuración USB en el teléfono.
2. Conecte el cable USB y acepte la huella RSA mostrada por Android.
3. Verifique y despliegue:

```bash
npm run android:devices
npm run android:run:device
```

Si aparece `unauthorized`, desbloquee el teléfono y acepte nuevamente el diálogo RSA. El APK público exacto `v0.1.1` se verificó, instaló y probó por ADB en un Samsung Galaxy S21 FE físico. El smoke cubrió tareas, categorías, búsqueda, completado, persistencia, fallback offline y eliminación; las conexiones deshabilitadas para la prueba se restauraron al finalizar.

Una instalación debug y una release usan firmas diferentes. Para instalar el APK release sobre un equipo que tenga la versión debug es necesario desinstalar primero la app, lo cual elimina sus datos locales; respalde las tareas importantes antes de hacerlo.

iOS desde macOS:

```bash
npm ci
npm run ios:release:preflight
npm run ios:prepare
npx cordova build ios --release --buildConfig=build.ios.local.json
```

La firma final necesita credenciales del responsable de la entrega. El procedimiento completo para elegir la distribución, generar, inspeccionar, verificar y publicar el IPA está en [docs/IOS_RELEASE.md](docs/IOS_RELEASE.md); `tools/ios-release.build.example.json` es una plantilla sin secretos. TestFlight es la ruta pública recomendada. Un IPA `ad-hoc` puede incluir UDID en su perfil y debe entregarse por un canal privado.

## Estructura

```text
src/app/application/
                  Casos de uso, providers y facades
src/app/application/queries/
                  Consultas puras para listas y contadores
src/app/domain/   Modelos, reglas y contratos de negocio
src/app/infrastructure/persistence/
                  Persistencia local versionada
src/app/infrastructure/remote-config/
                  Firebase Remote Config y fallback offline
src/app/home/     Pantalla principal de tareas y categorías
src/app/          Shell y rutas Angular
src/assets/       Recursos web
src/environments/ Configuración por entorno
src/theme/        Tokens visuales
firebase/         Plantilla versionada de Remote Config
evidence/         Protocolo y capturas de validación física
.github/workflows/ CI y release Android verificable
docs/             Procedimiento de release iOS
resources/        Recursos nativos
config.xml        Configuración Cordova
tools/            Benchmark, Remote Config y firma Android
DELIVERY_CHECKLIST.md
                  Auditoría contra la especificación
```

Las carpetas `features`, `core` y `shared` se agregarán cuando existan más pantallas o servicios transversales.

## Scripts

| Script                                   | Propósito                        |
| ---------------------------------------- | -------------------------------- |
| `npm start`                              | Servidor local                   |
| `npm run start:network`                  | Servidor visible en la red local |
| `npm run build`                          | Build web optimizado             |
| `npm run benchmark`                      | Benchmark con 50.000 tareas      |
| `npm run lint`                           | Análisis estático                |
| `npm run typecheck`                      | Validación TypeScript            |
| `npm test`                               | Pruebas interactivas             |
| `npm run test:ci`                        | Pruebas con cobertura            |
| `npm run format`                         | Aplicar formato                  |
| `npm run format:check`                   | Verificar formato                |
| `npm run firebase:remote-config:enable`  | Publicar búsqueda activada       |
| `npm run firebase:remote-config:disable` | Publicar búsqueda desactivada    |
| `npm run firebase:remote-config:verify`  | Consultar la plantilla remota    |
| `npm run cordova:prepare`                | Preparar plataformas             |
| `npm run android:requirements`           | Verificar toolchain Android      |
| `npm run android:devices`                | Listar dispositivos Android      |
| `npm run android:build`                  | Construir APK Android            |
| `npm run android:signing:setup`          | Crear firma release local segura |
| `npm run android:build:release`          | Construir APK release firmado    |
| `npm run android:verify:release`         | Verificar firma del APK release  |
| `npm run android:release`                | Firmar, construir y verificar    |
| `npm run android:run:device`             | Instalar en dispositivo físico   |
| `npm run android:run:emulator`           | Instalar en emulador             |
| `npm run ios:prepare`                    | Preparar iOS                     |
| `npm run ios:release:preflight`          | Validar el entorno release iOS   |

## Flujo y convenciones

1. Crear una rama `feature/`, `fix/`, `refactor/` o `docs/`.
2. Implementar un cambio cohesivo y sus pruebas.
3. Ejecutar lint, tipos, pruebas y build.
4. Sincronizar la documentación obligatoria.
5. Crear un Conventional Commit en inglés.
6. Para una entrega, alinear `package.json`/`config.xml`, crear el tag semántico y verificar CI/attestations.

Código, archivos, pruebas y commits en inglés; interfaz, accesibilidad y documentación de producto en español. TypeScript es estricto y no se registran secretos ni artefactos generados.

## Despliegue

La versión Android firmada y sus archivos de cadena de suministro se publican en [GitHub Releases](https://github.com/michaelzapatap/prueba-tecnica-nequi/releases). Las notas versionadas están en [RELEASE_NOTES.md](RELEASE_NOTES.md) y el estado requisito por requisito en [DELIVERY_CHECKLIST.md](DELIVERY_CHECKLIST.md). No se publican la llave, contraseñas, `build.json`, tokens de CLI ni cuentas de servicio.

El IPA firmado sigue pendiente porque requiere macOS/Xcode y credenciales Apple Developer. La guía y el preflight reproducibles están listos, pero no debe declararse cumplido ni publicarse un enlace hasta ejecutar las verificaciones y el smoke en un Mac autorizado. No hay publicación en tiendas configurada.

## Licencia

Sin licencia definida; uso exclusivo para la prueba técnica.
