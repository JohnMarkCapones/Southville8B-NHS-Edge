# Render Deployment - Quick Start Guide

## 🚀 Quick Deployment Steps

### Step 1: Push Your Code to Git
```bash
# Make sure you're on the branch you want to deploy (main or develop)
git add .
git commit -m "chore: prepare for Render deployment"
git push origin main  # or your deployment branch
```

### Step 2: Create Render Account & Connect Repository

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Sign up or log in
3. Click **"New +"** → **"Web Service"**
4. Connect your Git provider (GitHub/GitLab/Bitbucket)
5. Select your repository: `Southville8B-NHS-Edge`
6. Select branch: `main` (or `develop` if you updated render.yaml)

### Step 3: Render Auto-Detection

Render will automatically detect `render.yaml` and configure:
- ✅ Build Command: `npm ci && npm run build`
- ✅ Start Command: `npm run start:prod`
- ✅ Health Check: `/health`
- ✅ Port: `3004`
- ✅ Auto-deploy: Enabled

**IMPORTANT**: If your repo has multiple services, set:
- **Root Directory**: `core-api-layer/southville-nhs-school-portal-api-layer`

### Step 4: Add Environment Variables

In Render dashboard, go to **Environment** tab and add:

#### Required Variables:
```
NODE_ENV=production
PORT=3004
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FRONTEND_URL=https://your-frontend-domain.com
```

#### Optional Variables (if using):
```
SUPABASE_JWT_SECRET=your-jwt-secret
R2_ACCOUNT_ID=your-r2-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=your-bucket-name
R2_PUBLIC_URL=https://your-bucket.r2.dev
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_IMAGES_API_TOKEN=your-api-token
CLOUDFLARE_ACCOUNT_HASH=your-account-hash
```

> 💡 **Tip**: Copy values from your local `.env` file (see `env.example` for reference)

### Step 5: Deploy

1. Click **"Create Web Service"** (or **"Save Changes"** if updating)
2. Render will automatically:
   - Clone your repository
   - Install dependencies (`npm ci`)
   - Build your application (`npm run build`)
   - Start your service (`npm run start:prod`)
3. Monitor the deployment in the **Logs** tab
4. Wait for deployment to complete (usually 2-5 minutes)

### Step 6: Verify Deployment

Once deployed, your service will be available at:
```
https://southville-nhs-api.onrender.com
```

**Test these endpoints:**
1. Health Check: `https://southville-nhs-api.onrender.com/health`
   - Should return: `{"status":"healthy","timestamp":"...","supabase":"connected"}`

2. API Docs: `https://southville-nhs-api.onrender.com/api/docs`
   - Swagger UI should load

3. Root: `https://southville-nhs-api.onrender.com`
   - Should return welcome message

### Step 7: Configure Custom Domain (Optional)

1. Go to **Settings** → **Custom Domains**
2. Add your domain (e.g., `api.yourdomain.com`)
3. Follow Render's DNS instructions
4. Update `FRONTEND_URL` environment variable to include your custom domain

## 🔧 Troubleshooting

### Build Fails
- Check **Logs** tab for error messages
- Verify `package.json` and `package-lock.json` are committed
- Ensure Node.js version is compatible (project uses Node 18)

### Service Crashes
- Check **Logs** tab for runtime errors
- Verify all required environment variables are set
- Check Supabase credentials are correct
- Ensure `PORT` matches Render's expected port

### Health Check Fails
- Verify Supabase connection credentials
- Check that `users` table exists in Supabase
- Review application logs for specific errors

### CORS Errors
- Set `FRONTEND_URL` or `ALLOWED_ORIGINS` environment variable
- Ensure URL matches exactly (including `https://`)
- Restart service after updating environment variables

## 📋 Pre-Deployment Checklist

Before deploying, ensure:
- [x] Code is pushed to Git repository
- [x] `render.yaml` is in the API layer root directory
- [x] All environment variables are ready (see `env.example`)
- [x] Supabase project is active and accessible
- [x] Database migrations are applied (if needed)

## 🎯 Post-Deployment

After successful deployment:
1. ✅ Test health endpoint
2. ✅ Test API documentation
3. ✅ Test authentication endpoints
4. ✅ Update frontend to use new API URL
5. ✅ Monitor logs for any issues
6. ✅ Set up monitoring/alerts (optional)

## 📞 Support

- **Render Docs**: https://render.com/docs
- **Render Status**: https://status.render.com
- **Project Docs**: See `docs/DEPLOYMENT.md` for detailed guide

---

**Ready to deploy?** Follow steps 1-6 above! 🚀

