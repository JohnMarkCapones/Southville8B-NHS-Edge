# Render Deployment Guide

This guide will walk you through deploying the Southville NHS School Portal API Layer to Render.

## Prerequisites

- A Render account ([sign up here](https://render.com))
- Your Supabase project credentials
- (Optional) Cloudflare R2 credentials if using file storage
- (Optional) Cloudflare Images credentials if using image optimization

## Step 1: Prepare Your Repository

1. Ensure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket)
2. Verify that `render.yaml` is in the root of your API layer directory
3. Make sure all your code is committed and pushed to the `main` branch (or your preferred branch)

## Step 2: Create a New Web Service on Render

1. Log in to your [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** and select **"Web Service"**
3. Connect your Git repository:
   - If this is your first time, connect your Git provider (GitHub/GitLab/Bitbucket)
   - Select the repository containing this API layer
   - Select the branch (typically `main`)

## Step 3: Configure the Service

### Option A: Using render.yaml (Recommended)

If you have `render.yaml` in your repository root, Render will automatically detect and use it. The configuration includes:

- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm run start:prod`
- **Health Check Path**: `/health`
- **Environment**: Node.js
- **Auto Deploy**: Enabled for the `main` branch

### Option B: Manual Configuration

If you prefer to configure manually:

1. **Name**: Enter a name for your service (e.g., `southville-nhs-api`)
2. **Region**: Select a region closest to your users (e.g., `Oregon`)
3. **Branch**: Select `main` (or your deployment branch)
4. **Root Directory**: Set to `core-api-layer/southville-nhs-school-portal-api-layer` (if your repo contains multiple services)
5. **Runtime**: Select `Node`
6. **Build Command**: `npm ci && npm run build`
7. **Start Command**: `npm run start:prod`
8. **Plan**: Choose a plan (Starter is fine for initial deployment)

## Step 4: Configure Environment Variables

In the Render dashboard, navigate to your service's **Environment** tab and add the following variables:

### Required Environment Variables

```bash
# Application
NODE_ENV=production
PORT=3004

# Supabase (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# CORS Configuration (Required for production)
FRONTEND_URL=https://your-frontend-domain.com
# OR use ALLOWED_ORIGINS for multiple origins:
# ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Optional Environment Variables

```bash
# Supabase (Optional)
SUPABASE_JWT_SECRET=your-jwt-secret

# Cloudflare R2 Storage (Optional - if using file storage)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=your-bucket-name
R2_PUBLIC_URL=https://your-bucket.r2.dev
R2_REGION=auto

# Cloudflare Images (Optional - if using image optimization)
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_IMAGES_API_TOKEN=your-api-token
CLOUDFLARE_ACCOUNT_HASH=your-account-hash
```

> **Note**: See `env.example` file for a complete list of all available environment variables with descriptions.

## Step 5: Deploy

1. Click **"Create Web Service"** (or **"Save Changes"** if updating)
2. Render will automatically:
   - Clone your repository
   - Install dependencies (`npm ci`)
   - Build your application (`npm run build`)
   - Start your service (`npm run start:prod`)
3. Monitor the deployment logs in the Render dashboard
4. Once deployed, your service will be available at: `https://your-service-name.onrender.com`

## Step 6: Verify Deployment

1. **Health Check**: Visit `https://your-service-name.onrender.com/health`
   - Should return: `{"status":"healthy","timestamp":"...","supabase":"connected"}`
2. **API Documentation**: Visit `https://your-service-name.onrender.com/api/docs`
   - Swagger UI should load with all API endpoints
3. **Root Endpoint**: Visit `https://your-service-name.onrender.com`
   - Should return a welcome message

## Step 7: Configure Custom Domain (Optional)

1. In your Render service dashboard, go to **Settings**
2. Scroll to **Custom Domains**
3. Add your domain (e.g., `api.yourdomain.com`)
4. Follow Render's DNS configuration instructions
5. Update your `FRONTEND_URL` or `ALLOWED_ORIGINS` environment variable to include your custom domain

## Health Check Configuration

The service includes a health check endpoint at `/health` that:
- Checks application status
- Verifies Supabase database connectivity
- Returns a JSON response with status information

Render automatically monitors this endpoint. If it fails, Render will attempt to restart your service.

## Database Migrations

If you need to run database migrations:

1. **Option 1**: Run migrations manually via Supabase dashboard SQL editor
2. **Option 2**: Create a one-time script and run it via Render's shell
3. **Option 3**: Use Supabase CLI in a build script (not recommended for production)

> **Note**: The API layer does not automatically run migrations. Ensure your database schema is up to date before deploying.

## Troubleshooting

### Build Failures

**Issue**: Build fails with dependency errors
- **Solution**: Ensure `package.json` and `package-lock.json` are committed
- Check that all dependencies are listed in `package.json`
- Verify Node.js version compatibility (project uses Node 18)

**Issue**: TypeScript compilation errors
- **Solution**: Fix TypeScript errors locally first
- Run `npm run build` locally to verify it works
- Check `tsconfig.json` configuration

### Runtime Errors

**Issue**: Service starts but crashes immediately
- **Solution**: Check the logs in Render dashboard
- Verify all required environment variables are set
- Check that Supabase credentials are correct
- Ensure `PORT` environment variable matches Render's expected port

**Issue**: Health check fails
- **Solution**: 
  - Verify Supabase connection credentials
  - Check that the `users` table exists in your Supabase database
  - Review application logs for specific error messages

### CORS Errors

**Issue**: Frontend cannot connect to API
- **Solution**: 
  - Set `FRONTEND_URL` or `ALLOWED_ORIGINS` environment variable
  - Ensure the frontend URL matches exactly (including protocol: `https://`)
  - For multiple origins, use comma-separated list in `ALLOWED_ORIGINS`
  - Restart the service after updating environment variables

### Connection Issues

**Issue**: Cannot connect to Supabase
- **Solution**:
  - Verify `SUPABASE_URL` is correct (no trailing slash)
  - Check that `SUPABASE_SERVICE_ROLE_KEY` is the service role key (not anon key)
  - Ensure your Supabase project is active and not paused
  - Check Supabase dashboard for any service issues

**Issue**: R2 or Cloudflare Images not working
- **Solution**:
  - Verify all Cloudflare credentials are correct
  - Check that the services are enabled in your Cloudflare account
  - Review Cloudflare dashboard for any errors
  - These are optional - the API will work without them if not configured

## Environment Variables Reference

For a complete list of all environment variables, see the `env.example` file in the repository root.

### Quick Reference

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `NODE_ENV` | Yes | Environment mode | `production` |
| `PORT` | Yes | Server port | `3004` |
| `SUPABASE_URL` | Yes | Supabase project URL | - |
| `SUPABASE_ANON_KEY` | Yes | Supabase anonymous key | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key | - |
| `FRONTEND_URL` | Yes* | Frontend URL for CORS | - |
| `ALLOWED_ORIGINS` | No | Comma-separated origins | - |
| `R2_*` | No | Cloudflare R2 config | - |
| `CLOUDFLARE_*` | No | Cloudflare Images config | - |

*Required in production for CORS to work properly

## Monitoring and Logs

- **Logs**: View real-time logs in the Render dashboard under the **Logs** tab
- **Metrics**: Monitor CPU, memory, and request metrics in the **Metrics** tab
- **Alerts**: Set up email alerts for service failures in **Settings > Notifications**

## Updating Your Deployment

1. Push changes to your `main` branch (or configured branch)
2. Render will automatically detect changes and redeploy
3. Monitor the deployment in the Render dashboard
4. Verify the new deployment works correctly

## Rollback

If a deployment fails or causes issues:

1. Go to your service dashboard
2. Click on **Manual Deploy**
3. Select a previous successful deployment
4. Click **Deploy**

## Security Best Practices

1. **Never commit** `.env` files or secrets to your repository
2. Use Render's **Environment Variables** for all sensitive data
3. Rotate secrets regularly
4. Use the **service role key** only on the server (never expose to client)
5. Enable **HTTPS only** in Render settings
6. Regularly review and update dependencies for security patches

## Support

- **Render Documentation**: https://render.com/docs
- **NestJS Documentation**: https://docs.nestjs.com
- **Supabase Documentation**: https://supabase.com/docs

## Additional Notes

- The service uses Fastify as the HTTP server (not Express)
- Health checks are performed at `/health` endpoint
- API documentation is available at `/api/docs`
- All API routes are prefixed with `/api/v1/`
- The service listens on `0.0.0.0` to accept connections from Render's load balancer

