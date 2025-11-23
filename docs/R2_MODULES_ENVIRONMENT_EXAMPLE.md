# R2 Modules Configuration

R2_MODULES_MAX_SIZE=52428800 # 50MB
R2_MODULES_ALLOWED_TYPES=application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png
R2_GLOBAL_MODULE_CACHE=86400 # 24 hours for global modules
R2_SECTION_MODULE_CACHE=3600 # 1 hour for section modules
R2_SOFT_DELETE_RETENTION=30 # 30 days retention for deleted files

# Rate Limiting

R2_TEACHER_UPLOAD_LIMIT=10 # 10 uploads per hour per teacher
R2_STUDENT_DOWNLOAD_LIMIT=100 # 100 downloads per hour per student

# Performance Configuration

R2_MAX_CONNECTIONS=50 # Connection pool size
R2_CONNECTION_TIMEOUT=5000 # 5 seconds
R2_KEEP_ALIVE_INTERVAL=30000 # 30 seconds
R2_CDN_ENABLED=true
R2_CDN_DOMAIN=cdn.your-domain.com
R2_ENABLE_COMPRESSION=true

# Caching Configuration

REDIS_URL=redis://localhost:6379 # For caching
MODULE_CACHE_TTL_SECONDS=900 # 15 minutes for metadata cache

# Security Features

R2_ENABLE_ENCRYPTION=true
R2_ENABLE_ACCESS_LOGGING=true
R2_ENABLE_AUDIT_TRAIL=true
