.PHONY: dev run worker build test test-integration lint fmt vet tidy \
	migrate-up migrate-down migrate-version \
	docker-up docker-down docker-logs deploy

# Loads .env into the environment for local-only targets (run/worker/migrate-*).
# Production never uses this file — env vars come from the deploy environment.
ENV_FILE ?= .env
LOAD_ENV = set -a; [ -f $(ENV_FILE) ] && . ./$(ENV_FILE); set +a;

## --- Local development ---

dev: docker-up migrate-up ## One-command start: dependencies (docker) + migrations + api, in the foreground
	$(MAKE) run

run: ## Run the API server locally (needs docker-up first, unless using `make dev`)
	$(LOAD_ENV) go run ./cmd/api

worker: ## Run the background worker locally (needs docker-up first)
	$(LOAD_ENV) go run ./cmd/worker

## --- Build ---

build: ## Build api and worker binaries into ./bin
	go build -o bin/api ./cmd/api
	go build -o bin/worker ./cmd/worker
	go build -o bin/migrate ./cmd/migrate

## --- Quality ---

test: ## Run unit tests (short mode: skips integration tests)
	go test -short ./...

test-integration: ## Run full test suite, including integration tests (needs docker-up)
	go test ./...

lint: ## Run golangci-lint
	golangci-lint run ./...

fmt: ## Format code
	gofmt -l -w .

vet: ## Run go vet
	go vet ./...

tidy: ## Sync go.mod/go.sum with actual imports
	go mod tidy

## --- Database ---

migrate-up: ## Apply all pending migrations
	$(LOAD_ENV) go run ./cmd/migrate up

migrate-down: ## Roll back the last migration
	$(LOAD_ENV) go run ./cmd/migrate down

migrate-version: ## Print current migration version
	$(LOAD_ENV) go run ./cmd/migrate version

## --- Docker (local dev stack: postgres, redis, minio only — see deployments/compose/docker-compose.yml) ---

docker-up: ## Start dependencies and block until they're healthy
	docker compose -f deployments/compose/docker-compose.yml up -d --wait

docker-down: ## Stop the local dev stack
	docker compose -f deployments/compose/docker-compose.yml down

docker-logs: ## Tail logs from the local dev stack
	docker compose -f deployments/compose/docker-compose.yml logs -f

## --- Deploy (VPS, production compose file) ---

PROD_COMPOSE = docker compose --env-file $(ENV_FILE) -f deployments/compose/docker-compose.prod.yml

deploy: ## Pull latest images and restart the production stack on the VPS
	$(PROD_COMPOSE) pull
	$(PROD_COMPOSE) up -d
	$(MAKE) migrate-up

help: ## List available targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
