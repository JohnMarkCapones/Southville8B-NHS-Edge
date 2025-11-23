# Deployment Quick Checklist

Use this checklist before deploying the backend API to production.

## Pre-Deployment

### Code Quality
- [ ] All tests pass: `npm run test`
- [ ] E2E tests pass: `npm run test:e2e`
- [ ] Linting passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Security check passes: `npm run security-check`
- [ ] No TypeScript errors
- [ ] Code review completed

### Environment Variables
- [ ] `NODE_ENV=production`
- [ ] `PORT=3004` (or configured port)
- [ ] `SUPABASE_URL` - Production Supabase URL
- [ ] `SUPABASE_ANON_KEY` - Production anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Production service role key
- [ ] `SUPABASE_JWT_SECRET` - JWT secret
- [ ] `R2_ACCOUNT_ID` - Cloudflare R2 account ID
- [ ] `R2_ACCESS_KEY_ID` - R2 access key
- [ ] `R2_SECRET_ACCESS_KEY` - R2 secret key
- [ ] `R2_BUCKET_NAME` - R2 bucket name
- [ ] `R2_PUBLIC_URL` - R2 public URL (if using custom domain)
- [ ] `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account ID
- [ ] `CLOUDFLARE_IMAGES_API_TOKEN` - Images API token
- [ ] `CLOUDFLARE_ACCOUNT_HASH` - Account hash
- [ ] `CORS_ORIGIN` - Production frontend URL

### Database
- [ ] All migrations applied to production database
- [ ] RLS policies configured and tested
- [ ] Database backups configured
- [ ] Connection pooling tested

### Security
- [ ] CORS configured for production domain only
- [ ] Rate limiting configured
- [ ] Helmet security headers enabled
- [ ] SSL/TLS certificate configured
- [ ] Environment variables secured (not in code)
- [ ] Service role key never exposed to frontend

### Infrastructure
- [ ] Server/hosting platform configured
- [ ] Domain name configured (if applicable)
- [ ] DNS records set up
- [ ] Firewall rules configured
- [ ] Monitoring set up
- [ ] Logging configured

## Deployment Steps

### Option A: Docker
- [ ] Dockerfile created and tested
- [ ] Docker image built: `docker build -t southville-api:latest .`
- [ ] Image tested locally
- [ ] Container deployed
- [ ] Health check passing

### Option B: Cloud Platform (Railway/Render/Vercel)
- [ ] Repository connected
- [ ] Build command configured
- [ ] Start command configured
- [ ] Environment variables added
- [ ] Deployment triggered
- [ ] Deployment successful

### Option C: VPS
- [ ] Server provisioned
- [ ] Node.js 18+ installed
- [ ] PM2 installed and configured
- [ ] Application cloned and built
- [ ] Environment variables set
- [ ] PM2 process started
- [ ] Nginx reverse proxy configured
- [ ] SSL certificate installed

## Post-Deployment

### Verification
- [ ] Health endpoint responds: `GET /health`
- [ ] API documentation accessible: `GET /api/docs`
- [ ] Root endpoint works: `GET /`
- [ ] Authentication endpoints work
- [ ] Database queries succeed
- [ ] File upload to R2 works
- [ ] Image upload to Cloudflare Images works

### Testing
- [ ] Test user registration/login
- [ ] Test protected endpoints with JWT
- [ ] Test file upload
- [ ] Test image upload
- [ ] Test database operations
- [ ] Test error handling

### Monitoring
- [ ] Application logs accessible
- [ ] Error tracking configured (if using)
- [ ] Uptime monitoring set up
- [ ] Performance monitoring active
- [ ] Alerts configured

## Rollback Plan
- [ ] Previous version tagged/backed up
- [ ] Rollback procedure documented
- [ ] Rollback tested in staging

## Documentation
- [ ] API documentation updated
- [ ] Deployment notes documented
- [ ] Environment variables documented
- [ ] Team notified of deployment

---

## Quick Commands

### Build & Test Locally
```bash
npm ci
npm run build
npm run start:prod
```

### Docker
```bash
docker build -t southville-api:latest .
docker run -p 3004:3004 --env-file .env southville-api:latest
```

### PM2
```bash
pm2 start dist/main.js --name southville-api
pm2 save
pm2 startup
```

### Health Check
```bash
curl http://localhost:3004/health
```

---

**Last Updated**: 2024-01-01







