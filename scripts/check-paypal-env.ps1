param()

$ErrorActionPreference = 'Stop'

function Read-DotEnv($path) {
  $map = @{}
  if (-not (Test-Path -LiteralPath $path)) {
    return $map
  }

  foreach ($line in Get-Content -LiteralPath $path) {
    if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$') {
      $name = $Matches[1]
      $value = $Matches[2].Trim()
      if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
        $value = $value.Substring(1, $value.Length - 2)
      }
      $map[$name] = $value
    }
  }

  return $map
}

function Status($map, $key) {
  if (-not $map.ContainsKey($key)) {
    return 'missing'
  }
  if ([string]::IsNullOrWhiteSpace($map[$key])) {
    return 'present-empty'
  }
  return 'present'
}

$enginePath = 'C:\Users\hydra\Desktop\complybase\engine\.env'
$appPath = 'C:\Users\hydra\Desktop\complybase\app\.env.local'
$engine = Read-DotEnv $enginePath
$app = Read-DotEnv $appPath

$engineKeys = @(
  'PAYPAL_CLIENT_ID',
  'PAYPAL_CLIENT_SECRET',
  'PAYPAL_WEBHOOK_ID',
  'PAYPAL_ENV',
  'APP_BASE_URL'
)
$appKeys = @(
  'PAYPAL_CLIENT_ID',
  'PAYPAL_CLIENT_SECRET',
  'PAYPAL_WEBHOOK_ID',
  'PAYPAL_ENV',
  'APP_BASE_URL',
  'NEXT_PUBLIC_PAYPAL_CLIENT_ID'
)

Write-Output 'engine/.env PayPal:'
foreach ($key in $engineKeys) {
  Write-Output ('- ' + $key + ' = ' + (Status $engine $key))
}
Write-Output ('- PAYPAL_ENV sandbox = ' + $(if ($engine.ContainsKey('PAYPAL_ENV') -and $engine['PAYPAL_ENV'] -eq 'sandbox') { 'yes' } else { 'no' }))

Write-Output ''
Write-Output 'app/.env.local PayPal:'
foreach ($key in $appKeys) {
  Write-Output ('- ' + $key + ' = ' + (Status $app $key))
}
Write-Output ('- PAYPAL_ENV sandbox = ' + $(if ($app.ContainsKey('PAYPAL_ENV') -and $app['PAYPAL_ENV'] -eq 'sandbox') { 'yes' } else { 'no' }))

$engineClientPresent = $engine.ContainsKey('PAYPAL_CLIENT_ID') -and -not [string]::IsNullOrWhiteSpace($engine['PAYPAL_CLIENT_ID'])
$appClientPresent = $app.ContainsKey('PAYPAL_CLIENT_ID') -and -not [string]::IsNullOrWhiteSpace($app['PAYPAL_CLIENT_ID'])
$appPublicClientPresent = $app.ContainsKey('NEXT_PUBLIC_PAYPAL_CLIENT_ID') -and -not [string]::IsNullOrWhiteSpace($app['NEXT_PUBLIC_PAYPAL_CLIENT_ID'])
$engineWebhookPresent = $engine.ContainsKey('PAYPAL_WEBHOOK_ID') -and -not [string]::IsNullOrWhiteSpace($engine['PAYPAL_WEBHOOK_ID'])
$appWebhookPresent = $app.ContainsKey('PAYPAL_WEBHOOK_ID') -and -not [string]::IsNullOrWhiteSpace($app['PAYPAL_WEBHOOK_ID'])

$clientPublicMatchesApp = $appClientPresent -and $appPublicClientPresent -and ($app['PAYPAL_CLIENT_ID'] -eq $app['NEXT_PUBLIC_PAYPAL_CLIENT_ID'])
$clientAppMatchesEngine = $engineClientPresent -and $appClientPresent -and ($engine['PAYPAL_CLIENT_ID'] -eq $app['PAYPAL_CLIENT_ID'])
$webhookAppMatchesEngine = $engineWebhookPresent -and $appWebhookPresent -and ($engine['PAYPAL_WEBHOOK_ID'] -eq $app['PAYPAL_WEBHOOK_ID'])

Write-Output ''
Write-Output ('client id app public matches app server = ' + $(if ($clientPublicMatchesApp) { 'yes' } else { 'no' }))
Write-Output ('client id app server matches engine = ' + $(if ($clientAppMatchesEngine) { 'yes' } else { 'no' }))
Write-Output ('webhook id app matches engine = ' + $(if ($webhookAppMatchesEngine) { 'yes' } else { 'no' }))

$requiredEngineOk = $true
foreach ($key in $engineKeys) {
  if ((Status $engine $key) -ne 'present') {
    $requiredEngineOk = $false
  }
}

$requiredAppOk = $true
foreach ($key in $appKeys) {
  if ((Status $app $key) -ne 'present') {
    $requiredAppOk = $false
  }
}

$envOk = $engine.ContainsKey('PAYPAL_ENV') -and $engine['PAYPAL_ENV'] -eq 'sandbox' -and $app.ContainsKey('PAYPAL_ENV') -and $app['PAYPAL_ENV'] -eq 'sandbox'
$parityOk = $clientPublicMatchesApp -and $clientAppMatchesEngine -and $webhookAppMatchesEngine

Write-Output ''
Write-Output ('PAYPAL_ENV_RESULT = ' + $(if ($requiredEngineOk -and $requiredAppOk -and $envOk -and $parityOk) { 'GO' } else { 'BLOCKED' }))
