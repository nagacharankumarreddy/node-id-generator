# Makefile for starting MySQL, Redis, and Node.js using Docker Compose

# Variables
DOCKER_COMPOSE_CMD = docker-compose

# Targets
.PHONY: start stop logs down

# Default target: Start everything
start: docker-start node-start
	@echo "All services started."

# Start Docker Compose services (MySQL, Redis, and Node.js)
docker-start:
	@echo "Stopping any running containers..."
	@$(DOCKER_COMPOSE_CMD) down
	@echo "Starting MySQL, Redis, and Node.js containers..."
	@$(DOCKER_COMPOSE_CMD) up -d
	@echo "Docker services are up."

# Start Node.js application
node-start:
	@echo "Starting Node.js application in Docker..."
	@$(DOCKER_COMPOSE_CMD) exec node-app node index.js
	@echo "Node.js application started."

# Show logs for all services
logs:
	@$(DOCKER_COMPOSE_CMD) logs -f

# Stop and remove all containers
down:
	@echo "Stopping and removing Docker services..."
	@$(DOCKER_COMPOSE_CMD) down
	@echo "Docker services stopped."
