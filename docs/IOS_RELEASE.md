# Generación pendiente del IPA firmado

El proyecto contiene Cordova iOS 8.1 y los recursos necesarios, pero Windows no puede ejecutar Xcode ni firmar un IPA. Este procedimiento debe realizarse en un Mac autorizado por el titular de la cuenta Apple Developer.

## Requisitos

- macOS compatible con una versión vigente de Xcode.
- Xcode y Command Line Tools seleccionados con `xcode-select`.
- Node.js 22.17 y npm.
- Membresía Apple Developer activa.
- Certificado de desarrollo o distribución instalado en el Keychain.
- Team ID y perfil de aprovisionamiento que incluya `com.nequitasks.app`.
- Para un IPA `ad-hoc`, los UDID de los dispositivos evaluadores deben pertenecer al perfil.

## Preparación segura

1. Clonar el repositorio y cambiar al tag de la entrega:

   ```bash
   git clone https://github.com/michaelzapatap/prueba-tecnica-nequi.git
   cd prueba-tecnica-nequi
   git checkout v0.1.1
   npm ci
   ```

2. Verificar herramientas e identidades disponibles:

   ```bash
   xcode-select --print-path
   xcodebuild -version
   security find-identity -v -p codesigning
   node --version
   npm --version
   ```

3. Crear una configuración local a partir de la plantilla:

   ```bash
   cp tools/ios-release.build.example.json build.ios.local.json
   ```

4. Editar `build.ios.local.json` y reemplazar únicamente el Team ID. Para distribución por App Store, cambiar `packageType` a `app-store`. Si la organización exige firma manual, reemplazar `automaticProvisioning` por `provisioningProfile` con el UUID correspondiente.

`build.ios.local.json` está ignorado por Git. Los certificados, perfiles, llaves `.p8`, contraseñas y exportaciones `.p12` también deben permanecer en el Keychain o en un gestor de secretos, nunca dentro del repositorio.

## Build y exportación

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test:ci
npm run benchmark
npm run build
npx cordova platform add ios@8.1.1
npx cordova prepare ios
npx cordova build ios --release --buildConfig=build.ios.local.json
```

Si la plataforma ya existe, `platform add` informará que está instalada y puede omitirse. Para resolver la firma visualmente, abra `platforms/ios/*.xcworkspace` en Xcode, seleccione el Team correcto y archive mediante **Product > Archive**.

## Verificación del IPA

1. Localizar el resultado:

   ```bash
   find platforms/ios -name '*.ipa' -print
   ```

2. Extraer y verificar la firma de la aplicación:

   ```bash
   rm -rf tmp/ipa-verification
   mkdir -p tmp/ipa-verification
   unzip -q path/to/Mis\ tareas.ipa -d tmp/ipa-verification
   codesign --verify --deep --strict --verbose=2 tmp/ipa-verification/Payload/*.app
   codesign -dv --verbose=4 tmp/ipa-verification/Payload/*.app
   ```

3. Generar el checksum de entrega:

   ```bash
   shasum -a 256 path/to/Mis\ tareas.ipa
   ```

4. Instalarlo en un dispositivo incluido en el perfil o subirlo a TestFlight, comprobar creación/completado/eliminación, categorías, persistencia y Remote Config, y capturar evidencia.

## Publicación

El IPA, su checksum y las capturas pueden adjuntarse a una nueva GitHub Release. Antes de publicar, inspeccione el archivo para confirmar que no contiene perfiles, llaves o configuraciones administrativas ajenas a la firma embebida normal de iOS.

La automatización futura debe usar un runner `macos` y secretos de entorno protegidos con revisores. No debe reutilizarse la firma Android ni almacenarse material Apple en variables sin cifrar.
