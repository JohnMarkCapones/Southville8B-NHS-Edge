# Chapter 35: Backup & Recovery

## Table of Contents

1. [Backup Strategy](#backup-strategy)
2. [Database Backups](#database-backups)
3. [File Storage Backups](#file-storage-backups)
4. [Configuration Backups](#configuration-backups)
5. [Application Code Backups](#application-code-backups)
6. [Backup Testing](#backup-testing)
7. [Recovery Procedures](#recovery-procedures)
8. [Disaster Recovery Planning](#disaster-recovery-planning)
9. [RTO and RPO](#rto-and-rpo)
10. [Backup Automation](#backup-automation)

## Backup Strategy

### The 3-2-1 Rule

The Southville 8B NHS Edge platform follows the industry-standard 3-2-1 backup rule:

```yaml
3-2-1 Backup Rule:
  3 Copies: Keep at least 3 copies of data
    - 1 Production copy
    - 2 Backup copies

  2 Media Types: Store backups on 2 different media types
    - Local disk/NAS
    - Cloud storage (Cloudflare R2)

  1 Offsite: Keep 1 copy offsite
    - Cloud storage in different region
    - Geographic redundancy
```

### Backup Types

```yaml
Full Backup:
  Frequency: Weekly (Sunday 2:00 AM)
  Retention: 4 weeks
  Description: Complete copy of all data

Incremental Backup:
  Frequency: Daily (2:00 AM)
  Retention: 7 days
  Description: Only changes since last backup

Continuous Backup:
  Frequency: Real-time (for critical data)
  Retention: Point-in-time recovery for 30 days
  Description: Transaction logs, WAL archiving

Snapshot Backup:
  Frequency: Before major changes
  Retention: Until change verified successful
  Description: Point-in-time system snapshot
```

### Backup Scope

```yaml
Critical Data (RPO: 15 minutes):
  - User accounts and authentication
  - Student grades and assignments
  - Teacher records
  - Financial data
  - Compliance records

Important Data (RPO: 1 hour):
  - Chat messages
  - Forum posts
  - Activity logs
  - Quiz results
  - File uploads

Standard Data (RPO: 24 hours):
  - System logs
  - Temporary files
  - Cache data
  - Analytics data

Excluded from Backup:
  - Temporary files
  - Cache
  - Session data
  - Build artifacts
  - Node_modules
```

## Database Backups

### Supabase Automated Backups

Supabase provides automated backups:

```yaml
Supabase Backups:
  Automatic Backups:
    - Daily automated backups
    - Point-in-time recovery (PITR)
    - 7-day retention (free tier)
    - 30-day retention (paid tier)

  Backup Features:
    - Automated scheduling
    - Encrypted at rest
    - Geographic replication
    - One-click restore

  Access:
    - Dashboard: Settings → Database → Backups
    - API: Programmatic backup management
```

### Manual Database Backup

```bash
#!/bin/bash
# db-backup.sh - Manual database backup script

set -e

# Configuration
BACKUP_DIR="/backups/database"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Supabase connection details
DB_HOST="${SUPABASE_DB_HOST}"
DB_PORT="${SUPABASE_DB_PORT:-5432}"
DB_NAME="${SUPABASE_DB_NAME}"
DB_USER="${SUPABASE_DB_USER}"
export PGPASSWORD="${SUPABASE_DB_PASSWORD}"

echo "=== Database Backup Started: $(date) ==="

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Backup filename
BACKUP_FILE="$BACKUP_DIR/southville_db_${TIMESTAMP}.sql"
BACKUP_FILE_GZ="${BACKUP_FILE}.gz"

# 1. Create backup with pg_dump
echo "Creating database backup..."
pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --format=plain \
  --no-owner \
  --no-acl \
  --verbose \
  --file="$BACKUP_FILE" \
  2>&1 | tee "$BACKUP_DIR/backup_${TIMESTAMP}.log"

# Check if backup was successful
if [ ${PIPESTATUS[0]} -ne 0 ]; then
  echo "ERROR: Database backup failed!"
  exit 1
fi

# 2. Compress backup
echo "Compressing backup..."
gzip "$BACKUP_FILE"

# 3. Calculate checksum
echo "Calculating checksum..."
sha256sum "$BACKUP_FILE_GZ" > "${BACKUP_FILE_GZ}.sha256"

# 4. Get backup size
BACKUP_SIZE=$(du -h "$BACKUP_FILE_GZ" | cut -f1)
echo "Backup size: $BACKUP_SIZE"

# 5. Upload to cloud storage (Cloudflare R2)
echo "Uploading to cloud storage..."
aws s3 cp "$BACKUP_FILE_GZ" \
  "s3://southville-backups/database/southville_db_${TIMESTAMP}.sql.gz" \
  --endpoint-url "$R2_ENDPOINT_URL"

aws s3 cp "${BACKUP_FILE_GZ}.sha256" \
  "s3://southville-backups/database/southville_db_${TIMESTAMP}.sql.gz.sha256" \
  --endpoint-url "$R2_ENDPOINT_URL"

# 6. Verify upload
echo "Verifying upload..."
aws s3 ls "s3://southville-backups/database/southville_db_${TIMESTAMP}.sql.gz" \
  --endpoint-url "$R2_ENDPOINT_URL"

# 7. Clean up old local backups
echo "Cleaning up old local backups..."
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.sha256" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.log" -mtime +$RETENTION_DAYS -delete

# 8. Create backup metadata
cat > "$BACKUP_DIR/backup_${TIMESTAMP}.json" <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "filename": "southville_db_${TIMESTAMP}.sql.gz",
  "size": "$BACKUP_SIZE",
  "database": "$DB_NAME",
  "host": "$DB_HOST",
  "type": "full",
  "compression": "gzip",
  "status": "completed"
}
EOF

echo "=== Database Backup Completed Successfully: $(date) ==="
echo "Backup file: $BACKUP_FILE_GZ"
echo "Backup size: $BACKUP_SIZE"
```

### Incremental Backup with WAL Archiving

```bash
#!/bin/bash
# wal-archive.sh - Archive PostgreSQL WAL files

set -e

# Configuration
WAL_ARCHIVE_DIR="/backups/wal"
CLOUD_BACKUP_DIR="s3://southville-backups/wal"

# WAL file passed by PostgreSQL
WAL_FILE=$1
WAL_PATH=$2

echo "Archiving WAL file: $WAL_FILE"

# Create archive directory
mkdir -p "$WAL_ARCHIVE_DIR"

# Copy WAL file to archive
cp "$WAL_PATH" "$WAL_ARCHIVE_DIR/$WAL_FILE"

# Compress
gzip "$WAL_ARCHIVE_DIR/$WAL_FILE"

# Upload to cloud
aws s3 cp "$WAL_ARCHIVE_DIR/${WAL_FILE}.gz" \
  "$CLOUD_BACKUP_DIR/${WAL_FILE}.gz" \
  --endpoint-url "$R2_ENDPOINT_URL"

# Verify upload
if [ $? -eq 0 ]; then
  echo "WAL file archived successfully: $WAL_FILE"
else
  echo "ERROR: Failed to archive WAL file: $WAL_FILE"
  exit 1
fi

# Clean up old WAL files (keep 7 days)
find "$WAL_ARCHIVE_DIR" -name "*.gz" -mtime +7 -delete
```

### Database Backup Verification

```bash
#!/bin/bash
# verify-db-backup.sh - Verify database backup integrity

set -e

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: ./verify-db-backup.sh <backup_file>"
  exit 1
fi

echo "=== Verifying Database Backup ==="
echo "File: $BACKUP_FILE"

# 1. Check file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: Backup file not found!"
  exit 1
fi

# 2. Verify file integrity (if compressed)
if [[ "$BACKUP_FILE" == *.gz ]]; then
  echo "Verifying gzip integrity..."
  if ! gzip -t "$BACKUP_FILE"; then
    echo "ERROR: Backup file is corrupted!"
    exit 1
  fi
  echo "  ✓ File integrity OK"
fi

# 3. Verify checksum
CHECKSUM_FILE="${BACKUP_FILE}.sha256"
if [ -f "$CHECKSUM_FILE" ]; then
  echo "Verifying checksum..."
  if sha256sum -c "$CHECKSUM_FILE"; then
    echo "  ✓ Checksum verified"
  else
    echo "ERROR: Checksum verification failed!"
    exit 1
  fi
fi

# 4. Check file size
SIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE")
MIN_SIZE=1048576  # 1MB minimum
if [ "$SIZE" -lt "$MIN_SIZE" ]; then
  echo "WARNING: Backup file is suspiciously small ($(numfmt --to=iec-i --suffix=B $SIZE))"
fi

# 5. Test restore to temporary database
echo "Testing restore to temporary database..."
TEST_DB="southville_test_restore_$$"

# Create test database
createdb -h "$DB_HOST" -U "$DB_USER" "$TEST_DB"

# Restore backup
if [[ "$BACKUP_FILE" == *.gz ]]; then
  gunzip -c "$BACKUP_FILE" | psql -h "$DB_HOST" -U "$DB_USER" -d "$TEST_DB" > /dev/null 2>&1
else
  psql -h "$DB_HOST" -U "$DB_USER" -d "$TEST_DB" -f "$BACKUP_FILE" > /dev/null 2>&1
fi

# Verify restore
TABLES=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$TEST_DB" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';")
echo "  ✓ Restore successful ($TABLES tables restored)"

# Clean up test database
dropdb -h "$DB_HOST" -U "$DB_USER" "$TEST_DB"

echo "=== Backup Verification Complete ==="
echo "Backup file is valid and restorable"
```

### Selective Table Backup

```bash
#!/bin/bash
# backup-specific-tables.sh - Backup specific critical tables

set -e

BACKUP_DIR="/backups/selective"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Critical tables to backup
TABLES=(
  "users"
  "students"
  "teachers"
  "grades"
  "assignments"
  "submissions"
  "attendance"
)

echo "=== Selective Table Backup Started ==="

mkdir -p "$BACKUP_DIR"

for TABLE in "${TABLES[@]}"; do
  echo "Backing up table: $TABLE"

  BACKUP_FILE="$BACKUP_DIR/${TABLE}_${TIMESTAMP}.sql.gz"

  pg_dump \
    -h "$DB_HOST" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --table="$TABLE" \
    --format=plain \
    --no-owner \
    --no-acl \
    | gzip > "$BACKUP_FILE"

  echo "  ✓ $TABLE backed up ($(du -h "$BACKUP_FILE" | cut -f1))"
done

echo "=== Selective Table Backup Complete ==="
```

## File Storage Backups

### Cloudflare R2 Backup Strategy

```typescript
// File storage backup service
import { S3Client, ListObjectsV2Command, CopyObjectCommand } from '@aws-sdk/client-s3';

export class FileStorageBackupService {
  private r2Client: S3Client;

  constructor() {
    this.r2Client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT_URL,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });
  }

  async backupBucket(sourceBucket: string, backupBucket: string) {
    console.log(`Backing up ${sourceBucket} to ${backupBucket}...`);

    let continuationToken: string | undefined;
    let totalFiles = 0;
    let totalSize = 0;

    do {
      // List objects in source bucket
      const listCommand = new ListObjectsV2Command({
        Bucket: sourceBucket,
        ContinuationToken: continuationToken,
        MaxKeys: 1000,
      });

      const listResponse = await this.r2Client.send(listCommand);

      if (!listResponse.Contents) break;

      // Copy each object to backup bucket
      for (const object of listResponse.Contents) {
        if (!object.Key) continue;

        try {
          const copyCommand = new CopyObjectCommand({
            Bucket: backupBucket,
            CopySource: `${sourceBucket}/${object.Key}`,
            Key: object.Key,
            MetadataDirective: 'COPY',
          });

          await this.r2Client.send(copyCommand);

          totalFiles++;
          totalSize += object.Size || 0;

          if (totalFiles % 100 === 0) {
            console.log(`  Progress: ${totalFiles} files (${this.formatBytes(totalSize)})`);
          }
        } catch (error) {
          console.error(`Failed to copy ${object.Key}:`, error);
        }
      }

      continuationToken = listResponse.NextContinuationToken;
    } while (continuationToken);

    console.log(`Backup complete: ${totalFiles} files (${this.formatBytes(totalSize)})`);

    return {
      totalFiles,
      totalSize,
      timestamp: new Date().toISOString(),
    };
  }

  async createSnapshot(sourceBucket: string) {
    const timestamp = Date.now();
    const snapshotBucket = `${sourceBucket}-snapshot-${timestamp}`;

    console.log(`Creating snapshot: ${snapshotBucket}`);

    await this.backupBucket(sourceBucket, snapshotBucket);

    console.log(`Snapshot created: ${snapshotBucket}`);

    return {
      snapshotBucket,
      timestamp: new Date(timestamp).toISOString(),
    };
  }

  async verifyBackup(sourceBucket: string, backupBucket: string) {
    console.log('Verifying backup...');

    const sourceObjects = await this.listAllObjects(sourceBucket);
    const backupObjects = await this.listAllObjects(backupBucket);

    const sourceKeys = new Set(sourceObjects.map(o => o.Key));
    const backupKeys = new Set(backupObjects.map(o => o.Key));

    const missing = [...sourceKeys].filter(key => !backupKeys.has(key));
    const extra = [...backupKeys].filter(key => !sourceKeys.has(key));

    if (missing.length > 0) {
      console.warn(`Missing ${missing.length} files in backup`);
      console.warn('Sample missing files:', missing.slice(0, 10));
    }

    if (extra.length > 0) {
      console.warn(`Extra ${extra.length} files in backup`);
    }

    const verified = missing.length === 0;
    console.log(`Verification ${verified ? 'passed' : 'failed'}`);

    return {
      verified,
      sourceCount: sourceObjects.length,
      backupCount: backupObjects.length,
      missing: missing.length,
      extra: extra.length,
    };
  }

  private async listAllObjects(bucket: string) {
    const objects: any[] = [];
    let continuationToken: string | undefined;

    do {
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
        MaxKeys: 1000,
      });

      const response = await this.r2Client.send(command);

      if (response.Contents) {
        objects.push(...response.Contents);
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return objects;
  }

  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}
```

### File Backup Automation

```bash
#!/bin/bash
# backup-files.sh - Backup file storage

set -e

BACKUP_BUCKET="southville-backups-files"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "=== File Storage Backup Started: $(date) ==="

# Backup each storage bucket
BUCKETS=(
  "southville-uploads"
  "southville-avatars"
  "southville-documents"
  "southville-assignments"
)

for BUCKET in "${BUCKETS[@]}"; do
  echo "Backing up bucket: $BUCKET"

  # Sync to backup bucket with timestamp prefix
  aws s3 sync \
    "s3://$BUCKET" \
    "s3://$BACKUP_BUCKET/$BUCKET/$TIMESTAMP" \
    --endpoint-url "$R2_ENDPOINT_URL" \
    --no-progress

  echo "  ✓ $BUCKET backed up"
done

# Create backup manifest
cat > /tmp/backup_manifest_${TIMESTAMP}.json <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "buckets": $(printf '%s\n' "${BUCKETS[@]}" | jq -R . | jq -s .),
  "backup_location": "$BACKUP_BUCKET",
  "type": "file_storage",
  "status": "completed"
}
EOF

# Upload manifest
aws s3 cp /tmp/backup_manifest_${TIMESTAMP}.json \
  "s3://$BACKUP_BUCKET/manifests/backup_${TIMESTAMP}.json" \
  --endpoint-url "$R2_ENDPOINT_URL"

echo "=== File Storage Backup Complete: $(date) ==="
```

## Configuration Backups

### Environment Variables Backup

```bash
#!/bin/bash
# backup-config.sh - Backup configuration files

set -e

BACKUP_DIR="/backups/config"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_SUBDIR="$BACKUP_DIR/$TIMESTAMP"

echo "=== Configuration Backup Started ==="

mkdir -p "$BACKUP_SUBDIR"

# 1. Backup environment files (encrypted)
echo "Backing up environment files..."
ENV_FILES=(
  "backend-nestjs/.env.production"
  "frontend-nextjs/.env.production"
  "chat-service/.env.production"
  "docker-compose.prod.yml"
  ".env"
)

for FILE in "${ENV_FILES[@]}"; do
  if [ -f "$FILE" ]; then
    # Encrypt before backup
    openssl enc -aes-256-cbc -salt \
      -in "$FILE" \
      -out "$BACKUP_SUBDIR/$(basename $FILE).enc" \
      -pass pass:"$ENCRYPTION_PASSWORD"
    echo "  ✓ Backed up: $FILE"
  fi
done

# 2. Backup Nginx configuration
echo "Backing up Nginx configuration..."
if [ -d "/etc/nginx" ]; then
  tar -czf "$BACKUP_SUBDIR/nginx_config.tar.gz" -C /etc nginx/
  echo "  ✓ Nginx config backed up"
fi

# 3. Backup SSL certificates
echo "Backing up SSL certificates..."
if [ -d "/etc/letsencrypt" ]; then
  tar -czf "$BACKUP_SUBDIR/ssl_certs.tar.gz" -C /etc letsencrypt/
  echo "  ✓ SSL certificates backed up"
fi

# 4. Backup monitoring configuration
echo "Backing up monitoring configuration..."
MONITORING_CONFIGS=(
  "prometheus/prometheus.yml"
  "grafana/provisioning"
  "alertmanager/alertmanager.yml"
)

for CONFIG in "${MONITORING_CONFIGS[@]}"; do
  if [ -e "$CONFIG" ]; then
    cp -r "$CONFIG" "$BACKUP_SUBDIR/"
    echo "  ✓ Backed up: $CONFIG"
  fi
done

# 5. Create backup manifest
cat > "$BACKUP_SUBDIR/manifest.json" <<EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "type": "configuration",
  "files": $(find "$BACKUP_SUBDIR" -type f | jq -R . | jq -s .),
  "encrypted": true,
  "status": "completed"
}
EOF

# 6. Create archive
cd "$BACKUP_DIR"
tar -czf "config_backup_${TIMESTAMP}.tar.gz" "$TIMESTAMP"

# 7. Upload to cloud
aws s3 cp "config_backup_${TIMESTAMP}.tar.gz" \
  "s3://southville-backups/config/config_backup_${TIMESTAMP}.tar.gz" \
  --endpoint-url "$R2_ENDPOINT_URL"

# 8. Clean up
rm -rf "$BACKUP_SUBDIR"

# 9. Clean old backups (keep 30 days)
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete

echo "=== Configuration Backup Complete ==="
```

### Restore Configuration

```bash
#!/bin/bash
# restore-config.sh - Restore configuration from backup

set -e

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: ./restore-config.sh <backup_file>"
  exit 1
fi

echo "=== Configuration Restore Started ==="

# 1. Extract backup
TEMP_DIR=$(mktemp -d)
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

# 2. Find config directory
CONFIG_DIR=$(find "$TEMP_DIR" -type d -name "*" -maxdepth 1 | head -1)

# 3. Restore environment files
echo "Restoring environment files..."
for ENC_FILE in "$CONFIG_DIR"/*.env*.enc; do
  if [ -f "$ENC_FILE" ]; then
    ORIGINAL_NAME=$(basename "$ENC_FILE" .enc)
    openssl enc -aes-256-cbc -d \
      -in "$ENC_FILE" \
      -out "/tmp/$ORIGINAL_NAME" \
      -pass pass:"$ENCRYPTION_PASSWORD"
    echo "  ✓ Decrypted: $ORIGINAL_NAME"
  fi
done

# 4. Restore Nginx config
if [ -f "$CONFIG_DIR/nginx_config.tar.gz" ]; then
  echo "Restoring Nginx configuration..."
  sudo tar -xzf "$CONFIG_DIR/nginx_config.tar.gz" -C /etc/
  sudo nginx -t
  echo "  ✓ Nginx config restored"
fi

# 5. Restore SSL certificates
if [ -f "$CONFIG_DIR/ssl_certs.tar.gz" ]; then
  echo "Restoring SSL certificates..."
  sudo tar -xzf "$CONFIG_DIR/ssl_certs.tar.gz" -C /etc/
  echo "  ✓ SSL certificates restored"
fi

# Clean up
rm -rf "$TEMP_DIR"

echo "=== Configuration Restore Complete ==="
echo "IMPORTANT: Review restored files in /tmp before moving to production locations"
```

## Application Code Backups

### Git Repository Backup

```bash
#!/bin/bash
# backup-git-repos.sh - Backup Git repositories

set -e

BACKUP_DIR="/backups/git"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "=== Git Repository Backup Started ==="

mkdir -p "$BACKUP_DIR"

# Repositories to backup
REPOS=(
  "https://github.com/JohnMarkCapones/Southville8B-NHS-Edge.git"
)

for REPO in "${REPOS[@]}"; do
  REPO_NAME=$(basename "$REPO" .git)
  BACKUP_FILE="$BACKUP_DIR/${REPO_NAME}_${TIMESTAMP}.bundle"

  echo "Backing up repository: $REPO_NAME"

  # Clone or update local mirror
  if [ -d "$BACKUP_DIR/$REPO_NAME.git" ]; then
    cd "$BACKUP_DIR/$REPO_NAME.git"
    git fetch --all
  else
    git clone --mirror "$REPO" "$BACKUP_DIR/$REPO_NAME.git"
    cd "$BACKUP_DIR/$REPO_NAME.git"
  fi

  # Create bundle (portable backup)
  git bundle create "$BACKUP_FILE" --all

  # Verify bundle
  git bundle verify "$BACKUP_FILE"

  # Compress
  gzip "$BACKUP_FILE"

  echo "  ✓ $REPO_NAME backed up ($(du -h "${BACKUP_FILE}.gz" | cut -f1))"

  cd -
done

# Upload to cloud
aws s3 sync "$BACKUP_DIR" \
  "s3://southville-backups/git/" \
  --exclude "*.git/*" \
  --endpoint-url "$R2_ENDPOINT_URL"

# Clean old backups (keep 90 days)
find "$BACKUP_DIR" -name "*.bundle.gz" -mtime +90 -delete

echo "=== Git Repository Backup Complete ==="
```

### Restore from Git Bundle

```bash
#!/bin/bash
# restore-from-bundle.sh - Restore repository from bundle

set -e

BUNDLE_FILE=$1
RESTORE_DIR=$2

if [ -z "$BUNDLE_FILE" ] || [ -z "$RESTORE_DIR" ]; then
  echo "Usage: ./restore-from-bundle.sh <bundle_file> <restore_directory>"
  exit 1
fi

echo "=== Restoring Repository from Bundle ==="

# Decompress if needed
if [[ "$BUNDLE_FILE" == *.gz ]]; then
  gunzip -c "$BUNDLE_FILE" > /tmp/repo.bundle
  BUNDLE_FILE=/tmp/repo.bundle
fi

# Verify bundle
echo "Verifying bundle..."
git bundle verify "$BUNDLE_FILE"

# Clone from bundle
echo "Restoring repository..."
git clone "$BUNDLE_FILE" "$RESTORE_DIR"

# Clean up
rm -f /tmp/repo.bundle

echo "=== Repository Restored to: $RESTORE_DIR ==="
```

## Backup Testing

### Automated Backup Testing

```typescript
// Automated backup testing service
export class BackupTestingService {
  async testAllBackups() {
    console.log('Starting backup testing...');

    const results = {
      timestamp: new Date().toISOString(),
      tests: {
        database: await this.testDatabaseBackup(),
        files: await this.testFileBackup(),
        config: await this.testConfigBackup(),
        git: await this.testGitBackup(),
      },
      overall: true,
    };

    // Check overall status
    results.overall = Object.values(results.tests).every(test => test.success);

    // Send report
    await this.sendTestReport(results);

    return results;
  }

  private async testDatabaseBackup() {
    try {
      // Find latest database backup
      const latestBackup = await this.findLatestBackup('database');

      if (!latestBackup) {
        return {
          success: false,
          error: 'No database backup found',
        };
      }

      // Check age
      const age = Date.now() - latestBackup.lastModified.getTime();
      const ageHours = age / (1000 * 60 * 60);

      if (ageHours > 25) {
        return {
          success: false,
          error: `Backup is too old (${ageHours.toFixed(1)} hours)`,
        };
      }

      // Download and verify
      const isValid = await this.verifyDatabaseBackup(latestBackup.key);

      return {
        success: isValid,
        backupAge: `${ageHours.toFixed(1)} hours`,
        backupSize: latestBackup.size,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private async testFileBackup() {
    try {
      const latestBackup = await this.findLatestBackup('files');

      if (!latestBackup) {
        return {
          success: false,
          error: 'No file backup found',
        };
      }

      const age = Date.now() - latestBackup.lastModified.getTime();
      const ageHours = age / (1000 * 60 * 60);

      return {
        success: ageHours < 168, // 7 days
        backupAge: `${ageHours.toFixed(1)} hours`,
        backupSize: latestBackup.size,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private async testConfigBackup() {
    try {
      const latestBackup = await this.findLatestBackup('config');

      if (!latestBackup) {
        return {
          success: false,
          error: 'No config backup found',
        };
      }

      const age = Date.now() - latestBackup.lastModified.getTime();
      const ageHours = age / (1000 * 60 * 60);

      return {
        success: ageHours < 720, // 30 days
        backupAge: `${ageHours.toFixed(1)} hours`,
        backupSize: latestBackup.size,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private async testGitBackup() {
    // Git backups are less critical as code is in GitHub
    return { success: true };
  }

  private async findLatestBackup(type: string) {
    // Implementation would query backup storage
    // and return the latest backup of the specified type
    return null;
  }

  private async verifyDatabaseBackup(key: string): Promise<boolean> {
    // Download backup
    // Verify checksum
    // Test restore to temporary database
    return true;
  }

  private async sendTestReport(results: any) {
    // Send report via email or notification system
    console.log('Backup test report:', results);
  }
}
```

### Monthly Backup Drill

```bash
#!/bin/bash
# backup-drill.sh - Monthly disaster recovery drill

set -e

echo "=== Disaster Recovery Drill Started: $(date) ==="
echo "This drill will test the full restore process"
echo ""

# 1. Find latest backups
echo "1. Locating latest backups..."
LATEST_DB_BACKUP=$(aws s3 ls s3://southville-backups/database/ --endpoint-url "$R2_ENDPOINT_URL" | sort | tail -1 | awk '{print $4}')
echo "  Latest DB backup: $LATEST_DB_BACKUP"

# 2. Create test environment
echo "2. Creating test environment..."
TEST_DB="southville_drill_$(date +%s)"
createdb -h "$DB_HOST" -U "$DB_USER" "$TEST_DB"
echo "  Test database created: $TEST_DB"

# 3. Download backup
echo "3. Downloading backup..."
aws s3 cp "s3://southville-backups/database/$LATEST_DB_BACKUP" \
  "/tmp/$LATEST_DB_BACKUP" \
  --endpoint-url "$R2_ENDPOINT_URL"

# 4. Restore backup
echo "4. Restoring backup..."
START_TIME=$(date +%s)
gunzip -c "/tmp/$LATEST_DB_BACKUP" | psql -h "$DB_HOST" -U "$DB_USER" -d "$TEST_DB" > /dev/null 2>&1
END_TIME=$(date +%s)
RESTORE_TIME=$((END_TIME - START_TIME))
echo "  Restore completed in ${RESTORE_TIME} seconds"

# 5. Verify restore
echo "5. Verifying restore..."
TABLE_COUNT=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$TEST_DB" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';")
USER_COUNT=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$TEST_DB" -t -c "SELECT COUNT(*) FROM users;")
echo "  Tables restored: $TABLE_COUNT"
echo "  Users restored: $USER_COUNT"

# 6. Test critical queries
echo "6. Testing critical queries..."
psql -h "$DB_HOST" -U "$DB_USER" -d "$TEST_DB" -c "SELECT COUNT(*) FROM students;" > /dev/null
psql -h "$DB_HOST" -U "$DB_USER" -d "$TEST_DB" -c "SELECT COUNT(*) FROM assignments;" > /dev/null
psql -h "$DB_HOST" -U "$DB_USER" -d "$TEST_DB" -c "SELECT COUNT(*) FROM submissions;" > /dev/null
echo "  ✓ All queries executed successfully"

# 7. Clean up
echo "7. Cleaning up..."
dropdb -h "$DB_HOST" -U "$DB_USER" "$TEST_DB"
rm "/tmp/$LATEST_DB_BACKUP"

# 8. Generate report
cat > "/tmp/drill_report_$(date +%Y%m%d).txt" <<EOF
Disaster Recovery Drill Report
==============================
Date: $(date)
Duration: ${RESTORE_TIME} seconds
Status: SUCCESS

Backup Details:
- File: $LATEST_DB_BACKUP
- Tables Restored: $TABLE_COUNT
- Users Restored: $USER_COUNT

Conclusion:
The backup is valid and can be restored successfully.
Estimated RTO: ${RESTORE_TIME} seconds for database only.
EOF

echo "=== Disaster Recovery Drill Complete ==="
echo "Report saved to /tmp/drill_report_$(date +%Y%m%d).txt"
```

## Recovery Procedures

### Database Recovery

```bash
#!/bin/bash
# restore-database.sh - Restore database from backup

set -e

BACKUP_FILE=$1
TARGET_DB=$2

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: ./restore-database.sh <backup_file> [target_database]"
  exit 1
fi

TARGET_DB=${TARGET_DB:-$DB_NAME}

echo "=== Database Restore Started ==="
echo "WARNING: This will replace all data in database: $TARGET_DB"
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

# 1. Create backup of current database
echo "1. Creating backup of current database..."
SAFETY_BACKUP="/tmp/pre_restore_backup_$(date +%s).sql.gz"
pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$TARGET_DB" | gzip > "$SAFETY_BACKUP"
echo "  Safety backup created: $SAFETY_BACKUP"

# 2. Terminate active connections
echo "2. Terminating active connections..."
psql -h "$DB_HOST" -U "$DB_USER" -d postgres -c "
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = '$TARGET_DB' AND pid <> pg_backend_pid();
"

# 3. Drop and recreate database
echo "3. Recreating database..."
dropdb -h "$DB_HOST" -U "$DB_USER" "$TARGET_DB" --if-exists
createdb -h "$DB_HOST" -U "$DB_USER" "$TARGET_DB"

# 4. Restore from backup
echo "4. Restoring from backup..."
START_TIME=$(date +%s)

if [[ "$BACKUP_FILE" == *.gz ]]; then
  gunzip -c "$BACKUP_FILE" | psql -h "$DB_HOST" -U "$DB_USER" -d "$TARGET_DB"
else
  psql -h "$DB_HOST" -U "$DB_USER" -d "$TARGET_DB" -f "$BACKUP_FILE"
fi

END_TIME=$(date +%s)
RESTORE_TIME=$((END_TIME - START_TIME))
echo "  Restore completed in ${RESTORE_TIME} seconds"

# 5. Verify restore
echo "5. Verifying restore..."
TABLE_COUNT=$(psql -h "$DB_HOST" -U "$DB_USER" -d "$TARGET_DB" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';")
echo "  Tables restored: $TABLE_COUNT"

# 6. Update statistics
echo "6. Updating database statistics..."
psql -h "$DB_HOST" -U "$DB_USER" -d "$TARGET_DB" -c "ANALYZE VERBOSE;"

# 7. Check database health
echo "7. Checking database health..."
psql -h "$DB_HOST" -U "$DB_USER" -d "$TARGET_DB" -c "SELECT version();"

echo "=== Database Restore Complete ==="
echo "Safety backup: $SAFETY_BACKUP"
echo "Restore time: ${RESTORE_TIME} seconds"
```

### Point-in-Time Recovery

```bash
#!/bin/bash
# point-in-time-recovery.sh - PITR using WAL files

set -e

RECOVERY_TARGET_TIME=$1

if [ -z "$RECOVERY_TARGET_TIME" ]; then
  echo "Usage: ./point-in-time-recovery.sh '2024-01-15 14:30:00'"
  exit 1
fi

echo "=== Point-in-Time Recovery Started ==="
echo "Recovery target time: $RECOVERY_TARGET_TIME"

# 1. Find base backup before target time
echo "1. Finding appropriate base backup..."
# Implementation would find the backup closest to but before target time

# 2. Restore base backup
echo "2. Restoring base backup..."
# Restore procedure

# 3. Set up recovery configuration
echo "3. Configuring recovery..."
cat > /tmp/recovery.conf <<EOF
restore_command = 'aws s3 cp s3://southville-backups/wal/%f /var/lib/postgresql/wal/%f --endpoint-url $R2_ENDPOINT_URL'
recovery_target_time = '$RECOVERY_TARGET_TIME'
recovery_target_action = 'promote'
EOF

# 4. Start recovery
echo "4. Starting recovery process..."
# PostgreSQL will replay WAL files up to the target time

echo "=== Point-in-Time Recovery Complete ==="
```

### File Storage Recovery

```bash
#!/bin/bash
# restore-files.sh - Restore file storage from backup

set -e

BACKUP_TIMESTAMP=$1
BUCKET=$2

if [ -z "$BACKUP_TIMESTAMP" ] || [ -z "$BUCKET" ]; then
  echo "Usage: ./restore-files.sh <backup_timestamp> <bucket_name>"
  exit 1
fi

echo "=== File Storage Restore Started ==="

# 1. Create safety backup
echo "1. Creating safety backup of current files..."
SAFETY_BUCKET="${BUCKET}-restore-backup-$(date +%s)"
aws s3 sync "s3://$BUCKET" "s3://$SAFETY_BUCKET" \
  --endpoint-url "$R2_ENDPOINT_URL"
echo "  Safety backup: $SAFETY_BUCKET"

# 2. Clear current bucket (optional)
echo "2. Clearing current bucket..."
aws s3 rm "s3://$BUCKET" --recursive \
  --endpoint-url "$R2_ENDPOINT_URL"

# 3. Restore from backup
echo "3. Restoring from backup..."
aws s3 sync \
  "s3://southville-backups-files/$BUCKET/$BACKUP_TIMESTAMP" \
  "s3://$BUCKET" \
  --endpoint-url "$R2_ENDPOINT_URL"

# 4. Verify restore
echo "4. Verifying restore..."
FILE_COUNT=$(aws s3 ls "s3://$BUCKET" --recursive --endpoint-url "$R2_ENDPOINT_URL" | wc -l)
echo "  Files restored: $FILE_COUNT"

echo "=== File Storage Restore Complete ==="
echo "Safety backup: $SAFETY_BUCKET"
```

## Disaster Recovery Planning

### Disaster Recovery Runbook

```yaml
Disaster Recovery Runbook:

  Scenario 1: Database Corruption
    Detection:
      - Database errors in logs
      - Failed queries
      - Data inconsistencies

    Response:
      1. Assess scope of corruption
      2. Stop application to prevent further damage
      3. Restore from latest valid backup
      4. Replay WAL files if available (PITR)
      5. Verify data integrity
      6. Resume application

    RTO: 2 hours
    RPO: 15 minutes (with WAL archiving)

  Scenario 2: Complete Server Failure
    Detection:
      - Server unreachable
      - All services down
      - Hardware failure

    Response:
      1. Provision new server
      2. Restore configuration from backup
      3. Restore database from backup
      4. Restore file storage from backup
      5. Update DNS if needed
      6. Test all services
      7. Resume operations

    RTO: 4 hours
    RPO: 1 hour

  Scenario 3: Data Center Outage
    Detection:
      - Entire data center unreachable
      - Multiple service failures

    Response:
      1. Activate disaster recovery site
      2. Update DNS to point to DR site
      3. Restore from offsite backups
      4. Verify all services
      5. Communicate with stakeholders

    RTO: 8 hours
    RPO: 1 hour

  Scenario 4: Ransomware Attack
    Detection:
      - Encrypted files
      - Ransom note
      - Unusual system behavior

    Response:
      1. Isolate affected systems immediately
      2. Do NOT pay ransom
      3. Assess scope of infection
      4. Restore from clean backup (verify backup is clean)
      5. Scan all systems
      6. Review security measures
      7. Report to authorities

    RTO: 12 hours
    RPO: 24 hours (use oldest clean backup)

  Scenario 5: Accidental Data Deletion
    Detection:
      - User report of missing data
      - Unexpected drop in data volume

    Response:
      1. Identify what was deleted and when
      2. Stop further operations on affected tables
      3. Perform point-in-time recovery
      4. Restore only affected data
      5. Verify restoration

    RTO: 1 hour
    RPO: 15 minutes
```

### DR Testing Schedule

```yaml
DR Testing Schedule:

  Monthly Tests:
    - Backup verification (automated)
    - Database restore test (test environment)
    - File restore test (sample files)
    - Configuration restore test

  Quarterly Tests:
    - Full system restore (staging)
    - Failover test
    - Communication plan test
    - Documentation review

  Annual Tests:
    - Full disaster recovery drill
    - Regional failover test
    - Tabletop exercise with all stakeholders
    - Third-party DR audit
```

## RTO and RPO

### Recovery Objectives

```yaml
Recovery Time Objective (RTO):
  Critical Services:
    - Authentication: 30 minutes
    - Core API: 1 hour
    - Database: 2 hours
    - File Storage: 2 hours

  Important Services:
    - Chat Service: 2 hours
    - Email Service: 4 hours
    - Analytics: 8 hours

  Non-Critical Services:
    - Reports: 24 hours
    - Archives: 48 hours

Recovery Point Objective (RPO):
  Critical Data:
    - User accounts: 15 minutes
    - Grades/submissions: 15 minutes
    - Financial records: 15 minutes

  Important Data:
    - Chat messages: 1 hour
    - Activity logs: 1 hour
    - Forum posts: 4 hours

  Standard Data:
    - Analytics: 24 hours
    - System logs: 24 hours
```

### RTO/RPO Monitoring

```typescript
// Monitor and report RTO/RPO compliance
export async function monitorRecoveryObjectives() {
  const checks = {
    databaseBackupAge: await checkBackupAge('database'),
    fileBackupAge: await checkBackupAge('files'),
    walArchiveAge: await checkWALArchiveAge(),
    backupIntegrity: await checkBackupIntegrity(),
  };

  const compliance = {
    rpoCompliant: checks.databaseBackupAge <= 15 * 60 * 1000, // 15 minutes
    backupHealthy: checks.backupIntegrity.allValid,
    walArchiving: checks.walArchiveAge <= 5 * 60 * 1000, // 5 minutes
  };

  if (!compliance.rpoCompliant) {
    await sendAlert({
      severity: 'critical',
      title: 'RPO Compliance Violation',
      message: `Database backup is ${Math.round(checks.databaseBackupAge / 60000)} minutes old`,
    });
  }

  return {
    timestamp: new Date().toISOString(),
    checks,
    compliance,
  };
}
```

## Backup Automation

### Automated Backup Schedule

```yaml
# Cron schedule for automated backups

# Database backups
0 2 * * * /scripts/db-backup.sh >> /var/log/backups/db-backup.log 2>&1
0 */6 * * * /scripts/wal-archive-check.sh >> /var/log/backups/wal-check.log 2>&1

# File storage backups
0 3 * * 0 /scripts/backup-files.sh >> /var/log/backups/files-backup.log 2>&1

# Configuration backups
0 4 1 * * /scripts/backup-config.sh >> /var/log/backups/config-backup.log 2>&1

# Git repository backups
0 5 * * 0 /scripts/backup-git-repos.sh >> /var/log/backups/git-backup.log 2>&1

# Backup verification
0 6 * * * /scripts/verify-backups.sh >> /var/log/backups/verification.log 2>&1

# Cleanup old backups
0 7 * * 0 /scripts/cleanup-old-backups.sh >> /var/log/backups/cleanup.log 2>&1
```

### Backup Orchestration Service

```typescript
// Comprehensive backup orchestration
export class BackupOrchestrationService {
  async performFullBackup() {
    console.log('Starting full backup orchestration...');

    const results = {
      timestamp: new Date().toISOString(),
      backups: {},
      errors: [],
    };

    try {
      // 1. Database backup
      console.log('1. Backing up database...');
      results.backups.database = await this.backupDatabase();

      // 2. File storage backup
      console.log('2. Backing up file storage...');
      results.backups.files = await this.backupFiles();

      // 3. Configuration backup
      console.log('3. Backing up configuration...');
      results.backups.config = await this.backupConfiguration();

      // 4. Git repositories backup
      console.log('4. Backing up Git repositories...');
      results.backups.git = await this.backupGitRepos();

      // 5. Verify all backups
      console.log('5. Verifying backups...');
      const verification = await this.verifyAllBackups();
      results.verification = verification;

      // 6. Generate report
      await this.generateBackupReport(results);

      // 7. Send notification
      await this.notifyBackupComplete(results);

    } catch (error) {
      results.errors.push({
        stage: 'orchestration',
        error: error.message,
      });

      await this.notifyBackupFailure(results);
    }

    return results;
  }

  private async backupDatabase() {
    // Execute database backup script
    return { success: true, size: '2.5GB', duration: '15m' };
  }

  private async backupFiles() {
    // Execute file backup script
    return { success: true, size: '50GB', duration: '45m' };
  }

  private async backupConfiguration() {
    // Execute config backup script
    return { success: true, size: '5MB', duration: '2m' };
  }

  private async backupGitRepos() {
    // Execute git backup script
    return { success: true, size: '500MB', duration: '10m' };
  }

  private async verifyAllBackups() {
    // Verify integrity of all backups
    return {
      database: true,
      files: true,
      config: true,
      git: true,
    };
  }

  private async generateBackupReport(results: any) {
    // Generate detailed backup report
  }

  private async notifyBackupComplete(results: any) {
    // Send success notification
  }

  private async notifyBackupFailure(results: any) {
    // Send failure alert
  }
}
```

---

**Navigation**:
- [← Previous Chapter: Maintenance Procedures](./34-maintenance-procedures.md)
- [Next Chapter: Troubleshooting Guide →](./36-troubleshooting-guide.md)
