#!/bin/bash

# Agnes Nails - Docker Start Script

echo "==================================="
echo "Agnes Nails - Appointment System"
echo "==================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

# Parse arguments
MODE=${1:-prod}

if [ "$MODE" = "dev" ]; then
    echo "Starting in DEVELOPMENT mode..."
    docker-compose -f docker-compose.dev.yml up -d
elif [ "$MODE" = "prod" ]; then
    echo "Starting in PRODUCTION mode..."
    docker-compose up -d
else
    echo "Invalid mode. Use 'dev' or 'prod'"
    echo "Usage: ./start.sh [dev|prod]"
    exit 1
fi

echo ""
echo "Waiting for services to start..."
sleep 5

# Check service status
echo ""
echo "==================================="
echo "Service Status:"
echo "==================================="
docker-compose ps

echo ""
echo "==================================="
echo "Application URLs:"
echo "==================================="
echo "Frontend:  http://localhost:3000"
echo "Backend:   http://localhost:3001"
echo "Database:  localhost:5432"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop:      docker-compose down"
echo "==================================="
