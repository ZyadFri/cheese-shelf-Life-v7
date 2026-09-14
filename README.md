<div align="center">

# 🧀 Shelf-Life Studio

**An evidence-to-decision platform for Canadian cheese shelf-life prediction**

Six category-and-endpoint specialist models, real-time formulation prediction, efficacy classification, context-adjusted ingredient ranking, and an AI research assistant — built for McGill's Department of Food Science and Agricultural Chemistry.

[![Live app](https://img.shields.io/badge/Live%20app-cheese--shelf--life--studio.vercel.app-7A1B2E?style=for-the-badge)](https://cheese-shelf-life-studio.vercel.app)
[![Backend](https://img.shields.io/badge/API-FastAPI-009688?style=flat-square&logo=fastapi)](backend)
[![Frontend](https://img.shields.io/badge/Frontend-Next.js%2016-000000?style=flat-square&logo=nextdotjs)](frontend)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](requirements.txt)

</div>

---

## What this is

Cheese producers have to assign durable-life dates and validate product quality
against heterogeneous evidence — laboratory studies, ingredient trials, storage
experiments, and regulatory guidance — while managing the real economic and
environmental cost of avoidable food loss. **Shelf-Life Studio** is a
decision-support platform built around that problem: six independently
trained specialist models (one per cheese category × prediction endpoint)
serve real-time formulation predictions, backed by classification, ingredient
efficacy ranking, model explainability, and a grounded AI assistant — every
number traceable back to a saved training artifact, nothing fabricated at
request time.

|  |  |
|---|---|
| 🔮 **Guided prediction wizard** | Search a cheese → confirm its profile → configure storage/packaging → optional preservation treatment → get a real prediction with control-vs-candidate comparison, confidence signals, and a full contribution breakdown. |
| 🧪 **Formulation efficacy classification** | Predicts Low / Medium / High efficacy tier for a treatment, with per-class probabilities and supporting/opposing factor explanations. |
| 📊 **Ingredient ranking** | 18 preservation ingredients ranked by *context-adjusted* effect (not just raw averages), with an interactive efficacy landscape and per-ingredient evidence detail. |
| 🔍 **Explainability** | Global permutation/native feature importance per algorithm, segment-level error breakdowns, and local (per-prediction) contribution waterfalls. |
| 🤖 **Ask Shelf-Life AI** | A tool-using assistant (Gemini, with Cloudflare/Cerebras/Groq/Ollama fallback) that answers questions about the dataset and models by calling the same backend the app uses — it cannot invent a number it didn't fetch. |
| 📈 **Modeling dashboard** | Full train/val/test metrics, model comparison, and training-run provenance for all six specialists — read-only; retraining is CLI-only, never from the dashboard. |

## Real, reported model performance

Six specialists = {soft, semi-hard, hard} cheese categories × {general shelf
life, safety endpoint} tasks, each choosing the best of Random Forest,
LightGBM, XGBoost, and an Explainable Boosting Machine by validation RMSE.

| Category | Endpoint | Test R² | Test MAE |
|---|---|---:|---:|
| Soft | General shelf life | **0.971** | 2.53 d |
| Semi-hard | General shelf life | **0.920** | 8.00 d |
| Hard | General shelf life | **0.932** | 6.93 d |
| Soft | Safety endpoint | 0.594 | 7.73 d |
| Semi-hard | Safety endpoint | 0.317 | 13.26 d |
| Hard | Safety endpoint | −0.011 | 17.80 d |

Safety-endpoint performance degrades as right-censoring increases (0% → 69% →
93% → 100% of labels are lower bounds rather than observed failures across
soft → semi-hard → hard) — an honest, documented limitation, not a hidden one.
The treated-sample efficacy classifier reaches **0.7945 test macro-F1**, and
ingredient ranking shows **Spearman ρ = 0.9298** stability between full-data
and held-out-split rankings. Full methodology, censoring analysis, and a
21-case external literature stress test are written up in
[`docs/`](docs) and the conference paper materials.

## Quickstart

```bash
# Backend (FastAPI, port 8010 -- not 8000)
python -m venv .venv && source .venv/bin/activate   # or .venv\Scripts\activate on Windows
pip install -r backend/requirements.txt
uvicorn backend.main:app --port 8010

# Frontend (Next.js, port 3000), in a second terminal
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**, sign up for a local account, and the app is
fully usable — models load once at backend startup from the saved artifacts
under `artifacts_v7/`; nothing retrains automatically. Set `GEMINI_API_KEY`
(see `backend/.env.example`) to enable the AI assistant; every other feature
works without it.

**Retraining** is deliberately CLI-only, never triggered from the dashboard:

```bash
python train_specialists.py          # the 6 live V6/V7 shelf-life specialists
python train_classifier.py           # efficacy classifier
python train_ingredient_ranking.py   # ingredient ranking module
```

## Architecture

```
┌─────────────────┐      /api/*       ┌──────────────────────┐
│  Next.js 16      │ ───────────────▶ │  FastAPI backend       │
│  (frontend/)      │ ◀─────────────── │  (backend/main.py)      │
│  :3000            │   JSON + cookie  │  :8010                  │
└─────────────────┘                   └──────────┬───────────┘
                                                    │
                        ┌───────────────────────────┼───────────────────────────┐
                        ▼                            ▼                            ▼
              specialist_registry.py        classification_service.py   ingredient_ranking_service.py
              model_service.py              (Low/Med/High efficacy)      (context-adjusted ranking)
              (6 specialists: RF/           
               LightGBM/XGBoost/EBM)                                    backend/assistant/
                        │                                                (Gemini + 4 fallback providers,
                        ▼                                                 tool-calling over the services above)
              artifacts_v7/{category}/{task}/
              (metrics, predictions, feature importance,
               trained model .joblib files -- gitignored,
               regenerated by train_specialists.py)
```

The scientific-literature *extraction* pipeline (PDF → structured evidence →
promoted training data) that feeds this modeling layer lives in a companion
repository, not here — this repo is the trained-model serving application.

## Repository layout

```
.
├── backend/                 FastAPI app -- auth, prediction/classification/
│                             ranking routes, AI assistant, SQLite user store
├── frontend/                 Next.js 16 app (App Router, Tailwind, Recharts)
├── data/raw/                 Training datasets + external literature test sets
├── artifacts_v7/              ← gitignored: regenerate with train_specialists.py
├── artifacts_classification/  ← gitignored: regenerate with train_classifier.py
├── artifacts_ingredient_ranking/ ← gitignored: regenerate with train_ingredient_ranking.py
├── model_versions/            ← gitignored: timestamped backup snapshots
│
├── model_service.py           }
├── classification_service.py  }  Core prediction services -- imported directly
├── ingredient_ranking_service.py } by backend/main.py and backend/assistant/.
├── specialist_registry.py     }  Deliberately kept at repo root: the Dockerfile
├── concentration_units.py     }  COPYs these exact files by name for the
├── feature_naming.py          }  production image.
│
├── train_specialists.py       }  CLI training entry points -- referenced by
├── train_classifier.py        }  name in the frontend's own "Retraining is
├── train_ingredient_ranking.py}  CLI-only" copy, so they stay at root too.
├── train_models.py            }  (train_models.py trains the retired Dash app's models)
├── app.py                     Retired Dash dashboard (superseded by frontend/)
│
├── docs/                      Deployment guide, model-version history,
│                                generalization/experiment writeups
├── reports/                   Generated HTML/PDF evaluation reports + their
│                                underlying prediction CSVs (regenerable)
├── scripts/
│   ├── evaluation/             External literature stress-test scripts
│   ├── reporting/               HTML/PDF report generators
│   ├── tests/                   pytest suites (assistant, classification, V6/V7 routing)
│   ├── misc/                    One-off data/image utilities
│   └── *.ps1                    Azure deploy/rollback/cleanup scripts
├── presentation_demo/          Playwright automation that records the two
│                                McGill conference-presentation demo videos
│                                against the real running app (see its own README)
│
├── Dockerfile, docker-compose.yml, Caddyfile   Azure Container Apps deployment
└── CLAUDE.md                   Standing instructions for AI-assisted work here
```

## Deployment

Production is a Next.js frontend on **Vercel** talking same-origin (via a
rewrite) to a **FastAPI backend on Azure Container Apps**, with SQLite backed
up to Azure Files. Full runbook, secrets checklist, and rollback procedure:
[`docs/DEPLOYMENT_AZURE.md`](docs/DEPLOYMENT_AZURE.md).

```bash
scripts/deploy-azure.ps1      # build, push, deploy the backend image
scripts/rollback-azure.ps1    # revert to the previous revision
scripts/cleanup-acr-images.ps1
```

## Tech stack

**Backend** — FastAPI · SQLAlchemy · scikit-learn / LightGBM / XGBoost / InterpretML (EBM) · SHAP · pandas · JWT sessions via `backend/auth`
**Frontend** — Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS · Base UI · Recharts · Framer Motion
**AI assistant** — Provider-agnostic (`backend/assistant/providers/`): Gemini, Cloudflare Workers AI, Cerebras, Groq, or fully local Ollama
**Infra** — Docker · Azure Container Apps + Azure Files · Vercel · Caddy

## Authors

**Zyad Fri**, **Loubna Bennabou**, **Zahra Allahdad**, **Salwa Karboune**
Department of Food Science and Agricultural Chemistry, McGill University
