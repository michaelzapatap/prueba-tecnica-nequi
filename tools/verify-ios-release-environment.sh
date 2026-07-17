#!/usr/bin/env bash

set -uo pipefail

failure_count=0
warning_count=0

print_success() {
  printf '[OK] %s\n' "$1"
}

print_failure() {
  printf '[ERROR] %s\n' "$1" >&2
  failure_count=$((failure_count + 1))
}

print_warning() {
  printf '[WARN] %s\n' "$1" >&2
  warning_count=$((warning_count + 1))
}

require_command() {
  local command_name="$1"

  if command -v "$command_name" >/dev/null 2>&1; then
    print_success "$command_name disponible"
  else
    print_failure "$command_name no está instalado o no está en PATH"
  fi
}

if [[ "$(uname -s)" == 'Darwin' ]]; then
  print_success 'Ejecución en macOS'
else
  print_failure 'Este preflight debe ejecutarse en macOS'
fi

for command_name in xcode-select xcodebuild security node npm git pod ios-deploy; do
  require_command "$command_name"
done

if command -v xcode-select >/dev/null 2>&1; then
  developer_path="$(xcode-select --print-path 2>/dev/null || true)"
  if [[ -n "$developer_path" && -d "$developer_path" ]]; then
    print_success "Command Line Tools seleccionadas: $developer_path"
  else
    print_failure 'Xcode Command Line Tools no están seleccionadas'
  fi
fi

if command -v xcodebuild >/dev/null 2>&1; then
  xcode_version="$(xcodebuild -version 2>/dev/null | head -n 1 || true)"
  xcode_major="${xcode_version#Xcode }"
  xcode_major="${xcode_major%%.*}"
  if [[ "$xcode_major" =~ ^[0-9]+$ ]] && ((xcode_major >= 15)); then
    print_success "$xcode_version"
  elif [[ -n "$xcode_version" ]]; then
    print_failure "Cordova iOS 8 requiere Xcode 15 o superior; versión encontrada: $xcode_version"
  else
    print_failure 'Xcode no está inicializado; abra Xcode y acepte licencia/componentes'
  fi
fi

if command -v node >/dev/null 2>&1; then
  node_version="$(node --version)"
  node_major="${node_version#v}"
  node_major="${node_major%%.*}"
  if [[ "$node_major" == '22' ]]; then
    print_success "Node.js $node_version"
  else
    print_failure "Se requiere Node.js 22; versión encontrada: $node_version"
  fi
fi

if [[ -x node_modules/.bin/cordova ]]; then
  cordova_version="$(node_modules/.bin/cordova --version 2>/dev/null || true)"
  print_success "Cordova local $cordova_version"
else
  print_failure 'Cordova local no está disponible; ejecute npm ci desde la raíz del repositorio'
fi

if command -v security >/dev/null 2>&1; then
  identity_summary="$(security find-identity -v -p codesigning 2>/dev/null | tail -n 1 || true)"
  if [[ "$identity_summary" =~ ^[[:space:]]*[1-9][0-9]*[[:space:]]+valid[[:space:]]+identities[[:space:]]+found ]]; then
    print_success "$identity_summary"
  else
    print_failure 'No se encontró una identidad válida de firma de código en el Keychain'
  fi
fi

if grep -q 'id="com.nequitasks.app"' config.xml 2>/dev/null; then
  print_success 'Bundle ID confirmado: com.nequitasks.app'
else
  print_failure 'config.xml no contiene el Bundle ID esperado'
fi

if [[ -f build.ios.local.json ]]; then
  if grep -q 'REPLACE_WITH_APPLE_TEAM_ID' build.ios.local.json; then
    print_failure 'build.ios.local.json todavía contiene el Team ID de ejemplo'
  else
    print_success 'Configuración local de firma encontrada'
  fi
else
  print_warning 'Falta build.ios.local.json; créelo desde tools/ios-release.build.example.json'
fi

if command -v gh >/dev/null 2>&1; then
  if gh auth status >/dev/null 2>&1; then
    print_success 'GitHub CLI autenticado para publicar o adjuntar artefactos'
  else
    print_warning 'GitHub CLI está instalado, pero no autenticado'
  fi
else
  print_warning 'GitHub CLI no está instalado; solo es necesario para publicar desde terminal'
fi

printf '\nResultado: %d error(es), %d advertencia(s).\n' "$failure_count" "$warning_count"

if ((failure_count > 0)); then
  exit 1
fi
