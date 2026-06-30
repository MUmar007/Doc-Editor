.PHONY: up down test lint format

up:
	docker compose up --build

down:
	docker compose down -v

test:
	cd backend && poetry run pytest tests/ -v

lint:
	cd backend && poetry run ruff check .
	cd frontend && npm run lint

format:
	cd backend && poetry run ruff format .
	cd frontend && npm run format
