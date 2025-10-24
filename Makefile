# Acquisitions DevOps App - Docker Makefile
.DEFAULT_GOAL := help

# Variables
APP_NAME := acquisitions-devops-app
DEV_COMPOSE := docker-compose.dev.yml
PROD_COMPOSE := docker-compose.prod.yml

## Development Commands

.PHONY: dev-up
dev-up: ## Start development environment
	docker compose -f $(DEV_COMPOSE) up --build

.PHONY: dev-up-d
dev-up-d: ## Start development environment in detached mode
	docker compose -f $(DEV_COMPOSE) up --build -d

.PHONY: dev-down
dev-down: ## Stop development environment
	docker compose -f $(DEV_COMPOSE) down

.PHONY: dev-logs
dev-logs: ## View development logs
	docker compose -f $(DEV_COMPOSE) logs -f

.PHONY: dev-shell
dev-shell: ## Access development app shell
	docker compose -f $(DEV_COMPOSE) exec app sh

.PHONY: dev-db-shell
dev-db-shell: ## Access development database shell
	docker compose -f $(DEV_COMPOSE) exec neon-local psql -U neondb_owner -d main

.PHONY: dev-restart
dev-restart: ## Restart development environment
	docker compose -f $(DEV_COMPOSE) restart

## Production Commands

.PHONY: prod-up
prod-up: ## Start production environment
	docker compose -f $(PROD_COMPOSE) up --build -d

.PHONY: prod-down
prod-down: ## Stop production environment
	docker compose -f $(PROD_COMPOSE) down

.PHONY: prod-logs
prod-logs: ## View production logs
	docker compose -f $(PROD_COMPOSE) logs -f

.PHONY: prod-shell
prod-shell: ## Access production app shell
	docker compose -f $(PROD_COMPOSE) exec app sh

.PHONY: prod-monitoring
prod-monitoring: ## Start production with monitoring
	docker compose -f $(PROD_COMPOSE) --profile monitoring up -d

.PHONY: prod-proxy
prod-proxy: ## Start production with reverse proxy
	docker compose -f $(PROD_COMPOSE) --profile proxy up -d

.PHONY: prod-full
prod-full: ## Start production with all services
	docker compose -f $(PROD_COMPOSE) --profile monitoring --profile proxy up -d

## Database Commands

.PHONY: migrate
migrate: ## Run database migrations (development)
	docker compose -f $(DEV_COMPOSE) exec app npm run db:migrate

.PHONY: generate
generate: ## Generate database migrations
	docker compose -f $(DEV_COMPOSE) exec app npm run db:generate

.PHONY: studio
studio: ## Open database studio
	docker compose -f $(DEV_COMPOSE) exec app npm run db:studio

## Build Commands

.PHONY: build
build: ## Build application image
	docker build -t $(APP_NAME):latest .

.PHONY: build-dev
build-dev: ## Build development image
	docker build -t $(APP_NAME):dev --target development .

.PHONY: build-prod
build-prod: ## Build production image
	docker build -t $(APP_NAME):prod --target production .

## Cleanup Commands

.PHONY: clean
clean: ## Clean up Docker resources
	docker system prune -f

.PHONY: clean-all
clean-all: ## Clean up all Docker resources including volumes
	docker system prune -a -f
	docker volume prune -f

.PHONY: clean-images
clean-images: ## Remove application images
	docker rmi $(APP_NAME):latest $(APP_NAME):dev $(APP_NAME):prod 2>/dev/null || true

## Testing Commands

.PHONY: test-build
test-build: ## Test Docker builds
	docker build -t $(APP_NAME)-test:dev --target development .
	docker build -t $(APP_NAME)-test:prod --target production .
	docker rmi $(APP_NAME)-test:dev $(APP_NAME)-test:prod

.PHONY: test-health
test-health: ## Test application health endpoint
	curl -f http://localhost:8000/health || echo "Health check failed"

## Utility Commands

.PHONY: status
status: ## Show status of all containers
	docker compose -f $(DEV_COMPOSE) ps
	docker compose -f $(PROD_COMPOSE) ps

.PHONY: stats
stats: ## Show container resource usage
	docker stats --no-stream

.PHONY: install
install: ## Install dependencies locally
	npm install

.PHONY: lint
lint: ## Run linter
	npm run lint

.PHONY: help
help: ## Display this help message
	@echo "$(APP_NAME) Docker Commands"
	@echo "============================"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'