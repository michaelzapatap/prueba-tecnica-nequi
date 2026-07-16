# Mis tareas

Aplicación híbrida de gestión de tareas y categorías para la prueba técnica mobile. El código utiliza identificadores en inglés y la interfaz se presenta en español.

## Características

- Crear, completar y eliminar tareas.
- Administrar categorías, asignarlas y filtrar por ellas.
- Persistir localmente y funcionar sin conexión.
- Habilitar búsqueda con Firebase Remote Config.
- Manejar listados grandes eficientemente.
- Compilar Android e iOS con Cordova.

La base técnica, el dominio, la persistencia local versionada y la pantalla principal funcional están configurados. Consulte `ROADMAP.md` para el estado exacto.

## Tecnologías y arquitectura

Ionic 8, Angular 20 standalone, TypeScript 5.9, Cordova 13, Android 15, iOS 8.1, Jasmine/Karma, ESLint y Prettier. Firebase Remote Config está pendiente.

Se usa arquitectura por capas: dominio independiente de Ionic, casos de uso en aplicación, `TaskBoardFacade` con Angular Signals, repositorios como contratos y persistencia/Firebase como adaptadores. La persistencia local actual usa un store versionado `v1` sobre `localStorage` mediante `KeyValueStorage`. Detalles en `PROJECT_MEMORY.md` y `DECISIONS.md`.

## Requisitos

- Node.js `>=20.17.0` o `>=22.9.0` y npm 10+.
- Para Android: JDK, Android Studio/SDK, `JAVA_HOME` y `ANDROID_HOME`.
- Para iOS: macOS, Xcode, Command Line Tools y credenciales Apple Developer.

Windows no puede compilar ni firmar un IPA.

Cordova Android 15 requiere Android SDK Command-line Tools, `avdmanager` accesible y la plataforma SDK 36. El entorno actual todavía no dispone de Command-line Tools, por lo que la preparación funciona pero la compilación del APK queda pendiente.

## Instalación

```bash
git clone <repository-url>
cd prueba-tecnica-nequi
npm ci
```

## Configuración y variables de entorno

La base no requiere variables. Firebase añadirá configuración pública por plataforma y entorno; nunca se versionarán secretos, certificados o contraseñas. El ID nativo es `com.nequitasks.app` y el nombre visible es `Mis tareas`.

## Ejecución local

```bash
npm start
```

Normalmente estará disponible en `http://localhost:4200`.

## Calidad y pruebas

```bash
npm run lint
npm run typecheck
npm test
npm run test:ci
npm run format:check
```

`test:ci` requiere Chrome o Chromium compatible con Karma. La suite actual valida dominio, migración de almacenamiento, repositorios locales, facade de aplicación y componentes base.

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

iOS desde macOS:

```bash
npm run ios:prepare
npx cordova build ios
```

La firma final necesita credenciales del responsable de la entrega.

## Estructura

```text
src/app/application/
                  Casos de uso, providers y facades
src/app/domain/   Modelos, reglas y contratos de negocio
src/app/infrastructure/persistence/
                  Persistencia local versionada
src/app/home/     Pantalla principal de tareas y categorías
src/app/          Shell y rutas Angular
src/assets/       Recursos web
src/environments/ Configuración por entorno
src/theme/        Tokens visuales
resources/        Recursos nativos
config.xml        Configuración Cordova
```

Las carpetas `features`, `core` y `shared` se agregarán cuando existan más pantallas o servicios transversales.

## Scripts

| Script                    | Propósito             |
| ------------------------- | --------------------- |
| `npm start`               | Servidor local        |
| `npm run build`           | Build web optimizado  |
| `npm run lint`            | Análisis estático     |
| `npm run typecheck`       | Validación TypeScript |
| `npm test`                | Pruebas interactivas  |
| `npm run test:ci`         | Pruebas con cobertura |
| `npm run format`          | Aplicar formato       |
| `npm run format:check`    | Verificar formato     |
| `npm run cordova:prepare` | Preparar plataformas  |
| `npm run android:build`   | Construir Android     |
| `npm run ios:prepare`     | Preparar iOS          |

## Flujo y convenciones

1. Crear una rama `feature/`, `fix/`, `refactor/` o `docs/`.
2. Implementar un cambio cohesivo y sus pruebas.
3. Ejecutar lint, tipos, pruebas y build.
4. Sincronizar la documentación obligatoria.
5. Crear un Conventional Commit en inglés.

Código, archivos, pruebas y commits en inglés; interfaz, accesibilidad y documentación de producto en español. TypeScript es estricto y no se registran secretos ni artefactos generados.

## Despliegue

El entregable final será un APK y un IPA firmado. No hay tiendas ni entorno de publicación configurados todavía.

## Licencia

Sin licencia definida; uso exclusivo para la prueba técnica.
