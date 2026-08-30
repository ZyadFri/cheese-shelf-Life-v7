<#
.SYNOPSIS
  Delete old cheese-api images from ACR, keeping the current image, the
  previous (rollback) image, and a few recent ones. Dry-run by default.

.DESCRIPTION
  Safety rules, enforced in this order:
    1. Any tag currently referenced by ANY existing Container App revision
       (active or inactive -- Azure keeps old revisions around) is NEVER
       deleted, full stop.
    2. Beyond that, the $KeepCount most recently pushed tags are kept.
    3. Everything else is a deletion candidate.

  Runs in dry-run mode (prints what it WOULD delete) unless you pass
  -Execute. Nothing is deleted on a dry run.

.PARAMETER KeepCount
  How many of the most recent tags to keep in addition to the ones actively
  referenced by a revision. Default 5.

.PARAMETER Execute
  Actually delete the candidate tags. Omit this to preview only.
#>

param(
    [string]$ResourceGroup = "rg-cheese-shelflife",
    [string]$ContainerApp  = "cheese-shelflife-api",
    [string]$AcrName       = "acrcheeseshelflifej8at7j",
    [string]$Repository    = "cheese-api",
    [int]$KeepCount        = 5,
    [switch]$Execute
)

$ErrorActionPreference = "Stop"

Write-Host "== Finding tags referenced by existing Container App revisions (never deleted) ==" -ForegroundColor Cyan
$revisions = az containerapp revision list --name $ContainerApp --resource-group $ResourceGroup --output json 2>$null | ConvertFrom-Json
$inUseTags = @()
foreach ($rev in $revisions) {
    $img = $rev.properties.template.containers[0].image
    if ($img -match ":([^:]+)$") { $inUseTags += $Matches[1] }
}
$inUseTags = $inUseTags | Select-Object -Unique
Write-Host "  In-use tags (protected): $($inUseTags -join ', ')" -ForegroundColor Green

Write-Host "== Listing all tags in ${AcrName}/${Repository} ==" -ForegroundColor Cyan
$allTags = az acr repository show-tags --name $AcrName --repository $Repository --orderby time_desc --output json 2>$null | ConvertFrom-Json
if (-not $allTags) { Write-Host "No tags found (or repository doesn't exist)."; exit 0 }
Write-Host "  Total tags: $($allTags.Count)"

$keepRecent = $allTags | Select-Object -First $KeepCount
$toKeep = ($inUseTags + $keepRecent) | Select-Object -Unique
$toDelete = $allTags | Where-Object { $_ -notin $toKeep }

Write-Host ""
Write-Host "Keeping ($($toKeep.Count)): $($toKeep -join ', ')" -ForegroundColor Green
Write-Host "Deletion candidates ($($toDelete.Count)): $($toDelete -join ', ')" -ForegroundColor Yellow

if ($toDelete.Count -eq 0) {
    Write-Host "Nothing to delete."
    exit 0
}

if (-not $Execute) {
    Write-Host ""
    Write-Host "Dry run only -- nothing deleted. Re-run with -Execute to actually delete the candidates above." -ForegroundColor Cyan
    exit 0
}

foreach ($tag in $toDelete) {
    Write-Host "Deleting ${Repository}:${tag} ..." -ForegroundColor Red
    az acr repository delete --name $AcrName --image "${Repository}:${tag}" --yes --output none
}
Write-Host "Done." -ForegroundColor Green
