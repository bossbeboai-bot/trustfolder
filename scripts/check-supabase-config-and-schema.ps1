param()

$ErrorActionPreference = 'Stop'

$envPath = 'C:\Users\hydra\Desktop\complybase\engine\.env'
$expectedRef = 'cftumifyzljbvfasdblg'
$expectedTables = @(
  'leads',
  'website_scans',
  'assessments',
  'orders',
  'order_status_events',
  'generated_packs',
  'qa_results',
  'email_events'
)

$map = @{}
foreach ($line in Get-Content -LiteralPath $envPath) {
  if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$') {
    $map[$Matches[1]] = $Matches[2].Trim()
  }
}

$url = if ($map.ContainsKey('SUPABASE_URL')) { $map['SUPABASE_URL'] } else { '' }
$serviceKey = if ($map.ContainsKey('SUPABASE_SERVICE_ROLE_KEY')) { $map['SUPABASE_SERVICE_ROLE_KEY'] } else { '' }
$bucket = if ($map.ContainsKey('SUPABASE_STORAGE_BUCKET')) { $map['SUPABASE_STORAGE_BUCKET'] } else { '' }

$refStatus = 'mismatch'
if (-not [string]::IsNullOrWhiteSpace($url)) {
  try {
    $urlHost = ([Uri]$url).Host
    $actualRef = ($urlHost -split '\.')[0]
    if ($actualRef -eq $expectedRef) {
      $refStatus = 'present/matches cftumifyzljbvfasdblg'
    }
  } catch {
    $refStatus = 'mismatch'
  }
}

$serviceExists = -not [string]::IsNullOrWhiteSpace($serviceKey)
$bucketConfigured = $bucket -eq 'deliveries'

Write-Output ('SUPABASE_URL project ref = ' + $refStatus)
Write-Output ('SUPABASE_SERVICE_ROLE_KEY exists = ' + $(if ($serviceExists) { 'yes' } else { 'no' }))
Write-Output ('SUPABASE_STORAGE_BUCKET = deliveries ' + $(if ($bucketConfigured) { 'yes' } else { 'no' }))

if ($refStatus -ne 'present/matches cftumifyzljbvfasdblg' -or -not $serviceExists -or -not $bucketConfigured) {
  Write-Output 'expected public tables = 8'
  Write-Output 'public tables found = 0'
  Write-Output 'expected deliveries bucket = yes'
  Write-Output 'deliveries bucket found = no'
  Write-Output 'CHECK_RESULT = BLOCKED'
  Write-Output 'BLOCKER_TYPE = URL mismatch or local env configuration issue'
  exit 2
}

$base = $url.TrimEnd('/')
$headers = @{
  'apikey' = $serviceKey
  'Authorization' = ('Bearer ' + $serviceKey)
}

$okTables = 0
$schema404 = 0
$authFail = 0
$otherFail = 0

foreach ($table in $expectedTables) {
  try {
    $response = Invoke-WebRequest -Uri ($base + '/rest/v1/' + $table + '?select=id&limit=0') -Method Head -Headers $headers -UseBasicParsing -ErrorAction Stop
    if ([int]$response.StatusCode -ge 200 -and [int]$response.StatusCode -lt 300) {
      $okTables++
    } else {
      $otherFail++
    }
  } catch {
    $status = 0
    if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
      $status = [int]$_.Exception.Response.StatusCode
    }
    if ($status -eq 404) {
      $schema404++
    } elseif ($status -eq 401 -or $status -eq 403) {
      $authFail++
    } else {
      $otherFail++
    }
  }
}

$bucketOk = $false
$bucketStatus = 0
try {
  $bucketResponse = Invoke-WebRequest -Uri ($base + '/storage/v1/bucket/' + [uri]::EscapeDataString($bucket)) -Method Get -Headers $headers -UseBasicParsing -ErrorAction Stop
  if ([int]$bucketResponse.StatusCode -ge 200 -and [int]$bucketResponse.StatusCode -lt 300) {
    $bucketOk = $true
  }
} catch {
  if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
    $bucketStatus = [int]$_.Exception.Response.StatusCode
  }
}

Write-Output 'expected public tables = 8'
Write-Output ('public tables found = ' + $okTables)
Write-Output 'expected deliveries bucket = yes'
Write-Output ('deliveries bucket found = ' + $(if ($bucketOk) { 'yes' } else { 'no' }))

if ($okTables -eq 8 -and $bucketOk) {
  Write-Output 'CHECK_RESULT = GO'
  exit 0
}

Write-Output 'CHECK_RESULT = BLOCKED'
if ($authFail -gt 0 -or $bucketStatus -eq 401 -or $bucketStatus -eq 403) {
  Write-Output 'BLOCKER_TYPE = key mismatch or insufficient service role permissions'
} elseif ($schema404 -gt 0 -and -not $bucketOk) {
  Write-Output 'BLOCKER_TYPE = schema issue and bucket issue'
} elseif ($schema404 -gt 0) {
  Write-Output 'BLOCKER_TYPE = schema issue'
} elseif (-not $bucketOk) {
  Write-Output 'BLOCKER_TYPE = bucket issue'
} else {
  Write-Output 'BLOCKER_TYPE = unknown service/API issue'
}
exit 2
