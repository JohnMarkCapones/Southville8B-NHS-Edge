<!-- e1f7ebc9-9d71-4330-a3bf-b2ec84c1c3fb 8c606701-209a-4b9e-b731-27aea0011aec -->
# Render Deployment Preparation

## Overview

Prepare the Southville NHS School Portal API Layer for deployment on Render by configuring build settings, environment variables, CORS, and deployment documentation.

## Implementation Steps

### 1. Create Render Configuration File

- Create `render.yaml` in the API layer root directory
- Configure web service with:
- Build command: `npm ci && npm run build`
- Start command: `npm run start:prod`
- Health check path: `/health`
- Environment: Node.js
- Auto-deploy from main branch

### 2. Update CORS Configuration

- Modify `src/main.ts` to use environment variable for allowed origins
- Replace hardcoded `['https://yourdomain.com']` with `process.env.ALLOWED_ORIGINS` or `process.env.FRONTEND_URL`
- Support multiple origins via comma-separated string
- Default to allowing all origins in development

### 3. Create Environment Variables Documentation

- Create `.env.example` file listing all required environment variables:
- **Supabase**: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`
- **Cloudflare R2**: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`
- **Cloudflare Images**: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_IMAGES_API_TOKEN`, `CLOUDFLARE_ACCOUNT_HASH`
- **Application**: `PORT`, `NODE_ENV`, `FRONTEND_URL` or `ALLOWED_ORIGINS`
- Document optional variables with defaults

### 4. Update Package.json Scripts (if needed)

- Verify `start:prod` script uses `node dist/main` (already correct)
- Ensure build script is optimized for production

### 5. Create Deployment Documentation

- Create `DEPLOYMENT.md` with:
- Render setup instructions
- Environment variables setup guide
- Health check configuration
- Database migration notes (if applicable)
- Troubleshooting common issues

### 6. Verify Health Check Endpoint

- Confirm `/health` endpoint exists and works (already implemented in `app.controller.ts`)
- Health check should return 200 status for Render's health monitoring

### 7. Update .dockerignore (if needed)

- Ensure unnecessary files are excluded from builds
- Verify migrations and test files are properly excluded

## Files to Create/Modify

1. **Create**: `render.yaml` - Render service configuration
2. **Create**: `.env.example` - Environment variables template
3. **Create**: `DEPLOYMENT.md` - Deployment documentation
4. **Modify**: `src/main.ts` - Update CORS configuration to use environment variables
5. **Verify**: `package.json` - Ensure production scripts are correct

## Environment Variables Required

### Required

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PORT` (defaults to 3004)
- `NODE_ENV=production`
- `FRONTEND_URL` or `ALLOWED_ORIGINS` (for CORS)

### Optional (with defaults)

- `SUPABASE_JWT_SECRET`
- `R2_*` variables (if using R2 storage)
- `CLOUDFLARE_*` variables (if using Cloudflare Images)

## Notes

- Render will automatically detect Node.js and use the build/start commands
- Health checks will use the `/health` endpoint
- CORS must be configured to allow the frontend domain
- All environment variables should be set in Render dashboard before deployment

### To-dos

- [ ] Create render.yaml configuration file with web service settings, build commands, and health check path
- [ ] Update CORS configuration in main.ts to use environment variables for allowed origins instead of hardcoded values
- [ ] Create .env.example file documenting all required and optional environment variables with descriptions
- [ ] Create DEPLOYMENT.md with step-by-step Render deployment instructions and troubleshooting guide
- [ ] Verify package.json production scripts are correct and optimized for Render deployment