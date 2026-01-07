# Scripts Directory

This directory contains utility scripts for managing the Agnes Nails application.

## backup.sh

Automated PostgreSQL database backup script.

**Features:**
- Creates timestamped SQL backups
- Compresses backups with gzip
- Automatically removes old backups (default: 7 days retention)
- Can be run manually or via cron job

**Usage:**

Manual backup:
```bash
./scripts/backup.sh
```

Automated daily backups (add to crontab):
```bash
# Run daily at 2 AM
0 2 * * * cd /home/deploy/apps/agnes-nails && ./scripts/backup.sh >> /var/log/agnes-nails-backup.log 2>&1
```

**Configuration:**

Set retention period in `.env.production`:
```bash
BACKUP_RETENTION_DAYS=7
```

**Backup Location:**
```
/var/backups/agnes-nails/
```

**Restore from Backup:**
```bash
gunzip -c /var/backups/agnes-nails/agnes_nails_backup_YYYYMMDD_HHMMSS.sql.gz | \
docker exec -i agnes-postgres-prod psql -U postgres -d agnes_nails
```

## Adding More Scripts

When adding new scripts:
1. Make them executable: `chmod +x scripts/script-name.sh`
2. Add documentation to this README
3. Use the same configuration approach (environment variables)
4. Add error handling with `set -e`
5. Include logging for troubleshooting
