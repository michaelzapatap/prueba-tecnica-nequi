param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("enabled", "disabled")]
    [string]$State,
    [string]$ProjectId = ""
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$projectRoot = Split-Path -Parent $PSScriptRoot
$templatePath = Join-Path $projectRoot "firebase/remote-config.template.json"
$firebaseCommand = Get-Command firebase -ErrorAction Stop
$template = Get-Content -LiteralPath $templatePath -Raw -Encoding utf8 | ConvertFrom-Json
$value = if ($State -eq "enabled") { "true" } else { "false" }

$template.parameters.task_search_enabled.defaultValue.value = $value
$json = $template | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText($templatePath, $json + [Environment]::NewLine, [System.Text.UTF8Encoding]::new($false))

$arguments = @("deploy", "--only", "remoteconfig", "--non-interactive")
if (-not [string]::IsNullOrWhiteSpace($ProjectId)) {
    $arguments += @("--project", $ProjectId)
}

& $firebaseCommand.Source @arguments
if ($LASTEXITCODE -ne 0) {
    throw "Firebase Remote Config deployment failed with exit code $LASTEXITCODE."
}

Write-Host "Published task_search_enabled=$value."
