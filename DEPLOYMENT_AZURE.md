# Azure Deployment — Shelf-Life Studio

Architecture, resources, and operational procedures for the production
deployment. No secret values appear in this document — only environment
variable **names**. Actual values live only in Azure Container App secrets
and in Vercel's project environment variables, both entered through their
respective consoles/CLIs, never committed to git.

## Architecture

```
Browser
  |
  v
Vercel (Next.js frontend)  -- same-origin rewrite: /api/:path* --> BACKEND_ORIGIN/api/:path*
  |
  v  (server-side only, BACKEND_ORIGIN is NOT NEXT_PUBLIC_-prefixed)
Azure Container Apps: cheese-shelflife-api (FastAPI backend, port 8010)
  |                                    |
  v                                    v
Azure Container Registry            Azure Files share "appstorage"
(acrcheeseshelflifej8at7j)           mounted at /app/backend/storage
  image: cheese-api:<git-sha>        (SQLite DB + avatar uploads persist
                                       across deploys / scale-to-zero)
```

The frontend never talks to the backend cross-origin. `next.config.ts`
rewrites `/api/*` on the Vercel domain to the backend's real URL
server-side, so the browser only ever sees one origin — which keeps the
httpOnly session cookie same-origin with no CORS/credentials complexity on
the client.

## Resources (all in `francecentral`)

This subscription (Azure for Students) is restricted by a subscription-level
policy (`sys.regionrestriction`) to: `belgiumcentral, polandcentral,
denmarkeast, norwayeast, francecentral`. The original request was
`canadacentral`; France Central was substituted for all actual resources
(the resource group's own `location` metadata field still literally reads
`canadacentral` from how it was created, which is harmless — it does not
affect where child resources actually run).

| Resource | Name | Notes |
|---|---|---|
| Resource group | `rg-cheese-shelflife` | |
| Container Registry | `acrcheeseshelflifej8at7j` | Basic SKU, admin user **disabled** — pull is via managed identity only, no stored registry password |
| Storage account | `stcheeseshelflifej8at7j` | Standard_LRS |
| File share | `appstorage` (on the storage account above) | 5 GiB quota |
| Managed identity | `id-cheese-acr-pull` | User-assigned; granted `AcrPull` role scoped to the ACR; also assigned to the Container App itself |
| Container Apps environment | `cae-cheese-shelflife` | Consumption plan |
| Environment storage definition | `appstorage` (on the environment) | Points at the file share above; a Container App still needs its own volume + volumeMount to actually use it |
| Container App | `cheese-shelflife-api` | 1 vCPU / 2 GiB RAM, min replicas 0, max replicas 1, ingress external, target port 8010 |

## Sizing and scaling

- **1 vCPU, 2 GiB RAM** — sized against the measured post-optimization RSS
  of the fully-loaded backend (~724–786 MB with all 6 V6 specialists +
  legacy models loaded), leaving headroom.
- **Min replicas 0, max replicas 1** — the app scales to zero when idle
  (no cost while nobody is using it) and cold-starts on the next request.
  This means the **first** request after idle pays a cold-start cost (see
  "Cold start" below); this is a deliberate cost/latency tradeoff for a
  low-traffic academic project, not an oversight.

## Environment variables (names only)

Set as Container App **secrets** (never printed, never in git):
`SECRET_KEY`, `GEMINI_API_KEY`, `CEREBRAS_API_KEY`, `CLOUDFLARE_API_TOKEN`

Set as Container App **plain env vars** (non-secret config):
`STORAGE_DIR` (`/app/backend/storage`), `COOKIE_SECURE` (`1`),
`LLM_PROVIDER`, `LLM_FALLBACK_PROVIDERS`, `GEMINI_MODEL`, `CEREBRAS_MODEL`,
`CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_MODEL`, `ASSISTANT_MAX_TOOL_ROUNDS`,
`ASSISTANT_MAX_HISTORY_MESSAGES`, `CORS_ORIGINS`

Set on **Vercel** (frontend project):
- `BACKEND_ORIGIN` — server-side only, the Container App's HTTPS FQDN. Used
  only by `next.config.ts`'s rewrite; never exposed to the browser.
- `NEXT_PUBLIC_API_BASE` — set to an **empty string** in production so the
  frontend's fetch wrapper (`frontend/src/lib/api.ts`) issues relative
  `/api/...` requests that hit the same-origin rewrite above, instead of
  its local-dev default of `http://<hostname>:8010`.

GROQ_API_KEY/GROQ_MODEL exist in local `backend/.env` but are unused (the
configured provider chain is `gemini` → `cloudflare` → `cerebras`) and were
intentionally left out of the deployed secrets/env vars.

## Persistent storage design

The container filesystem is ephemeral — anything written inside it (the
SQLite database, uploaded avatar images) is lost on restart/redeploy/scale
event unless it lives on the mounted Azure Files volume.
`backend/db.py`/`backend/auth/storage.py` already read `STORAGE_DIR` (or
default to a local path) for both the DB file and avatar uploads, so
mounting Azure Files at `/app/backend/storage` and setting
`STORAGE_DIR=/app/backend/storage` makes both durable across:
- Redeploys (new image, same volume)
- Scale-to-zero → cold start (same volume re-mounted)
- Revision changes

Verified: created a user via `/api/auth/signup` against the live deployment
and confirmed `/api/auth/me` + `/api/auth/login` return it back.

## First deployment (already done once — reference only)

The gitignored artifact directories (`artifacts/`, `artifacts_v6/`,
`artifacts_classification/`, `artifacts_ingredient_ranking/`) are **not**
in git — a fresh `git clone` will not have them. The first image build
must happen from a local machine that has trained them (or copied them in),
using `docker build` + `docker push` directly against ACR — there is no CI
pipeline pulling from GitHub for this project.

```
az acr login --name acrcheeseshelflifej8at7j
docker build -t acrcheeseshelflifej8at7j.azurecr.io/cheese-api:<tag> .
docker push acrcheeseshelflifej8at7j.azurecr.io/cheese-api:<tag>
```

Container App creation note: the installed `containerapp` CLI extension
(1.3.0b4) has a validation bug that rejects a valid managed-identity
resource ID when `--registry-identity` and `--user-assigned` are passed
together to `az containerapp create`. Workaround used here: create with a
public placeholder image and no identity, then attach the identity
(`az containerapp identity assign`), configure the registry
(`az containerapp registry set --identity ...`), and only then
`az containerapp update --image <real image>`. If a future CLI version
fixes this, the two-step dance can be collapsed back into one `create`
call.

Also note: **Git Bash on Windows auto-rewrites arguments that look like
absolute Unix paths** (e.g. `/subscriptions/...`, `/app/backend/storage`)
into Windows paths before `az` ever sees them. Any `az` command passing an
Azure resource ID or a Unix-style path from Git Bash needs
`MSYS_NO_PATHCONV=1` and `MSYS2_ARG_CONV_EXCL="*"` set first, or the values
arrive silently corrupted (no error — just a wrong value baked into the
resource).

## Redeploy procedure (routine — after this point)

```
scripts\deploy-azure.ps1
```

This is idempotent and safe to re-run: it verifies the artifact
directories exist, builds a new image tagged with the current git short
SHA, pushes it, and points the existing Container App at it. It does not
touch resource creation, secrets, identity, or storage mounting — those
are one-time setup already done. Run it any time backend code changes.

## Rollback procedure

```
scripts\rollback-azure.ps1
```

Shifts 100% of ingress traffic to the previous revision without deleting
the current (bad) one — so rolling forward again is just as easy. Pass
`-RevisionName <name>` to target a specific older revision (see
`az containerapp revision list --name cheese-shelflife-api --resource-group rg-cheese-shelflife`).

## Old image cleanup

```
scripts\cleanup-acr-images.ps1            # dry run — prints what it would delete
scripts\cleanup-acr-images.ps1 -Execute   # actually deletes
```

Never deletes a tag referenced by any existing Container App revision
(active or inactive); always keeps the 5 most recent tags beyond that.

## Logs and debugging

```
az containerapp logs show --name cheese-shelflife-api --resource-group rg-cheese-shelflife --follow
az containerapp revision list --name cheese-shelflife-api --resource-group rg-cheese-shelflife --output table
az containerapp show --name cheese-shelflife-api --resource-group rg-cheese-shelflife --query properties.runningStatus
```

## Cost control notes

- **No payment method is on this subscription and none was added.** Every
  resource above uses either a genuine free tier or a negligible-cost SKU:
  - Container Apps Consumption plan: free monthly grant of 180,000
    vCPU-seconds + 360,000 GiB-seconds + 2,000,000 requests — a low-traffic
    academic deployment scaling to zero when idle stays well inside this.
  - ACR Basic: the cheapest ACR tier (~$5/month) — ACR has no free-forever
    tier, this is the minimum cost component of this deployment.
  - Azure Files: billed by GB stored + transactions, pennies at this scale
    (5 GiB share holding a SQLite DB and a handful of avatar images).
  - Log Analytics (if/when Container Apps logging is enabled): ~5 GB/month
    free ingestion.
- Scale-to-zero (min replicas 0) means **zero compute cost** while nobody
  is using the app.
- Known, deliberately deferred optimization: the backend image is ~5.47 GB,
  inflated by `interpret==0.7.8` pulling in Dash/Plotly/matplotlib/gevent
  and an unused ~342 MB `nvidia_nccl_cu12` CUDA package as transitive
  dependencies. Not touched during this deployment to avoid destabilizing
  the explainability feature without separate re-testing — a candidate for
  a future pass (e.g. switching to `interpret-core`).

## Scale-to-zero / cold start behavior

With min replicas 0, the app fully stops after a period of no traffic and
the next request triggers a cold start (new container, backend re-imports
model/service modules and lazy-loads whichever specialist the first
request actually needs — see the memory-optimization work: models load
lazily per-model rather than all six upfront). Measured cold-start timing
is in the deployment's final report.

**Before a live presentation or demo**, warm the app up a minute or two
ahead of time:
```
curl https://<backend-fqdn>/api/v6/health
```
To temporarily disable scale-to-zero for a presentation (keeps a replica
always warm — costs a small amount of continuous compute for however long
you leave it set this way, remember to revert):
```
az containerapp update --name cheese-shelflife-api --resource-group rg-cheese-shelflife --min-replicas 1
# ... after the presentation:
az containerapp update --name cheese-shelflife-api --resource-group rg-cheese-shelflife --min-replicas 0
```

## Known pre-existing item (not introduced by this deployment)

`backend/storage/avatars/*.webp` (real user avatar uploads) were already
committed to this git repository in an earlier session, before the git
safety rules for this project were written. This deployment did not add
new avatar commits and closed the gap going forward by adding
`backend/storage/avatars/` to `.gitignore`, but did **not** rewrite git
history to remove the ones already committed — that's a separate,
deliberate decision for the project owner to make (removing files from
git history is disruptive to any existing clones/forks).
