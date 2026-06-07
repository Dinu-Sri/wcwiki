#!/bin/sh
# wcWIKI Database Backup Script
# Run daily via cron: 0 3 * * * /opt/wcwiki/scripts/backup-db.sh
# Or manually: docker exec wcwiki-app sh scripts/backup-db.sh
# Also triggerable from Admin Panel via API

set -e

BACKUP_DIR="${BACKUP_DIR:-/opt/backups/wcwiki}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
CONTAINER="${DB_CONTAINER:-wcwiki-postgres}"
DB_USER="${DB_USER:-wcwiki}"
DB_NAME="${DB_NAME:-wcwiki}"
STATUS_FILE="$BACKUP_DIR/backup-status.json"

mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/wcwiki-${TIMESTAMP}.sql.gz"

echo "[backup] Starting database backup at $(date)"

# Dump and compress
docker exec "$CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"

BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "[backup] Backup created: $BACKUP_FILE ($BACKUP_SIZE)"

# Clean up old backups
DELETED=$(find "$BACKUP_DIR" -name "*.sql.gz" -mtime +${RETENTION_DAYS} -delete -print | wc -l)
if [ "$DELETED" -gt 0 ]; then
  echo "[backup] Cleaned up $DELETED old backup(s) older than ${RETENTION_DAYS} days"
fi

# Count remaining backups
COUNT=$(find "$BACKUP_DIR" -name "*.sql.gz" | wc -l)

# Write status file for admin panel
cat > "$STATUS_FILE" << STATUSEOF
{
  "lastBackup": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "lastFile": "wcwiki-${TIMESTAMP}.sql.gz",
  "lastSize": "$BACKUP_SIZE",
  "totalBackups": $COUNT,
  "retentionDays": $RETENTION_DAYS,
  "backupDir": "$BACKUP_DIR",
  "success": true
}
STATUSEOF

echo "[backup] Status file written to $STATUS_FILE"
echo "[backup] Done at $(date)"
