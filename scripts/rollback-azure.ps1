<#
.SYNOPSIS
  Roll the Container App back to its immediately previous revision.

.DESCRIPTION
  Azure Container Apps keeps prior revisions around (not deleted) unless you
  explicitly deactivate/delete them. This script lists the app's revisions
  newest-first, identifies the second-newest ("previous"), and activates it
  with 100% traffic -- without deleting the current (bad) revision, so you
  can roll forward again if the rollback itself turns out to be wrong.

  This does not touch images in ACR, does not delete anything, and does not
  change billing/scale settings.

.PARAMETER RevisionName
  Optional: roll back to this specific revision name instead of
  auto-detecting "previous". Use `az containerapp revision list` to see
  names.
#>

param(
    [string]$ResourceGroup = "rg-cheese-shelflife",
    [string]$ContainerApp  = "cheese-shelflife-api",
    [string]$RevisionName  = ""
)

$ErrorActionPreference = "Stop"

function Fail($msg) {
    Write-Host "ROLLBACK FAILED: $msg" -ForegroundColor Red
    exit 1
}

$revisions = az containerapp revision list --name $ContainerApp --resource-group $ResourceGroup --output json 2>$null | ConvertFrom-Json
if (-not $revisions -or $revisions.Count -eq 0) { Fail "No revisions found for $ContainerApp." }

$sorted = $revisions | Sort-Object { [datetime]$_.properties.createdTime } -Descending

if ($RevisionName) {
    $target = $sorted | Where-Object { $_.name -eq $RevisionName }
    if (-not $target) { Fail "Revision '$RevisionName' not found. Available: $($sorted.name -join ', ')" }
} else {
    if ($sorted.Count -lt 2) { Fail "Only one revision exists ($($sorted[0].name)) -- nothing to roll back to." }
    $target = $sorted[1]
    Write-Host "Current (active) revision: $($sorted[0].name)" -ForegroundColor Yellow
    Write-Host "Rolling back to previous:  $($target.name)" -ForegroundColor Cyan
}

az containerapp ingress traffic set `
    --name $ContainerApp `
    --resource-group $ResourceGroup `
    --revision-weight "$($target.name)=100" `
    --output none
if ($LASTEXITCODE -ne 0) { Fail "Could not shift traffic to $($target.name)." }

$fqdn = az containerapp show --name $ContainerApp --resource-group $ResourceGroup --query "properties.configuration.ingress.fqdn" -o tsv
Write-Host ""
Write-Host "Rollback complete. 100% of traffic now on revision: $($target.name)" -ForegroundColor Green
Write-Host "Verify: https://$fqdn/api/v6/health"
Write-Host ""
Write-Host "Note: the revision you rolled back FROM still exists (not deleted)." -ForegroundColor Yellow
Write-Host "To roll forward again: .\rollback-azure.ps1 -RevisionName <that revision's name>"
