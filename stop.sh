#!/bin/bash

# Agnes Nails - Docker Stop Script

echo "==================================="
echo "Stopping Agnes Nails Services"
echo "==================================="
echo ""

# Parse arguments
REMOVE_VOLUMES=${1:-no}

if [ "$REMOVE_VOLUMES" = "clean" ]; then
    echo "WARNING: This will remove all data including the database!"
    read -p "Are you sure? (yes/no): " CONFIRM
    if [ "$CONFIRM" = "yes" ]; then
        echo "Stopping and removing all containers, networks, and volumes..."
        docker-compose down -v
        docker-compose -f docker-compose.dev.yml down -v
    else
        echo "Cancelled."
        exit 0
    fi
else
    echo "Stopping containers..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
fi

echo ""
echo "Services stopped successfully."
echo ""
echo "To start again: ./start.sh [dev|prod]"
echo "==================================="
