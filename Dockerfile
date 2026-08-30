FROM python:3.13-slim

# libgomp1 is required at runtime by LightGBM/XGBoost's OpenMP-linked wheels.
RUN apt-get update && apt-get install -y --no-install-recommends libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Root-level service modules imported by backend/main.py via sys.path.
# concentration_units.py / feature_naming.py are plain lookup-table modules
# imported by classification_service.py. train_specialists.py is imported by
# specialist_registry.py purely for its DATA_VERSION_CONFIG constant -- its
# argparse-driven training entrypoint (guarded by if __name__=="__main__")
# is never invoked here since CMD only ever runs uvicorn; the file has to be
# present for the import to resolve, but nothing in this image can trigger
# retraining.
COPY model_service.py classification_service.py ingredient_ranking_service.py specialist_registry.py concentration_units.py feature_naming.py train_specialists.py ./

# The FastAPI package itself (never copies backend/.env or backend/storage --
# secrets and the SQLite database are supplied/mounted at runtime, not baked
# into the image).
COPY backend/__init__.py backend/main.py backend/db.py ./backend/
COPY backend/auth/ ./backend/auth/
COPY backend/assistant/ ./backend/assistant/

# Data actually read at runtime (ModelService + the V6 specialist registry).
# No training data beyond what those two modules load; no notebooks, no
# training scripts -- nothing that would let the container retrain anything.
COPY data/raw/CHEESE_SHELF_LIFE_REVISED_READY_TO_TRAIN.xlsx ./data/raw/CHEESE_SHELF_LIFE_REVISED_READY_TO_TRAIN.xlsx
COPY data/raw/CHEESE_SHELF_LIFE_V6_SOFT_SPECIALIST.csv ./data/raw/CHEESE_SHELF_LIFE_V6_SOFT_SPECIALIST.csv
COPY data/raw/CHEESE_SHELF_LIFE_V6_SEMI_HARD_SPECIALIST.csv ./data/raw/CHEESE_SHELF_LIFE_V6_SEMI_HARD_SPECIALIST.csv
COPY data/raw/CHEESE_SHELF_LIFE_V6_HARD_SPECIALIST.csv ./data/raw/CHEESE_SHELF_LIFE_V6_HARD_SPECIALIST.csv

# Trained model artifacts. These are gitignored (regenerable via
# train_models.py / train_specialists.py / train_classifier.py /
# train_ingredient_ranking.py) and never pulled by `git clone` -- the build
# context on the deploy host must have these four directories placed here
# (e.g. via `scp -r` from wherever they were trained) before `docker build`.
COPY artifacts/ ./artifacts/
COPY artifacts_v6/ ./artifacts_v6/
COPY artifacts_classification/ ./artifacts_classification/
COPY artifacts_ingredient_ranking/ ./artifacts_ingredient_ranking/

RUN useradd --create-home appuser \
    && mkdir -p /app/backend/storage \
    && chown -R appuser:appuser /app
USER appuser

ENV PYTHONUNBUFFERED=1

EXPOSE 8010

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8010"]
