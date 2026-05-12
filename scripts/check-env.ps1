param()

$ErrorActionPreference = 'Stop'

function Get-EnvMap {
    param([string]$Path)
    $map = @{}
    if (-not (Test-Path -LiteralPath $Path)) { return $null }
    foreach ($line in Get-Content -LiteralPath $Path) {
        if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$') {
            $map[$Matches[1]] = $Matches[2]
        }
    }
    return ,$map
}

function Show-Status {
    param([string]$File, [hashtable]$Map, [string[]]$Keys)
    Write-Output "=== $File ==="
    if ($null -eq $Map) { Write-Output "  FILE_MISSING"; return }
    foreach ($k in $Keys) {
        if (-not $Map.ContainsKey($k)) {
            Write-Output ("  missing       " + $k)
        } elseif ([string]::IsNullOrWhiteSpace($Map[$k])) {
            Write-Output ("  present-empty " + $k)
        } else {
            Write-Output ("  present       " + $k)
        }
    }
}

$keys = @(
    'SUPABASE_URL','SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY','SUPABASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'AI_PROVIDER','OLLAMA_BASE_URL','OLLAMA_MODEL','OLLAMA_API_KEY','ANTHROPIC_API_KEY'
)

$engineFile = 'C:\Users\hydra\Desktop\complybase\engine\.env'
$appFile    = 'C:\Users\hydra\Desktop\complybase\app\.env.local'

$engineMap = Get-EnvMap -Path $engineFile
$appMap    = Get-EnvMap -Path $appFile

Show-Status -File $engineFile -Map $engineMap -Keys $keys
Show-Status -File $appFile    -Map $appMap    -Keys $keys

Write-Output "--- provider mode (config, not secret) ---"
$engineProv = if ($engineMap -and $engineMap.ContainsKey('AI_PROVIDER')) { $engineMap['AI_PROVIDER'].Trim().ToLower() } else { '' }
$appProv    = if ($appMap    -and $appMap.ContainsKey('AI_PROVIDER'))    { $appMap['AI_PROVIDER'].Trim().ToLower() }    else { '' }
Write-Output ("  engine AI_PROVIDER: '" + $engineProv + "'")
Write-Output ("  app    AI_PROVIDER: '" + $appProv    + "'")

# Decide gate for smoke tests A/C/D: Supabase complete + Ollama complete (when ollama mode).
function Test-GateOk {
    param([hashtable]$Map)
    if ($null -eq $Map) { return $false }
    $supabaseKeys = @('SUPABASE_URL','SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY','SUPABASE_STORAGE_BUCKET')
    foreach ($k in $supabaseKeys) {
        if (-not $Map.ContainsKey($k) -or [string]::IsNullOrWhiteSpace($Map[$k])) { return $false }
    }
    $prov = if ($Map.ContainsKey('AI_PROVIDER')) { $Map['AI_PROVIDER'].Trim().ToLower() } else { 'anthropic' }
    if ($prov -eq 'ollama') {
        foreach ($k in @('OLLAMA_BASE_URL','OLLAMA_MODEL')) {
            if (-not $Map.ContainsKey($k) -or [string]::IsNullOrWhiteSpace($Map[$k])) { return $false }
        }
        # OLLAMA_API_KEY may be empty for local Ollama — acceptable.
    } elseif ($prov -eq 'anthropic') {
        if (-not $Map.ContainsKey('ANTHROPIC_API_KEY') -or [string]::IsNullOrWhiteSpace($Map['ANTHROPIC_API_KEY'])) { return $false }
    }
    return $true
}

# App layer also needs NEXT_PUBLIC_SUPABASE_* for the browser bundle.
function Test-AppPublicOk {
    param([hashtable]$Map)
    if ($null -eq $Map) { return $false }
    foreach ($k in @('NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
        if (-not $Map.ContainsKey($k) -or [string]::IsNullOrWhiteSpace($Map[$k])) { return $false }
    }
    return $true
}

$engineGate = Test-GateOk -Map $engineMap
$appGate    = Test-GateOk -Map $appMap
$appPublic  = Test-AppPublicOk -Map $appMap

Write-Output "--- gate summary ---"
Write-Output ("  engine Supabase+AI gate: " + $(if ($engineGate) { 'PASS' } else { 'FAIL' }))
Write-Output ("  app    Supabase+AI gate: " + $(if ($appGate)    { 'PASS' } else { 'FAIL' }))
Write-Output ("  app    NEXT_PUBLIC_*  : " + $(if ($appPublic)  { 'PASS' } else { 'FAIL' }))

if ($engineGate -and $appGate -and $appPublic) {
    Write-Output "RESULT: GO_FOR_SMOKE_A_C_D"
    exit 0
} else {
    Write-Output "RESULT: BLOCKED"
    exit 2
}
