$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$projectRoot = Split-Path -Parent $PSScriptRoot
$apkPath = Join-Path $projectRoot "platforms/android/app/build/outputs/apk/release/app-release.apk"

if (-not (Test-Path -LiteralPath $apkPath)) {
    throw "Release APK was not found at $apkPath."
}

if ([string]::IsNullOrWhiteSpace($env:ANDROID_HOME)) {
    throw "ANDROID_HOME is required to locate apksigner."
}

$buildToolsRoot = Join-Path $env:ANDROID_HOME "build-tools"
$apkSignerNames = @("apksigner", "apksigner.bat")
$apkSigner = Get-ChildItem -LiteralPath $buildToolsRoot -Directory |
    Sort-Object { [version]$_.Name } -Descending |
    ForEach-Object {
        foreach ($apkSignerName in $apkSignerNames) {
            Join-Path $_.FullName $apkSignerName
        }
    } |
    Where-Object { Test-Path -LiteralPath $_ -PathType Leaf } |
    Select-Object -First 1

if ([string]::IsNullOrWhiteSpace($apkSigner)) {
    throw "apksigner was not found below $buildToolsRoot."
}

& $apkSigner verify --verbose --print-certs $apkPath

if ($LASTEXITCODE -ne 0) {
    throw "apksigner verification failed with exit code $LASTEXITCODE."
}

$apk = Get-Item -LiteralPath $apkPath
Write-Host "Verified signed release APK: $($apk.FullName) ($($apk.Length) bytes)"
