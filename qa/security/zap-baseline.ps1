param(
  [string]$Target = "http://localhost:5173",
  [string]$OutputDirectory = (Join-Path $PSScriptRoot "..\results\zap")
)

$zapCandidates = @(
  "$env:ProgramFiles\ZAP\Zed Attack Proxy\zap.bat",
  "$env:ProgramFiles\OWASP\Zed Attack Proxy\zap.bat",
  "$env:LOCALAPPDATA\Programs\ZAP\Zed Attack Proxy\zap.bat"
)
$zap = $zapCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $zap) {
  Write-Error "Không tìm thấy OWASP ZAP. Cài bằng: winget install --id ZAP.ZAP --exact"
  exit 2
}

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
$html = Join-Path $OutputDirectory "zap-report.html"
$json = Join-Path $OutputDirectory "zap-report.json"

Push-Location (Split-Path -Parent $zap)
try {
  & $zap -cmd -quickurl $Target -quickprogress -quickout $html -config "reports.reportDir=$OutputDirectory"
  $exitCode = $LASTEXITCODE
} finally {
  Pop-Location
}

if (Test-Path -LiteralPath $html) {
  $content = Get-Content -LiteralPath $html -Raw
  function Get-AlertCount([string]$riskClass) {
    $pattern = "(?s)<td class=""$riskClass"">\s*<div>[^<]+</div>\s*</td>\s*<td align=""center"">\s*<div>(\d+)</div>"
    $match = [regex]::Match($content, $pattern)
    if ($match.Success) { return [int]$match.Groups[1].Value }
    return 0
  }
  $summary = @{
    target = $Target
    generatedAt = (Get-Date).ToString("o")
    high = Get-AlertCount "risk-3"
    medium = Get-AlertCount "risk-2"
    low = Get-AlertCount "risk-1"
    informational = Get-AlertCount "risk-0"
    htmlReport = $html
    zapExitCode = $exitCode
  }
  $summary | ConvertTo-Json | Set-Content -LiteralPath $json -Encoding UTF8
}

exit $exitCode
