FROM python:3.12-slim

WORKDIR /app

ENV POETRY_NO_INTERACTION=1 \
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    POETRY_CACHE_DIR=/tmp/poetry_cache \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN pip install poetry==2.4.1

COPY pyproject.toml poetry.lock ./
RUN poetry install --without dev --no-root && rm -rf $POETRY_CACHE_DIR

COPY . .

EXPOSE 8000

# Shell form so ${PORT} expands — Railway injects PORT, Docker Compose uses the default
CMD poetry run uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
