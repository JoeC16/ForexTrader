FROM python:3.12-slim

WORKDIR /app

COPY apps/api/requirements.txt apps/api/requirements.txt
RUN pip install --no-cache-dir -r apps/api/requirements.txt

COPY apps/__init__.py apps/__init__.py
COPY apps/api apps/api
COPY packages/__init__.py packages/__init__.py
COPY packages/ml packages/ml

ENV PYTHONUNBUFFERED=1
EXPOSE 8000

CMD sh -c "python apps/api/db/migrate.py && uvicorn apps.api.main:app --host 0.0.0.0 --port ${PORT:-8000}"
