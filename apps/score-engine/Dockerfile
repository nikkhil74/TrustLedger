# ============================================================
# Dockerfile — Python Score Engine (FastAPI + XGBoost)
# ============================================================

FROM python:3.12-slim AS base
WORKDIR /app

# System dependencies for numpy/xgboost
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc g++ curl && \
    rm -rf /var/lib/apt/lists/*

# --- Dependencies ---
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# --- Application ---
COPY app/ app/

ENV SCORE_ENGINE_HOST=0.0.0.0
ENV SCORE_ENGINE_PORT=5000

EXPOSE 5000

HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "5000"]
