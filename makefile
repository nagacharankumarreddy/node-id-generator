start:
	@echo "Starting services..."
	@docker-compose up -d --build
	@echo "All services are up. Starting the app..."
	@docker-compose logs -f app

stop:
	@echo "Stopping all services and removing volumes..."
	@docker-compose down --volumes
	@echo "All services and volumes stopped and removed."
