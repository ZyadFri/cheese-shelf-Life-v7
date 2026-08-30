<#
.SYNOPSIS
  Rebuild the backend image from THIS local project directory and redeploy
  it to the existing Azure Container App. Idempotent: safe to re-run.

.DESCRIPTION
  This script does NOT create Azure resources -- the resource group, ACR,
  storage account/file share, managed identity, Container Apps environment,
  and the Container App itself are one-time setup already done for this
  project (see DEPLOYMENT_AZURE.md). Re-running this script only:
    1. Verifies the gitignored model artifact directories are present
       (they are NOT in git -- a fresh clone will NOT have them).
    2. Builds a new backend image tagged with the current git commit SHA.
    3. Pushes it to the existing ACR via the logged-in `az` identity
       (no registry password is ever stored or used).
    4. Points the existing Container App at the new image tag.

  It never touches billing, never creates a second resource group, never
  removes the subscription's spending limit, and never prints or logs any
  secret value. If anything fails, the script stops (no partial silent
  retries) and prints the exact command to re-run once fixed.

.NOTES
  Requires: Docker Desktop running, `az` CLI logged in
  (`az account show` succeeds), and this script run from a machine that has
  the full local project checkout with trained artifacts present.
#>

param(
    [string]$ResourceGroup   = "rg-cheese-shelflife",
    [string]$ContainerAppEnv = "cae-cheese-shelflife",
    [string]$ContainerApp    = "cheese-shelflife-api",
    [string]$AcrName         = "acrcheeseshelflifej8at7j",
    [string]$ImageName       = "cheese-api"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $RepoRoot

function Fail($msg) {
    Write-Host "DEPLOY FAILED: $msg" -ForegroundColor Red
    exit 1
}

Write-Host "== Step 1/6: verify gitignored artifact directories exist ==" -ForegroundColor Cyan
$requiredDirs = @("artifacts", "artifacts_v6", "artifacts_classification", "artifacts_ingredient_ranking")
foreach ($dir in $requiredDirs) {
    $full = Join-Path $RepoRoot $dir
    if (-not (Test-Path $full -PathType Container)) {
        Fail "Required artifact directory '$dir' is missing at $full. These are gitignored and must exist locally (produced by train_models.py / train_specialists.py / train_classifier.py / train_ingredient_ranking.py) before building the image. A fresh `git clone` alone will NOT have them."
    }
    $count = (Get-ChildItem $full -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count
    if ($count -eq 0) {
        Fail "Artifact directory '$dir' exists but is empty."
    }
}
Write-Host "  All 4 artifact directories present." -ForegroundColor Green

Write-Host "== Step 2/6: verify Docker and Azure CLI are ready ==" -ForegroundColor Cyan
docker info *> $null
if ($LASTEXITCODE -ne 0) { Fail "Docker Desktop is not running. Start it and re-run this script." }

$account = az account show --output json 2>$null | ConvertFrom-Json
if (-not $account) { Fail "Not logged in to Azure CLI. Run 'az login' first." }
Write-Host "  Docker running, Azure CLI logged in as $($account.user.name)." -ForegroundColor Green

Write-Host "== Step 3/6: resolve image tag from git commit ==" -ForegroundColor Cyan
$gitSha = (git rev-parse --short HEAD 2>$null)
if (-not $gitSha) { Fail "Could not resolve current git commit (not a git repo, or no commits)." }
$dirty = (git status --porcelain 2>$null)
if ($dirty) {
    $gitSha = "$gitSha-dirty"
    Write-Host "  Warning: working tree has uncommitted changes; tagging as '$gitSha'." -ForegroundColor Yellow
}
$acrServer = "$AcrName.azurecr.io"
$image = "$acrServer/${ImageName}:$gitSha"
Write-Host "  Image tag: $image" -ForegroundColor Green

Write-Host "== Step 4/6: docker build ==" -ForegroundColor Cyan
docker build -t $image .
if ($LASTEXITCODE -ne 0) { Fail "docker build failed." }

Write-Host "== Step 5/6: az acr login + docker push ==" -ForegroundColor Cyan
az acr login --name $AcrName
if ($LASTEXITCODE -ne 0) { Fail "az acr login failed." }
docker push $image
if ($LASTEXITCODE -ne 0) { Fail "docker push failed." }

Write-Host "== Step 6/6: update Container App to the new image ==" -ForegroundColor Cyan
az containerapp update --name $ContainerApp --resource-group $ResourceGroup --image $image --output none
if ($LASTEXITCODE -ne 0) { Fail "az containerapp update failed. The previous revision is still serving traffic (Container Apps keeps the last-good revision live until a new one is confirmed)." }

$fqdn = az containerapp show --name $ContainerApp --resource-group $ResourceGroup --query "properties.configuration.ingress.fqdn" -o tsv
Write-Host ""
Write-Host "Deploy complete." -ForegroundColor Green
Write-Host "  Image:   $image"
Write-Host "  Backend: https://$fqdn"
Write-Host "  Health:  https://$fqdn/api/v6/health"
Write-Host ""
Write-Host "Rollback if needed: scripts/rollback-azure.ps1" -ForegroundColor Yellow
