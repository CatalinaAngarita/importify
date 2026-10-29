param(
  [string]$Container = "importify-db",
  [string]$Database = "importify",
  [string]$User = "importify",
  [string]$Password = "importify",
  [string]$OutFile = "database/importify-data.sql"
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$outPath = if ([IO.Path]::IsPathRooted($OutFile)) { $OutFile } else { Join-Path $repoRoot $OutFile }
$outDir = Split-Path -Parent $outPath
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$tmp = "/tmp/importify-data.sql"
docker exec $Container mariadb-dump "-u$User" "-p$Password" `
  --default-character-set=utf8mb4 `
  --no-create-info `
  --skip-triggers `
  --complete-insert `
  --single-transaction `
  --skip-lock-tables `
  --skip-add-locks `
  --disable-keys `
  "--ignore-table=$Database.__drizzle_migrations" `
  $Database "--result-file=$tmp"

if ($LASTEXITCODE -ne 0) {
  throw "mariadb-dump fallo con codigo $LASTEXITCODE"
}

docker cp "${Container}:$tmp" $outPath
if ($LASTEXITCODE -ne 0) {
  throw "docker cp fallo con codigo $LASTEXITCODE"
}

docker exec $Container rm -f $tmp | Out-Null
Write-Host "Datos exportados a $outPath"
