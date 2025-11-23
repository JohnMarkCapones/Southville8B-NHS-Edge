# Backend Core API Layer - Deployment Plan

## 📋 Table of Contents

1. [Overview](#overview)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Environment Configuration](#environment-configuration)
4. [Build Process](#build-process)
5. [Deployment Options](#deployment-options)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Rollback Procedures](#rollback-procedures)
9. [Troubleshooting](#troubleshooting)

---

## Overview

**Application**: Southville NHS School Portal API Layer  
**Framework**: NestJS 11 with Fastify adapter  
**Runtime**: Node.js 18+  
**Default Port**: 3004  
**Database**: Supabase PostgreSQL  
**Storage**: Cloudflare R2 + Cloudflare Images  
**Documentation**: Swagger/OpenAPI at `/api/docs`

---

## Pre-Deployment Checklist

### ✅ Code Quality
- [ ] All tests pass (`npm run test`)
- [ ] Linting passes (`npm run lint`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] Security check passes (`npm run security-check`)
- [ ] Code review completed
- [ ] All migrations tested in staging

### ✅ Environment Setup
- [ ] Supabase project configured and accessible
- [ ] Cloudflare R2 bucket created and configured
- [ ] Cloudflare Images account set up
- [ ] All environment variables documented
- [ ] Production credentials secured (not in code)

### ✅ Database
- [ ] All database migrations applied
- [ ] Row-Level Security (RLS) policies configured
- [ ] Database backups configured
- [ ] Connection pooling tested

### ✅ Security
- [ ] CORS origins configured for production
- [ ] API rate limiting configured
- [ ] Helmet security headers verified
- [ ] JWT token validation tested
- [ ] Service role keys secured

### ✅ Performance
- [ ] Compression enabled (gzip, deflate, brotli)
- [ ] File upload limits configured (50MB)
- [ ] Connection timeouts set appropriately
- [ ] Caching strategy implemented

---

## Environment Configuration

### Required Environment Variables

Create a `.env` file in the `core-api-layer/southville-nhs-school-portal-api-layer/` directory with the following variables:

#### Core Application
```env
# Application
NODE_ENV=production
PORT=3004

# CORS (Update with your production frontend URL)
CORS_ORIGIN=https://yourdomain.com
```

#### Supabase Configuration
```env
# Supabase - Required
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_JWT_SECRET=your-jwt-secret-here
```

#### Cloudflare R2 Storage
```env
# Cloudflare R2 - Required
R2_ACCOUNT_ID=your-r2-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=your-bucket-name
R2_REGION=auto
R2_PUBLIC_URL=https://your-bucket-domain.com

# Optional R2 Settings
R2_MAX_FILE_SIZE=52428800  # 50MB
R2_PRESIGNED_URL_EXPIRATION=3600  # 1 hour
R2_CONNECTION_TIMEOUT=30000
R2_REQUEST_TIMEOUT=60000
R2_MAX_RETRIES=3
```

#### Cloudflare Images
```env
# Cloudflare Images - Required
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_IMAGES_API_TOKEN=your-images-api-token
CLOUDFLARE_ACCOUNT_HASH=your-account-hash

# Optional Cloudflare Images Settings
ENABLE_CLOUDFLARE_IMAGES=true
CLOUDFLARE_IMAGES_MAX_FILE_SIZE=10485760  # 10MB
CLOUDFLARE_IMAGES_TIMEOUT=30000
```

### Getting Credentials

#### Supabase
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`
5. Go to **Settings** → **Auth** → **JWT Settings** for `SUPABASE_JWT_SECRET`

#### Cloudflare R2
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **R2** → **Manage R2 API Tokens**
3. Create API token with **Object Read & Write** permissions
4. Copy:
   - **Account ID** → `R2_ACCOUNT_ID`
   - **Access Key ID** → `R2_ACCESS_KEY_ID`
   - **Secret Access Key** → `R2_SECRET_ACCESS_KEY`
5. Create a bucket and note the name → `R2_BUCKET_NAME`
6. Set up custom domain (optional) → `R2_PUBLIC_URL`

#### Cloudflare Images
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Images** → **Get Started**
3. Create API token with Images permissions
4. Copy:
   - **Account ID** → `CLOUDFLARE_ACCOUNT_ID`
   - **API Token** → `CLOUDFLARE_IMAGES_API_TOKEN`
   - **Account Hash** → `CLOUDFLARE_ACCOUNT_HASH`

---

## Build Process

### Local Build (Testing)

```bash
# Navigate to the API directory
cd Southville8B-NHS-Edge/core-api-layer/southville-nhs-school-portal-api-layer

# Install dependencies
npm ci  # Use ci for production-like install

# Run tests
npm run test
npm run test:e2e

# Build the application
npm run build

# Test production build locally
npm run start:prod
```

### Production Build

The build process compiles TypeScript to JavaScript in the `dist/` directory:

```bash
npm run build
```

**Output**: `dist/main.js` (entry point)

**Build Artifacts**:
- `dist/` - Compiled JavaScript files
- `node_modules/` - Production dependencies only
- `.env` - Environment variables (DO NOT commit)

---

## Deployment Options

### Option 1: Docker Deployment (Recommended)

#### Create Dockerfile

Create `Dockerfile` in `core-api-layer/southville-nhs-school-portal-api-layer/`:

```dockerfile
# Multi-stage build for optimized image size
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Change ownership
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose port
EXPOSE 3004

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3004/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/main"]
```

#### Create .dockerignore

```
node_modules
dist
.env
.env.*
*.log
.git
.gitignore
README.md
*.md
test
coverage
.vscode
.idea
```

#### Build and Run Docker Image

```bash
# Build image
docker build -t southville-api:latest .

# Run container
docker run -d \
  --name southville-api \
  -p 3004:3004 \
  --env-file .env \
  --restart unless-stopped \
  southville-api:latest

# View logs
docker logs -f southville-api
```

#### Docker Compose (Optional)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  api:
    build: .
    container_name: southville-api
    ports:
      - "3004:3004"
    env_file:
      - .env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3004/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

Run with:
```bash
docker-compose up -d
```

---

### Option 2: Cloud Platform Deployment

#### Railway

1. **Connect Repository**
   - Go to [Railway](https://railway.app)
   - Create new project
   - Connect GitHub repository
   - Select `core-api-layer/southville-nhs-school-portal-api-layer` directory

2. **Configure Build**
   - Root Directory: `core-api-layer/southville-nhs-school-portal-api-layer`
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm run start:prod`
   - Port: `3004`

3. **Set Environment Variables**
   - Add all required environment variables in Railway dashboard
   - Use Railway's secrets management

4. **Deploy**
   - Railway auto-deploys on git push
   - Monitor deployment logs

#### Render

1. **Create Web Service**
   - Go to [Render](https://render.com)
   - Create new Web Service
   - Connect repository

2. **Configure Service**
   - Name: `southville-api`
   - Environment: `Node`
   - Build Command: `npm ci && npm run build`
   - Start Command: `npm run start:prod`
   - Port: `3004`

3. **Environment Variables**
   - Add all required variables in Environment tab

4. **Deploy**
   - Render auto-deploys on push to main branch

#### Vercel (Serverless)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Create vercel.json**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "dist/main.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "dist/main.js"
       }
     ],
     "env": {
       "NODE_ENV": "production"
     }
   }
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

**Note**: Vercel is serverless and may have limitations with long-running connections. Consider Railway or Render for better compatibility.

#### AWS (EC2 / ECS / Elastic Beanstalk)

**EC2 Deployment**:
1. Launch EC2 instance (Ubuntu 22.04 LTS)
2. Install Node.js 18+
3. Clone repository
4. Set up PM2 or systemd service
5. Configure Nginx reverse proxy
6. Set up SSL with Let's Encrypt

**ECS Deployment**:
1. Build Docker image
2. Push to ECR
3. Create ECS task definition
4. Create ECS service
5. Configure load balancer

**Elastic Beanstalk**:
1. Install EB CLI
2. Initialize: `eb init`
3. Create environment: `eb create`
4. Deploy: `eb deploy`

#### Google Cloud Platform (Cloud Run)

1. **Build and Push Container**
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT_ID/southville-api
   ```

2. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy southville-api \
     --image gcr.io/PROJECT_ID/southville-api \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --port 3004 \
     --set-env-vars="NODE_ENV=production"
   ```

---

### Option 3: VPS Deployment (DigitalOcean, Linode, etc.)

#### Server Setup

1. **Initial Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs

   # Install PM2 (Process Manager)
   sudo npm install -g pm2

   # Install Nginx
   sudo apt install -y nginx
   ```

2. **Clone and Build**
   ```bash
   # Clone repository
   git clone <your-repo-url>
   cd Southville8B-NHS-Edge/core-api-layer/southville-nhs-school-portal-api-layer

   # Install dependencies
   npm ci

   # Build application
   npm run build

   # Create .env file
   nano .env  # Add all environment variables
   ```

3. **PM2 Setup**
   ```bash
   # Start application with PM2
   pm2 start dist/main.js --name southville-api

   # Save PM2 configuration
   pm2 save

   # Setup PM2 to start on boot
   pm2 startup
   ```

4. **Nginx Reverse Proxy**

   Create `/etc/nginx/sites-available/southville-api`:
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://localhost:3004;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable site:
   ```bash
   sudo ln -s /etc/nginx/sites-available/southville-api /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

5. **SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d api.yourdomain.com
   ```

---

## Post-Deployment Verification

### Health Check

```bash
# Check if API is running
curl http://localhost:3004/health

# Expected response:
# {
#   "status": "ok",
#   "supabase": "connected",
#   "timestamp": "2024-01-01T00:00:00.000Z"
# }
```

### API Documentation

Visit: `https://api.yourdomain.com/api/docs`

### Test Endpoints

```bash
# Test root endpoint
curl https://api.yourdomain.com/

# Test health endpoint
curl https://api.yourdomain.com/health

# Test with authentication
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     https://api.yourdomain.com/api/v1/users
```

### Verify Services

1. **Supabase Connection**
   - Check logs for Supabase connection success
   - Test database queries

2. **Cloudflare R2**
   - Test file upload endpoint
   - Verify presigned URLs work

3. **Cloudflare Images**
   - Test image upload
   - Verify image delivery URLs

---

## Monitoring & Maintenance

### Logging

**Application Logs**:
- Console logs (stdout/stderr)
- Use PM2 logs: `pm2 logs southville-api`
- Use Docker logs: `docker logs -f southville-api`

**Recommended Logging Service**:
- **Papertrail** (free tier available)
- **Logtail** (free tier available)
- **Datadog** (paid)
- **New Relic** (paid)

### Monitoring

**Application Monitoring**:
- **Uptime Robot** (free) - HTTP monitoring
- **Pingdom** (paid) - Uptime monitoring
- **New Relic** (paid) - APM
- **Datadog** (paid) - Full observability

**Health Check Endpoint**:
- Set up monitoring to hit `/health` every 1-5 minutes
- Alert on non-200 responses

### Performance Monitoring

```bash
# PM2 Monitoring
pm2 monit

# Check process status
pm2 status

# View detailed info
pm2 show southville-api
```

### Database Monitoring

- Monitor Supabase dashboard for:
  - Connection pool usage
  - Query performance
  - Database size
  - RLS policy effectiveness

### Storage Monitoring

- Monitor Cloudflare R2:
  - Storage usage
  - Bandwidth usage
  - Request counts

### Backup Strategy

1. **Database Backups**
   - Supabase automatic backups (check your plan)
   - Manual backups via Supabase dashboard
   - Export SQL dumps regularly

2. **Application Backups**
   - Version control (Git)
   - Environment variable backups (secure storage)
   - Configuration backups

---

## Rollback Procedures

### Quick Rollback (Git)

```bash
# On server
cd /path/to/application
git checkout <previous-commit-hash>
npm ci
npm run build
pm2 restart southville-api  # or docker-compose restart
```

### Docker Rollback

```bash
# Tag previous working image
docker tag southville-api:previous southville-api:latest

# Restart container
docker restart southville-api
```

### PM2 Rollback

```bash
# PM2 keeps previous version in memory
pm2 restart southville-api

# Or rollback to specific version
git checkout <commit>
npm run build
pm2 restart southville-api
```

### Database Rollback

1. Identify migration to rollback
2. Create reverse migration SQL
3. Apply reverse migration
4. Test application

---

## Troubleshooting

### Common Issues

#### Application Won't Start

**Check**:
```bash
# Check logs
pm2 logs southville-api --lines 100
# or
docker logs southville-api

# Check environment variables
pm2 env southville-api
# or
docker exec southville-api env
```

**Common Causes**:
- Missing environment variables
- Database connection failure
- Port already in use
- Invalid configuration

#### Database Connection Errors

**Check**:
- Supabase URL is correct
- Service role key is valid
- Network connectivity
- Supabase project is active

**Fix**:
```bash
# Test Supabase connection
curl https://your-project.supabase.co/rest/v1/ \
  -H "apikey: YOUR_ANON_KEY"
```

#### R2 Storage Errors

**Check**:
- R2 credentials are correct
- Bucket exists and is accessible
- Network connectivity to R2
- IAM permissions

**Fix**:
```bash
# Test R2 connection (if script exists)
npm run test:r2-connection
```

#### High Memory Usage

**Check**:
```bash
# PM2
pm2 monit

# Docker
docker stats southville-api
```

**Fix**:
- Increase server memory
- Optimize application code
- Enable Node.js memory limits: `NODE_OPTIONS="--max-old-space-size=2048"`

#### Slow Response Times

**Check**:
- Database query performance
- Network latency
- File upload/download speeds
- External API response times

**Fix**:
- Add database indexes
- Enable caching
- Optimize queries
- Use CDN for static assets

### Debug Mode

Enable debug logging:
```bash
# Set environment variable
DEBUG=* pm2 restart southville-api

# Or in Docker
docker run -e DEBUG=* ...
```

### Performance Testing

```bash
# Run performance tests
npm run test:performance

# Benchmark
npm run benchmark
```

---

## Security Checklist

- [ ] Environment variables secured (not in code)
- [ ] CORS configured for production domain only
- [ ] Rate limiting enabled
- [ ] Helmet security headers active
- [ ] SSL/TLS enabled (HTTPS)
- [ ] JWT tokens validated on all protected routes
- [ ] Service role key never exposed to frontend
- [ ] File upload size limits enforced
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (using Supabase client)
- [ ] Regular security updates (`npm audit`)
- [ ] Firewall configured (only necessary ports open)
- [ ] Regular backups configured
- [ ] Monitoring and alerting set up

---

## Cost Estimation

### Free Tier Options
- **Supabase**: Free tier (500MB database, 2GB bandwidth)
- **Cloudflare R2**: Free tier (10GB storage, 1M requests/month)
- **Cloudflare Images**: Free tier (100,000 images/month)
- **Railway**: $5/month (after free trial)
- **Render**: Free tier available (with limitations)

### Recommended Production Setup
- **VPS (DigitalOcean/Linode)**: $12-24/month
- **Supabase Pro**: $25/month
- **Cloudflare R2**: Pay-as-you-go (very cheap)
- **Domain**: $10-15/year
- **SSL**: Free (Let's Encrypt)

**Total**: ~$40-50/month for small to medium traffic

---

## Next Steps After Deployment

1. ✅ Set up monitoring and alerts
2. ✅ Configure automated backups
3. ✅ Set up CI/CD pipeline
4. ✅ Document API endpoints for frontend team
5. ✅ Set up staging environment
6. ✅ Configure log aggregation
7. ✅ Set up error tracking (Sentry, etc.)
8. ✅ Performance testing under load
9. ✅ Security audit
10. ✅ Documentation updates

---

## Support & Resources

- **NestJS Documentation**: https://docs.nestjs.com
- **Supabase Documentation**: https://supabase.com/docs
- **Cloudflare R2 Documentation**: https://developers.cloudflare.com/r2
- **Fastify Documentation**: https://www.fastify.io

---

**Last Updated**: 2024-01-01  
**Maintained By**: Development Team





