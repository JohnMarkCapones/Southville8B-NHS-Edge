# 7. Database & Services Configuration

**Last Updated:** January 10, 2026
**Status:** ✅ Complete

---

## Table of Contents

- [7.1 Supabase Setup & Configuration](#71-supabase-setup--configuration)
- [7.2 Chat Service Configuration](#72-chat-service-configuration)
- [7.3 Cloudflare R2 Storage Setup](#73-cloudflare-r2-storage-setup)
- [7.4 Backup & Recovery Configuration](#74-backup--recovery-configuration)

---

## 7.1 Supabase Setup & Configuration

Supabase provides the database (PostgreSQL), authentication, and real-time functionality for the application.

### 7.1.1 Project Creation

#### Step 1: Create Supabase Account

1. **Visit** [supabase.com](https://supabase.com/)
2. **Sign up** with GitHub, GitLab, or email
3. **Verify** your email address

#### Step 2: Create New Project

1. **Click** "New Project"
2. **Fill in project details:**
   - **Name:** Southville 8B NHS Edge
   - **Database Password:** Strong password (save this securely!)
   - **Region:** Choose closest to your users (e.g., Southeast Asia)
   - **Pricing Plan:** Free tier or Pro ($25/month)

3. **Click** "Create new project"
4. **Wait** 2-3 minutes for project provisioning

#### Step 3: Get API Credentials

1. **Navigate to** Settings → API
2. **Copy the following:**

```bash
# Project URL
URL: https://xxxxxxxxxxxxx.supabase.co

# API Keys
anon (public) key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **Security Warning:** Never expose `service_role` key in frontend code or commit to version control. Use only in backend services.

---

### 7.1.2 Database Schema Setup

#### Import Existing Schema

If you have an existing schema file:

1. **Navigate to** SQL Editor
2. **Click** "New query"
3. **Paste** your schema SQL
4. **Click** "Run"

**Example schema import:**
```sql
-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin', 'superadmin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create students table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  student_number TEXT UNIQUE NOT NULL,
  grade_level INTEGER,
  section_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teachers table
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  employee_number TEXT UNIQUE NOT NULL,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_students_user_id ON public.students(user_id);
CREATE INDEX idx_teachers_user_id ON public.teachers(user_id);
```

#### Table Editor

Alternatively, use the Table Editor UI:

1. **Navigate to** Table Editor
2. **Click** "Create a new table"
3. **Define columns:**
   - Name, Type, Default value
   - Primary key, Foreign keys
   - Nullable, Unique constraints
4. **Save table**

---

### 7.1.3 Row Level Security (RLS)

RLS ensures users can only access data they're authorized to see.

#### Enable RLS

```sql
-- Enable RLS on tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
```

#### Create RLS Policies

**Example: Students can only see their own data**

```sql
-- Policy: Students can select their own record
CREATE POLICY "Students can view own data"
ON public.students
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Teachers can view all students
CREATE POLICY "Teachers can view all students"
ON public.students
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'teacher'
  )
);

-- Policy: Admins can do everything
CREATE POLICY "Admins have full access"
ON public.students
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'superadmin')
  )
);
```

**Common RLS Patterns:**

```sql
-- Current user's data
auth.uid() = user_id

-- Role-based access
EXISTS (
  SELECT 1 FROM users
  WHERE id = auth.uid()
  AND role = 'admin'
)

-- Department-based access
department_id IN (
  SELECT department_id FROM users
  WHERE id = auth.uid()
)
```

#### Test RLS Policies

```sql
-- Test as specific user
SET request.jwt.claims.sub = 'user-uuid-here';

-- Run query
SELECT * FROM students;

-- Should only return authorized data
```

---

### 7.1.4 Authentication Configuration

#### Configure Auth Providers

1. **Navigate to** Authentication → Providers
2. **Enable desired providers:**

**Email/Password (Enabled by default):**
- Email confirmation required
- Password requirements: minimum 6 characters

**OAuth Providers (Optional):**
- Google OAuth
- GitHub OAuth
- Microsoft OAuth

#### Email Templates

1. **Navigate to** Authentication → Email Templates
2. **Customize templates:**
   - Confirm signup
   - Magic link
   - Change email address
   - Reset password

**Example: Custom confirmation email**
```html
<h2>Confirm your signup</h2>
<p>Welcome to Southville 8B NHS Edge!</p>
<p>Click the link below to confirm your email:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
```

#### Auth Settings

1. **Navigate to** Authentication → Settings
2. **Configure:**

```
Site URL: https://portal.southville8b.edu
Redirect URLs:
  - https://portal.southville8b.edu/auth/callback
  - http://localhost:3000/auth/callback

JWT Expiry: 3600 (1 hour)
Refresh Token Rotation: Enabled
```

---

### 7.1.5 Realtime Configuration

Supabase Realtime powers the chat feature via WebSocket.

#### Enable Realtime

1. **Navigate to** Database → Replication
2. **Enable replication** for tables that need realtime:
   - `messages`
   - `notifications`
   - `quiz_sessions` (for live monitoring)

3. **Confirm** schema changes

#### Subscribe to Changes (Frontend)

```typescript
// Example: Subscribe to new messages
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const channel = supabase
  .channel('messages')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages'
    },
    (payload) => {
      console.log('New message:', payload.new)
      // Update UI with new message
    }
  )
  .subscribe()

// Cleanup
return () => {
  supabase.removeChannel(channel)
}
```

#### Realtime Limits

**Free Tier:**
- 200 concurrent connections
- 2GB database size
- 500MB file storage

**Pro Tier ($25/month):**
- Unlimited connections
- 8GB database size
- 100GB file storage

---

### 7.1.6 Database Maintenance

#### Vacuum and Analyze

```sql
-- Regular maintenance (run weekly)
VACUUM ANALYZE;

-- Full vacuum (run monthly, requires downtime)
VACUUM FULL;
```

#### Index Maintenance

```sql
-- Check index usage
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;

-- Remove unused indexes
DROP INDEX IF EXISTS unused_index_name;
```

---

## 7.2 Chat Service Configuration

The chat service provides real-time messaging functionality.

### 7.2.1 Service Installation

#### Clone Chat Service Repository

```bash
# Navigate to project root
cd southville-8b-nhs-edge

# Chat service should be in southville-chat-service/
cd southville-chat-service
```

#### Install Dependencies

```bash
npm install
```

---

### 7.2.2 Environment Setup

#### Create Environment File

```bash
# Create .env file
cp .env.example .env

# Edit .env
nano .env  # or use your preferred editor
```

#### Required Environment Variables

```bash
# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://portal.southville8b.edu

# WebSocket Configuration
WS_HEARTBEAT_INTERVAL=30000
WS_TIMEOUT=60000
```

---

### 7.2.3 WebSocket Configuration

#### Chat Service Architecture

```
Client (Browser)
    │
    ├─► HTTP POST /api/messages/send
    │   └─► Store in Supabase
    │
    └─► WebSocket Connection
        └─► Supabase Realtime
            └─► Broadcast to all connected clients
```

#### Start Chat Service

**Development:**
```bash
npm run start:dev
```

**Production:**
```bash
# Build
npm run build

# Start
npm run start:prod

# Or with PM2
pm2 start npm --name "chat-service" -- run start:prod
pm2 save
```

#### Verify Chat Service

```bash
# Health check
curl http://localhost:3001/health

# Expected response:
# {"status":"ok","timestamp":"2026-01-10T12:00:00.000Z"}
```

---

### 7.2.4 Chat Service API

#### Send Message

```bash
POST /api/messages/send
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "recipientId": "user-uuid",
  "message": "Hello!",
  "type": "text"
}
```

#### Get Conversations

```bash
GET /api/conversations
Authorization: Bearer <jwt-token>

Response:
[
  {
    "id": "conversation-uuid",
    "participants": [...],
    "lastMessage": {...},
    "unreadCount": 3
  }
]
```

---

## 7.3 Cloudflare R2 Storage Setup

Cloudflare R2 provides S3-compatible object storage for files.

### 7.3.1 Bucket Creation

#### Step 1: Create Cloudflare Account

1. **Visit** [cloudflare.com](https://cloudflare.com/)
2. **Sign up** for an account
3. **Verify** email

#### Step 2: Enable R2

1. **Navigate to** R2 → Overview
2. **Click** "Purchase R2"
3. **Accept** terms (free tier: 10GB storage, no egress fees)

#### Step 3: Create Bucket

1. **Click** "Create bucket"
2. **Bucket name:** `southville-8b-files`
3. **Location:** Automatic (or choose specific region)
4. **Click** "Create bucket"

---

### 7.3.2 Access Configuration

#### Create API Token

1. **Navigate to** R2 → Settings → API Tokens
2. **Click** "Create API token"
3. **Permissions:**
   - Object Read & Write
   - Bucket permissions: Specific bucket (`southville-8b-files`)
4. **Copy credentials:**

```bash
Access Key ID: abc123...
Secret Access Key: xyz789...
Account ID: your-account-id
```

---

### 7.3.3 Integration Setup

#### Configure Core API

Navigate to `core-api-layer` directory:

```bash
cd core-api-layer
```

#### Create Environment File

```bash
# .env
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=abc123...
R2_SECRET_ACCESS_KEY=xyz789...
R2_BUCKET_NAME=southville-8b-files
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com

# File upload settings
R2_MAX_FILE_SIZE=10485760  # 10MB in bytes
R2_PRESIGNED_URL_EXPIRATION=3600  # 1 hour
```

#### Test R2 Connection

```bash
npm run test:r2-connection
```

**Expected output:**
```
✓ R2 connection successful
✓ Bucket accessible
✓ Upload test successful
✓ Download test successful
```

---

### 7.3.4 File Upload Configuration

#### Maximum File Sizes

```bash
# In core-api-layer .env
R2_MAX_FILE_SIZE=10485760  # 10MB for most files

# For learning modules (larger files)
MODULES_MAX_FILE_SIZE=52428800  # 50MB
```

#### Allowed File Types

```typescript
// Allowed MIME types
const ALLOWED_TYPES = [
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',

  // Archives
  'application/zip',
  'application/x-rar-compressed',

  // Presentations
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]
```

#### Public Access Configuration

**Option 1: Public bucket (for shared files)**
```bash
# Make bucket public
# Navigate to: R2 → Bucket → Settings → Public access
# Enable: "Allow public access"
```

**Option 2: Presigned URLs (recommended)**
```typescript
// Generate temporary signed URLs
const presignedUrl = await r2Service.generatePresignedUrl(
  fileKey,
  3600 // 1 hour expiration
)
```

---

### 7.3.5 Storage Quotas and Pricing

#### Free Tier

- **Storage:** 10 GB/month
- **Class A Operations:** 1 million/month (writes)
- **Class B Operations:** 10 million/month (reads)
- **Egress:** Free (no bandwidth charges)

#### Paid Plans

- **Storage:** $0.015/GB/month
- **Class A Operations:** $4.50/million
- **Class B Operations:** $0.36/million
- **No egress fees** (major advantage over AWS S3)

---

## 7.4 Backup & Recovery Configuration

### 7.4.1 Automated Backups

#### Supabase Backups

**Pro Plan and above:**
- Daily automatic backups
- 7-day retention (Pro)
- 30-day retention (Team/Enterprise)
- Point-in-time recovery

**Manual Backup:**

```bash
# Using pg_dump (requires database connection string)
pg_dump -h db.xxxxxxxxxxxxx.supabase.co \
  -U postgres \
  -d postgres \
  -F c \
  -f backup_$(date +%Y%m%d).dump

# Restore from backup
pg_restore -h db.xxxxxxxxxxxxx.supabase.co \
  -U postgres \
  -d postgres \
  -c \
  backup_20260110.dump
```

#### R2 Backup Script

```bash
#!/bin/bash
# backup-r2.sh

BUCKET_NAME="southville-8b-files"
BACKUP_DIR="/backups/r2/$(date +%Y%m%d)"

# Create backup directory
mkdir -p $BACKUP_DIR

# Sync R2 bucket to local
rclone sync r2:$BUCKET_NAME $BACKUP_DIR \
  --transfers 8 \
  --checkers 16 \
  --progress

echo "Backup completed: $BACKUP_DIR"
```

---

### 7.4.2 Backup Verification

#### Database Backup Test

```bash
# 1. Create test database
createdb test_restore

# 2. Restore backup to test database
pg_restore -d test_restore backup_20260110.dump

# 3. Verify data
psql test_restore -c "SELECT COUNT(*) FROM users;"

# 4. Drop test database
dropdb test_restore
```

#### R2 Backup Verification

```bash
# Verify file count matches
rclone size r2:southville-8b-files
rclone size /backups/r2/20260110

# Should match
```

---

### 7.4.3 Recovery Procedures

#### Scenario 1: Database Corruption

```bash
# 1. Stop application
pm2 stop southville-portal

# 2. Restore from latest backup
pg_restore -h db.xxxxxxxxxxxxx.supabase.co \
  -U postgres \
  -d postgres \
  --clean \
  backup_latest.dump

# 3. Verify restoration
psql -h db.xxxxxxxxxxxxx.supabase.co \
  -U postgres \
  -c "SELECT COUNT(*) FROM users;"

# 4. Restart application
pm2 start southville-portal
```

#### Scenario 2: Accidental File Deletion

**R2 with versioning (if enabled):**
1. Navigate to R2 → Bucket → Files
2. Click on deleted file
3. Click "Restore" on previous version

**From backup:**
```bash
# Restore specific file from backup
rclone copy /backups/r2/20260110/path/to/file.pdf r2:southville-8b-files/path/to/
```

#### Scenario 3: Complete Service Failure

1. **Provision new infrastructure**
2. **Restore database from backup**
3. **Restore R2 files from backup**
4. **Update DNS to new infrastructure**
5. **Verify all services operational**
6. **Monitor closely for 24-48 hours**

---

### 7.4.4 Disaster Recovery Plan

#### RTO and RPO Targets

| Scenario | RTO (Recovery Time Objective) | RPO (Recovery Point Objective) |
|----------|-------------------------------|-------------------------------|
| **Database Failure** | 2 hours | 1 day (daily backups) |
| **File Storage Failure** | 4 hours | 1 day (daily backups) |
| **Complete Infrastructure Failure** | 24 hours | 1 day |
| **Regional Outage** | 48 hours | 1 day |

#### Recovery Priority

1. **Critical (Restore first):**
   - Database (user accounts, student records)
   - Authentication service
   - Core API

2. **Important (Restore second):**
   - File storage (learning materials, submissions)
   - Chat service
   - Real-time features

3. **Standard (Restore third):**
   - Analytics data
   - Cached data
   - Logs

---

## Configuration Summary

### Quick Setup Checklist

**Supabase:**
- [x] Project created
- [x] API credentials obtained
- [x] Database schema imported
- [x] RLS policies configured
- [x] Authentication providers enabled
- [x] Realtime enabled for required tables

**Chat Service:**
- [x] Dependencies installed
- [x] Environment variables configured
- [x] Service running and health check passing
- [x] WebSocket connections working

**Cloudflare R2:**
- [x] Bucket created
- [x] API tokens generated
- [x] Core API configured
- [x] Connection test successful
- [x] File uploads working

**Backups:**
- [x] Automated backup scripts created
- [x] Backup verification procedures tested
- [x] Recovery procedures documented
- [x] Disaster recovery plan in place

---

## Navigation

- [← Previous: Production Deployment](./06-production-deployment.md)
- [↑ Back to Volume 2 Index](./README.md)
- [↑↑ Back to Manual Index](../README.md)
- [Next Volume: Developer Guide →](../volume-3-developer-guide/)
