#!/bin/bash

# Agnes Nails Database Backup Script
# Usage: ./backup.sh

set -e

# Configuration
BACKUP_DIR="/var/backups/agnes-nails"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-7}
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="agnes_nails_backup_${TIMESTAMP}.sql"

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting database backup..."

# Create backup
docker exec agnes-postgres-prod pg_dump \
    -U "${DATABASE_USER:-postgres}" \
    -d "${DATABASE_NAME:-agnes_nails}" \
    > "${BACKUP_DIR}/${BACKUP_FILE}"

# Compress backup
gzip "${BACKUP_DIR}/${BACKUP_FILE}"

echo "Backup created: ${BACKUP_DIR}/${BACKUP_FILE}.gz"

# Remove old backups
find "$BACKUP_DIR" -name "agnes_nails_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Old backups cleaned (retention: ${RETENTION_DAYS} days)"
echo "Backup completed successfully!"
