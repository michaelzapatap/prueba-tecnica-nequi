# Generación y publicación pendiente del IPA firmado

El proyecto contiene Cordova iOS 8.1 y los recursos necesarios, pero Windows no puede ejecutar Xcode ni firmar un IPA. Este procedimiento debe realizarse en un Mac autorizado por el titular de la cuenta Apple Developer y partiendo exactamente del tag `v0.1.1`.

## Decisión de distribución antes de comenzar

| Ruta                   | Uso                                           | Instalación                         | Publicación segura                                                              |
| ---------------------- | --------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------- |
| TestFlight / App Store | Recomendada para evaluadores externos         | Mediante TestFlight                 | Publicar el enlace de TestFlight; el IPA se carga a App Store Connect           |
| Ad hoc                 | Instalación directa en dispositivos conocidos | Solo en UDID incluidos en el perfil | Entregar por canal privado; no adjuntar públicamente sin inspeccionar el perfil |
| Development            | Prueba interna temporal                       | Solo dispositivos del equipo        | No usar como artefacto final                                                    |

Un IPA `ad-hoc` incluye un `embedded.mobileprovision` que puede contener los UDID autorizados. Publicarlo en una GitHub Release pública puede exponer esos identificadores. Para una entrega pública se recomienda TestFlight. Si la prueba exige un enlace directo al archivo, use firma `ad-hoc`, inspeccione primero el perfil y entregue el IPA por un canal con acceso restringido.

Antes de la sesión en macOS deben estar definidos:

- ruta de distribución: TestFlight/App Store o `ad-hoc`;
- Apple Team ID que posee `com.nequitasks.app`;
- acceso a App Store Connect si se usará TestFlight;
- UDID de cada dispositivo evaluador si se usará `ad-hoc`;
- versión/build disponibles en App Store Connect para evitar colisiones.

El Team ID se escribe únicamente en el archivo local ignorado por Git. Certificados, perfiles, llaves `.p8`, contraseñas y exportaciones `.p12` permanecen en Keychain o en un gestor de secretos.

## Requisitos

- macOS compatible con una versión vigente de Xcode.
- Xcode 15 o superior y Command Line Tools seleccionados con `xcode-select`.
- Node.js 22 y npm.
- CocoaPods 1.16 o superior e `ios-deploy` 1.12.2 o superior.
- Membresía Apple Developer activa.
- Certificado Apple Development o Apple Distribution instalado en Keychain, según la ruta.
- Team ID y perfil de aprovisionamiento que incluyan `com.nequitasks.app`.
- GitHub CLI autenticado, solo si la publicación se hará desde terminal.

Los mínimos de Xcode, CocoaPods, `ios-deploy` y Node se basan en la [guía oficial de Cordova iOS 8](https://cordova.apache.org/docs/en/latest/guide/platforms/ios/).

## Preparación segura y preflight

1. Clonar el repositorio y cambiar al tag exacto de la entrega:

   ```bash
   git clone https://github.com/michaelzapatap/prueba-tecnica-nequi.git
   cd prueba-tecnica-nequi
   git checkout v0.1.1
   git status --short
   git rev-parse HEAD
   npm ci
   ```

   El árbol debe quedar limpio. El commit esperado para el tag es `11644a55efce4d7651c035ca46fa6d62b74f51b5`.

2. Ejecutar el preflight sin privilegios elevados:

   ```bash
   npm run ios:release:preflight
   ```

   El script comprueba macOS, Xcode 15+, CocoaPods, `ios-deploy`, Node 22, Cordova local, Bundle ID, identidades de firma y autenticación opcional de GitHub. No imprime contraseñas, perfiles ni llaves. Si Xcode aún no está inicializado, ábralo una vez, instale sus componentes y acepte la licencia.

3. Crear la configuración local:

   ```bash
   cp tools/ios-release.build.example.json build.ios.local.json
   ```

4. Editar `build.ios.local.json`:
   - reemplazar `REPLACE_WITH_APPLE_TEAM_ID` localmente;
   - con aprovisionamiento automático, conservar `"codeSignIdentity": "iPhone Developer"`, como indica Cordova, y usar `"packageType": "app-store"` para TestFlight/App Store o `"ad-hoc"` para instalación directa;
   - para `ad-hoc`, confirmar que el perfil incluya los UDID evaluadores;
   - si la organización exige firma manual, sustituir `automaticProvisioning` por el UUID de `provisioningProfile` y usar `"codeSignIdentity": "iPhone Distribution"`.

5. Repetir el preflight. Esta vez no debe quedar el aviso de configuración ausente:

   ```bash
   npm run ios:release:preflight
   ```

`build.ios.local.json` coincide con `/build.*.local.json` en `.gitignore`. Antes y después del proceso, `git status --short` no debe mostrar material de firma.

## Validaciones y build

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

Si la plataforma ya existe, `platform add` informará que está instalada y puede omitirse. Si la firma automática no resuelve el perfil, abra `platforms/ios/*.xcworkspace` en Xcode, seleccione el Team correcto y archive mediante **Product > Archive**. No modifique ni versione archivos generados dentro de `platforms/ios`.

## Verificación del IPA y del perfil embebido

1. Localizar y extraer el artefacto:

   ```bash
   IPA_PATH="$(find platforms/ios -name '*.ipa' -print -quit)"
   test -n "$IPA_PATH"
   rm -rf tmp/ipa-verification
   mkdir -p tmp/ipa-verification
   unzip -q "$IPA_PATH" -d tmp/ipa-verification
   APP_PATH="$(find tmp/ipa-verification/Payload -maxdepth 1 -name '*.app' -print -quit)"
   test -n "$APP_PATH"
   ```

2. Validar firma, Bundle ID y entitlements:

   ```bash
   codesign --verify --deep --strict --verbose=2 "$APP_PATH"
   codesign -dv --verbose=4 "$APP_PATH"
   codesign -d --entitlements :- "$APP_PATH"
   /usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' "$APP_PATH/Info.plist"
   ```

   El Bundle ID debe ser `com.nequitasks.app` y la firma debe terminar sin errores.

3. Inspeccionar el perfil sin publicar su contenido:

   ```bash
   security cms -D -i "$APP_PATH/embedded.mobileprovision" > tmp/ipa-verification/profile.plist
   /usr/libexec/PlistBuddy -c 'Print :Name' tmp/ipa-verification/profile.plist
   /usr/libexec/PlistBuddy -c 'Print :ExpirationDate' tmp/ipa-verification/profile.plist
   if /usr/libexec/PlistBuddy -c 'Print :ProvisionedDevices' tmp/ipa-verification/profile.plist >/dev/null 2>&1; then
     echo 'El perfil contiene UDID: no publique este IPA en una release pública.'
   else
     echo 'El perfil no expone una lista ProvisionedDevices.'
   fi
   ```

4. Generar checksum sin incluir una ruta local:

   ```bash
   IPA_DIRECTORY="$(dirname "$IPA_PATH")"
   IPA_FILENAME="$(basename "$IPA_PATH")"
   (cd "$IPA_DIRECTORY" && shasum -a 256 "$IPA_FILENAME") | tee nequi-tasks-v0.1.1.ipa.sha256
   ```

5. Instalar en un dispositivo incluido en el perfil o subir a TestFlight. Ejecutar el mismo smoke de Android: crear categoría y tarea, asignar, buscar, completar, forzar cierre, reabrir, validar offline y eliminar los datos de prueba. Capturar evidencia sin mostrar datos personales ni identificadores del dispositivo.

## Publicación

### Ruta recomendada: TestFlight

1. En Xcode Organizer, seleccione el archive y ejecute **Distribute App > App Store Connect > Upload**.
2. Espere el procesamiento en App Store Connect y asigne la build al grupo de evaluadores.
3. Registre el enlace o la invitación de TestFlight en la entrega y conserve localmente el SHA-256.
4. No adjunte certificados, perfiles, `.p8`, `.p12`, configuración local ni credenciales a GitHub.

### Ruta ad hoc privada

1. Confirme que `ProvisionedDevices` contiene únicamente los equipos autorizados.
2. Entregue IPA y checksum por un canal restringido.
3. No adjunte el IPA a la release pública porque el perfil revela UDID.

### Adjuntar a GitHub Release cuando la política lo permita

Solo si la inspección confirma que el artefacto no revela UDID ni información prohibida:

```bash
gh release upload v0.1.1 "$IPA_PATH" nequi-tasks-v0.1.1.ipa.sha256 \
  --repo michaelzapatap/prueba-tecnica-nequi \
  --clobber
```

Después, descargue nuevamente ambos assets, repita el SHA-256 y actualice `README.md`, `RELEASE_NOTES.md`, `DELIVERY_CHECKLIST.md`, `PROJECT_MEMORY.md`, `CHANGELOG.md` y `ROADMAP.md` con el enlace real y el resultado del smoke iOS.

La automatización futura debe usar un runner `macos` y secretos protegidos con revisores. No debe reutilizarse la firma Android ni almacenarse material Apple en variables sin cifrar.
