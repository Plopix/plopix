# === Helper ===

# Styles
YELLOW=$(shell echo "\033[00;33m")
RED=$(shell echo "\033[00;31m")
RESTORE=$(shell echo "\033[0m")

# Variables
BUN := bun
CURRENT_DIR := $(shell pwd)

.DEFAULT_GOAL := list

.PHONY: list
list:
	@echo "******************************"
	@echo "${YELLOW}Available targets${RESTORE}:"
	@grep -E '^[a-zA-Z-]+:.*?## .*$$' Makefile | sort | awk 'BEGIN {FS = ":.*?## "}; {printf " ${YELLOW}%-15s${RESTORE} > %s\n", $$1, $$2}'
	@echo "${RED}==============================${RESTORE}"

.PHONY: install
install: ## Install dependencies
	@$(BUN) install

.PHONY: tests
tests: ## Run the generator tests
	@$(BUN) test

.PHONY: generate
generate: ## Generate README.md and assets/*.svg (PORTFOLIO_API=http://localhost:4321/api to use a local portfolio)
	@$(BUN) run generate
