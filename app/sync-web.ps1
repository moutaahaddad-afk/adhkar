# Assemble le dossier www/ de l'app Android à partir du site (dossier parent).
# Whitelist stricte : aucune sauvegarde, aucun fichier de build, aucun secret.
$ErrorActionPreference = "Stop"

$appDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$srcDir = Split-Path -Parent $appDir
$www    = Join-Path $appDir "www"

if (Test-Path $www) { Remove-Item -Path $www -Recurse -Force }
New-Item -ItemType Directory -Path $www -Force | Out-Null

$files = @(
  "index.html",
  "manifest.webmanifest",
  "sw.js",
  "native-android.js",
  "quran-data.json",
  "burdah.json",
  "hamziyyah.json",
  "names-info-1.js",
  "names-info-2.js",
  "names-info-3.js",
  "orad-data.js",
  "sheikh-answers.js",
  "icon-192.png",
  "icon-512.png",
  "icon.svg",
  "favicon.ico",
  "favicon.svg",
  "favicon-16.png",
  "favicon-32.png",
  "favicon-48.png",
  "apple-touch-icon.png"
)

$missing = @()
foreach ($f in $files) {
  $p = Join-Path $srcDir $f
  if (Test-Path $p) { Copy-Item -Path $p -Destination $www -Force }
  else { $missing += $f }
}

foreach ($d in @("icons", "fonts", "vendor")) {
  $p = Join-Path $srcDir $d
  if (Test-Path $p) { Copy-Item -Path $p -Destination (Join-Path $www $d) -Recurse -Force }
  else { $missing += "$d/" }
}

if ($missing.Count -gt 0) { Write-Warning ("Absents (ignorés) : " + ($missing -join ", ")) }

$total = (Get-ChildItem -Path $www -Recurse -File | Measure-Object -Property Length -Sum).Sum
Write-Host ("www/ assemblé : {0} fichiers, {1:N2} Mo" -f (Get-ChildItem -Path $www -Recurse -File).Count, ($total / 1MB))
