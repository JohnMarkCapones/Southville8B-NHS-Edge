# Cloudflare R2 Object Storage Configuration

# =============================================

# Required R2 Configuration

R2_ACCOUNT_ID=your_32_character_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your-bucket-name

# Optional R2 Configuration

R2_REGION=auto
R2_PUBLIC_URL=https://your-custom-domain.com
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com

# File Upload Configuration

R2_MAX_FILE_SIZE=10485760 # 10MB in bytes
R2_ALLOWED_MIME_TYPES=image/jpeg,image/jpg,image/png,image/webp,image/gif,application/pdf,text/csv

# Security Configuration

R2_ENABLE_VIRUS_SCANNING=false
R2_ENABLE_CONTENT_VALIDATION=true

# Performance Configuration

R2_MULTIPART_THRESHOLD=10485760 # 10MB - files larger than this will use multipart upload
R2_MULTIPART_CHUNKSIZE=5242880 # 5MB - chunk size for multipart uploads
R2_MAX_CONCURRENCY=3 # Maximum concurrent uploads

# Cache Configuration

R2_CACHE_CONTROL=public, max-age=31536000 # 1 year cache
R2_ENABLE_CDN=true

# Presigned URL Configuration

R2_PRESIGNED_URL_EXPIRATION=3600 # 1 hour in seconds

# Connection Configuration

R2_CONNECTION_TIMEOUT=30000 # 30 seconds
R2_REQUEST_TIMEOUT=60000 # 60 seconds
R2_MAX_RETRIES=3

# Logging Configuration

R2_ENABLE_REQUEST_LOGGING=false
R2_LOG_LEVEL=info

# Storage Provider Selection

STORAGE_PROVIDER=r2 # Options: 'r2' or 'supabase'
