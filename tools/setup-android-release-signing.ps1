param(
    [string]$Alias = "nequi-tasks-release",
    [string]$KeystorePath = ""
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$projectRoot = Split-Path -Parent $PSScriptRoot
$signingDirectory = Join-Path $projectRoot ".local-signing"
$buildConfigPath = Join-Path $projectRoot "build.json"

if ([string]::IsNullOrWhiteSpace($KeystorePath)) {
    $KeystorePath = Join-Path $signingDirectory "nequi-tasks-release.p12"
}

$resolvedKeystorePath = [System.IO.Path]::GetFullPath($KeystorePath)

if ((Test-Path -LiteralPath $resolvedKeystorePath) -and (Test-Path -LiteralPath $buildConfigPath)) {
    Write-Host "Android release signing is already configured locally."
    exit 0
}

$keytoolCommand = Get-Command keytool -ErrorAction Stop
[System.IO.Directory]::CreateDirectory((Split-Path -Parent $resolvedKeystorePath)) | Out-Null

$secretBytes = New-Object byte[] 32
$randomNumberGenerator = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$randomNumberGenerator.GetBytes($secretBytes)
$randomNumberGenerator.Dispose()
$password = -join ($secretBytes | ForEach-Object { $_.ToString("x2") })

& $keytoolCommand.Source `
    -genkeypair `
    -keystore $resolvedKeystorePath `
    -storetype PKCS12 `
    -storepass $password `
    -keypass $password `
    -alias $Alias `
    -keyalg RSA `
    -keysize 3072 `
    -validity 10000 `
    -dname "CN=Nequi Tasks Local Release, OU=Development, O=Technical Assessment, L=Medellin, ST=Antioquia, C=CO"

if ($LASTEXITCODE -ne 0) {
    throw "keytool failed with exit code $LASTEXITCODE."
}

$buildConfig = @{
    android = @{
        release = @{
            keystore = $resolvedKeystorePath
            storePassword = $password
            alias = $Alias
            password = $password
            keystoreType = "pkcs12"
            packageType = "apk"
        }
    }
}

$json = $buildConfig | ConvertTo-Json -Depth 4
[System.IO.File]::WriteAllText($buildConfigPath, $json, [System.Text.UTF8Encoding]::new($false))

Write-Host "Local Android release signing was created. Keep .local-signing and build.json private and backed up securely."
