# 6. Production Deployment

**Last Updated:** January 10, 2026
**Status:** ✅ Complete

---

## Table of Contents

- [6.1 Build Process](#61-build-process)
- [6.2 Deployment Strategies](#62-deployment-strategies)
- [6.3 Environment Configuration (Production)](#63-environment-configuration-production)
- [6.4 Post-Deployment Verification](#64-post-deployment-verification)
- [6.5 Rollback Procedures](#65-rollback-procedures)

---

## 6.1 Build Process

### 6.1.1 Production Build Commands

#### Prerequisites Check

Before building, ensure:

```bash
# Navigate to frontend directory
cd frontend-nextjs

# Verify Node.js version
node --version
# Expected: v18.x.x or v20.x.x

# Verify all dependencies are installed
npm list --depth=0
```

#### Create Production Build

```bash
# Run production build
npm run build
```

**Build process steps:**

1. **Type Checking** - TypeScript compilation
2. **Linting** - ESLint validation
3. **Static Analysis** - Next.js optimization
4. **Compilation** - Build all pages and components
5. **Optimization** - Minification and tree-shaking
6. **Output Generation** - Create `.next` directory

**Expected output:**
```
Route (app)                              Size     First Load JS
┌ ○ /                                    5.02 kB        87.2 kB
├ ○ /_not-found                          871 B          82.1 kB
├ ƒ /api/auth/[...nextauth]              0 B                0 B
├ ○ /guess                               142 B          84.3 kB
├ ○ /guess/login                         8.45 kB        92.6 kB
├ ○ /student/dashboard                   15.2 kB        102 kB
├ ○ /teacher/dashboard                   18.5 kB        106 kB
└ ○ /admin/dashboard                     12.8 kB        99.1 kB

○  (Static)  prerendered as static content
●  (SSG)     prerendered as static HTML (uses getStaticProps)
ƒ  (Dynamic) server-rendered on demand
λ  (Server)  server-rendered on demand using streaming

✓ Compiled successfully in 45.3s
```

#### Build Artifacts

The build creates the `.next` directory:

```
.next/
├── cache/                 # Build cache
├── server/                # Server-side code
│   ├── app/              # App router pages
│   └── chunks/           # Code chunks
├── static/               # Static assets
│   ├── chunks/           # JavaScript chunks
│   ├── css/             # Compiled CSS
│   └── media/           # Optimized images
└── BUILD_ID             # Unique build identifier
```

---

### 6.1.2 Bundle Analysis & Optimization

#### Analyze Bundle Size

```bash
# Windows (from package.json)
npm run analyze

# This runs: set ANALYZE=true && next build
```

**Opens interactive bundle analyzer in browser:**
- View size of each dependency
- Identify large packages
- Find optimization opportunities

#### Optimization Checklist

**1. Image Optimization**
```tsx
// Use Next.js Image component
import Image from 'next/image'

<Image
  src="/logo.png"
  width={200}
  height={100}
  alt="Logo"
  priority // For above-the-fold images
/>
```

**2. Code Splitting**
```tsx
// Dynamic imports for large components
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false // Disable SSR if not needed
})
```

**3. Remove Unused Dependencies**
```bash
# Audit dependencies
npm audit

# Check for unused packages
npx depcheck

# Remove unused packages
npm uninstall <package-name>
```

**4. Tree Shaking**
```tsx
// Import only what you need
import { Button } from '@/components/ui/button' // Good
import * from '@/components/ui' // Bad
```

#### Performance Targets

| Metric | Target | Good | Needs Improvement |
|--------|--------|------|-------------------|
| **First Contentful Paint (FCP)** | < 1.8s | < 1.8s | > 3.0s |
| **Largest Contentful Paint (LCP)** | < 2.5s | < 2.5s | > 4.0s |
| **Time to Interactive (TTI)** | < 3.8s | < 3.8s | > 7.3s |
| **Total Blocking Time (TBT)** | < 200ms | < 200ms | > 600ms |
| **Cumulative Layout Shift (CLS)** | < 0.1 | < 0.1 | > 0.25 |
| **First Input Delay (FID)** | < 100ms | < 100ms | > 300ms |

---

### 6.1.3 Build Verification

#### Test Production Build Locally

```bash
# Build the application
npm run build

# Start production server
npm start

# Server runs on http://localhost:3000
```

#### Verify Build Success

**Check for errors:**
- No TypeScript errors
- No linting errors
- All routes compile successfully
- Build completes without warnings

**Test critical paths:**
1. Homepage loads
2. Login works
3. Student dashboard accessible
4. Teacher dashboard accessible
5. API routes respond
6. Images load correctly
7. Styles apply correctly

---

## 6.2 Deployment Strategies

### 6.2.1 Vercel Deployment (Recommended)

**Why Vercel:**
- Built by Next.js creators
- Zero configuration
- Automatic HTTPS
- Global CDN
- Automatic deployments
- Preview deployments for PRs
- Serverless functions

#### Initial Deployment

**Method 1: Via Vercel Dashboard (Easiest)**

1. **Sign up for Vercel:**
   - Visit [vercel.com](https://vercel.com/)
   - Sign up with GitHub

2. **Import Project:**
   - Click "Add New..." → "Project"
   - Select your GitHub repository
   - Vercel auto-detects Next.js

3. **Configure Build:**
   ```
   Framework Preset: Next.js
   Root Directory: frontend-nextjs
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add all production environment variables
   - Separate values for Production, Preview, Development

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Get deployment URL: `https://your-app.vercel.app`

**Method 2: Via Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to project
cd frontend-nextjs

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# ? Set up and deploy "~/Projects/southville-8b-nhs-edge"? [Y/n] Y
# ? Which scope do you want to deploy to? <your-account>
# ? Link to existing project? [y/N] N
# ? What's your project's name? southville-8b-nhs-edge
# ? In which directory is your code located? ./

# Deploy to production
vercel --prod
```

#### Automatic Deployments

**GitHub Integration:**
- Every push to `main` → Production deployment
- Every PR → Preview deployment
- Automatic builds on merge

**Configuration file:** `vercel.json`
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

#### Custom Domain Setup

1. **Add Domain in Vercel:**
   - Project Settings → Domains
   - Add your domain: `portal.southville8b.edu`

2. **Configure DNS:**
   ```
   Type: CNAME
   Name: portal (or @)
   Value: cname.vercel-dns.com
   ```

3. **Verify:**
   - Wait for DNS propagation (5-60 minutes)
   - Automatic SSL certificate provisioned

---

### 6.2.2 Self-Hosted Options

#### Option A: Traditional VPS (DigitalOcean, Linode, AWS EC2)

**Server Requirements:**
- Ubuntu 22.04 LTS
- 4GB RAM minimum
- 2 vCPUs
- 50GB SSD

**Deployment Steps:**

**1. Server Setup:**
```bash
# SSH into server
ssh root@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (reverse proxy)
sudo apt install nginx -y

# Install certbot (SSL certificates)
sudo apt install certbot python3-certbot-nginx -y
```

**2. Deploy Application:**
```bash
# Create app directory
mkdir -p /var/www/southville-portal
cd /var/www/southville-portal

# Clone repository (use deployment key)
git clone git@github.com:your-org/southville-8b-nhs-edge.git .

# Navigate to frontend
cd frontend-nextjs

# Install dependencies
npm install

# Create .env.production.local
nano .env.production.local
# Add all production environment variables

# Build application
npm run build

# Start with PM2
pm2 start npm --name "southville-portal" -- start

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

**3. Configure Nginx:**
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/southville-portal
```

```nginx
server {
    listen 80;
    server_name portal.southville8b.edu;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/southville-portal /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d portal.southville8b.edu

# Certbot automatically updates Nginx config for HTTPS
```

**4. Update Script:**
```bash
# Create update script
nano ~/update-portal.sh
```

```bash
#!/bin/bash
cd /var/www/southville-portal/frontend-nextjs
git pull origin main
npm install
npm run build
pm2 restart southville-portal
```

```bash
# Make executable
chmod +x ~/update-portal.sh

# Run updates
~/update-portal.sh
```

---

### 6.2.3 Docker Containerization

#### Dockerfile

Create `Dockerfile` in `frontend-nextjs/`:

```dockerfile
# Multi-stage build for optimal size
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  nextjs:
    build:
      context: ./frontend-nextjs
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - NEXT_PUBLIC_CHAT_SERVICE_URL=${NEXT_PUBLIC_CHAT_SERVICE_URL}
    restart: unless-stopped
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

#### Build and Run

```bash
# Build Docker image
docker-compose build

# Run container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop container
docker-compose down
```

---

## 6.3 Environment Configuration (Production)

### 6.3.1 Production Environment Variables

#### Required Variables

**Vercel Environment Variables:**

Navigate to: Project Settings → Environment Variables

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | Production, Preview, Development |
| `NEXT_PUBLIC_CHAT_SERVICE_URL` | `https://chat.yourschool.com` | Production |
| `NEXT_PUBLIC_API_URL` | `https://api.yourschool.com` | Production |

#### Self-Hosted: `.env.production.local`

```bash
# Production environment variables
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_CHAT_SERVICE_URL=https://chat.yourschool.com
NEXT_PUBLIC_API_URL=https://api.yourschool.com
NODE_ENV=production
```

---

### 6.3.2 Secrets Management

#### Vercel

- Secrets are encrypted at rest
- Never logged or exposed
- Accessible only during build and runtime
- Use environment-specific values

#### Self-Hosted

**Option 1: Environment Variables**
```bash
# Use systemd environment file
sudo nano /etc/systemd/system/southville-portal.service
```

```ini
[Service]
EnvironmentFile=/var/www/southville-portal/.env.production
```

**Option 2: AWS Secrets Manager / HashiCorp Vault**
- Centralized secret storage
- Automatic rotation
- Audit logging
- Access control

---

### 6.3.3 Configuration Validation

#### Pre-deployment Checklist

```bash
# Verify all environment variables are set
node -e "
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('Missing environment variables:', missing);
    process.exit(1);
  }

  console.log('✓ All required environment variables are set');
"
```

---

## 6.4 Post-Deployment Verification

### 6.4.1 Health Checks

#### Automated Health Check Script

```bash
#!/bin/bash

# Health check script
URL="https://portal.southville8b.edu"

# Check if site is reachable
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ $HTTP_CODE -eq 200 ]; then
  echo "✓ Site is up (HTTP $HTTP_CODE)"
else
  echo "✗ Site is down (HTTP $HTTP_CODE)"
  exit 1
fi

# Check critical routes
ROUTES=("/" "/guess/login" "/student/dashboard")

for route in "${ROUTES[@]}"; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL$route")
  if [ $CODE -eq 200 ] || [ $CODE -eq 401 ]; then
    echo "✓ $route (HTTP $CODE)"
  else
    echo "✗ $route (HTTP $CODE)"
  fi
done
```

---

### 6.4.2 Smoke Testing

#### Manual Smoke Test Checklist

- [ ] Homepage loads without errors
- [ ] Login page accessible
- [ ] Login functionality works
- [ ] Student dashboard loads (after login)
- [ ] Teacher dashboard loads (after login)
- [ ] Images display correctly
- [ ] Styles apply correctly
- [ ] Navigation works
- [ ] Forms submit successfully
- [ ] API requests work
- [ ] Real-time chat connects
- [ ] No console errors
- [ ] Mobile responsive design works

#### Automated Smoke Tests

```javascript
// smoke-test.js
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Test homepage
  await page.goto('https://portal.southville8b.edu');
  console.log('✓ Homepage loaded');

  // Test login page
  await page.goto('https://portal.southville8b.edu/guess/login');
  console.log('✓ Login page loaded');

  await browser.close();
})();
```

---

### 6.4.3 Performance Validation

#### Core Web Vitals Check

**Use Lighthouse:**
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://portal.southville8b.edu --output html --output-path ./report.html

# View report
open report.html
```

**Target Scores:**
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

#### Real User Monitoring

**Vercel Analytics (Recommended):**
- Automatic Core Web Vitals tracking
- Real user performance data
- Geographic insights

**Alternative: Google Analytics 4:**
- Configure Web Vitals tracking
- Custom events for user interactions

---

## 6.5 Rollback Procedures

### 6.5.1 Vercel Rollback

**Via Dashboard:**
1. Go to Project → Deployments
2. Find previous successful deployment
3. Click "⋮" menu → "Promote to Production"
4. Confirm rollback

**Via CLI:**
```bash
# List deployments
vercel ls

# Promote specific deployment
vercel promote <deployment-url>
```

**Time to rollback:** < 1 minute

---

### 6.5.2 Self-Hosted Rollback

**Git-based Rollback:**

```bash
# View commit history
git log --oneline

# Rollback to previous commit
git checkout <previous-commit-hash>

# Rebuild and restart
npm run build
pm2 restart southville-portal
```

**Docker Rollback:**

```bash
# Tag images with version
docker tag southville-portal:latest southville-portal:v1.2.0

# Rollback to previous version
docker-compose down
docker-compose up -d southville-portal:v1.1.0
```

---

### 6.5.3 Emergency Procedures

#### Complete Service Failure

**1. Enable Maintenance Mode:**

**Vercel:**
- Deploy a static maintenance page
- Update DNS to point to maintenance page

**Self-Hosted:**
```nginx
# Nginx maintenance mode
location / {
    return 503;
}

error_page 503 /maintenance.html;
location = /maintenance.html {
    root /var/www/maintenance;
    internal;
}
```

**2. Investigate Issue:**
- Check logs
- Monitor error rates
- Identify root cause

**3. Fix and Redeploy:**
- Fix issue in code
- Test locally
- Deploy fix
- Verify fix in production

**4. Disable Maintenance Mode:**
- Restore normal operation
- Monitor closely

---

## Deployment Summary

### Quick Deployment Guide

**Vercel (Recommended):**
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy (automatic)
5. Configure custom domain
6. **Done!**

**Self-Hosted:**
1. Provision server
2. Install dependencies (Node.js, PM2, Nginx)
3. Clone repository
4. Build application
5. Configure Nginx reverse proxy
6. Setup SSL with Certbot
7. Start application with PM2
8. **Done!**

**Docker:**
1. Create Dockerfile
2. Build Docker image
3. Run with Docker Compose
4. Configure reverse proxy
5. **Done!**

---

## Navigation

- [← Previous: Development Environment Setup](./05-development-environment-setup.md)
- [Next: Database & Services Configuration →](./07-database-services-configuration.md)
- [↑ Back to Volume 2 Index](./README.md)
- [↑↑ Back to Manual Index](../README.md)
