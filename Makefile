.PHONY: build run

build: ## Builds the server
	@echo "Build"
	./node_modules/.bin/rollup -c ./rollup_config.js

run: ## Runs the server
	@echo "Run"
	npm start

lint: ## Lints
	@echo "Run"
	./node_modules/.bin/eslint --fix src/App.js
