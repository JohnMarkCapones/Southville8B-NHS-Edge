# Cloudflare R2 Object Storage Configuration

This document explains how to configure Cloudflare R2 Object Storage for the Southville NHS School Portal API.

## 🚀 Quick Setup

### 1. Create Cloudflare R2 Bucket

1. Log in to your Cloudflare dashboard
2. Navigate to **R2 Object Storage**
3. Click **Create bucket**
4. Enter a bucket name (must be globally unique)
5. Choose your location preference

### 2. Generate API Credentials

1. Go to **Manage R2 API tokens**
2. Click **Create API token**
3. Select **Custom token**
4. Configure permissions:
   - **Account**: `Cloudflare R2:Edit`
   - **Zone Resources**: Include all zones
5. Save the generated credentials

### 3. Environment Variables

Copy the environment variables from `R2_ENVIRONMENT_EXAMPLE.md` to your `.env` file:

```bash
# Required Configuration
R2_ACCOUNT_ID=your_32_character_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your-bucket-name
```

## 📋 Configuration Details

### Required Variables

| Variable               | Description                                | Example                            |
| ---------------------- | ------------------------------------------ | ---------------------------------- |
| `R2_ACCOUNT_ID`        | Your Cloudflare account ID (32 characters) | `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6` |
| `R2_ACCESS_KEY_ID`     | R2 API access key                          | `your_access_key_id`               |
| `R2_SECRET_ACCESS_KEY` | R2 API secret key                          | `your_secret_access_key`           |
| `R2_BUCKET_NAME`       | Name of your R2 bucket                     | `southville-portal-files`          |

### Optional Variables

| Variable                      | Default                    | Description                                |
| ----------------------------- | -------------------------- | ------------------------------------------ |
| `R2_REGION`                   | `auto`                     | R2 region (always use 'auto')              |
| `R2_PUBLIC_URL`               | -                          | Custom domain for public access            |
| `R2_MAX_FILE_SIZE`            | `10485760`                 | Maximum file size in bytes (10MB)          |
| `R2_ALLOWED_MIME_TYPES`       | Image types + PDF/CSV      | Comma-separated list of allowed MIME types |
| `R2_PRESIGNED_URL_EXPIRATION` | `3600`                     | Presigned URL expiration in seconds        |
| `R2_CACHE_CONTROL`            | `public, max-age=31536000` | Cache control header                       |
| `STORAGE_PROVIDER`            | `r2`                       | Storage provider ('r2' or 'supabase')      |

## 🔧 Configuration Validation

The application automatically validates your R2 configuration on startup:

- ✅ Checks for required environment variables
- ✅ Validates account ID format (32 characters)
- ✅ Validates bucket name format
- ✅ Warns about potential security issues
- ✅ Logs configuration status

## 🛡️ Security Considerations

### File Upload Security

- **MIME Type Validation**: Only allowed file types are accepted
- **File Size Limits**: Configurable maximum file size
- **Content Validation**: Optional virus scanning support
- **Presigned URLs**: Secure temporary access without exposing credentials

### Access Control

- **Private Bucket**: Files are private by default
- **Presigned URLs**: Temporary access with expiration
- **Custom Domain**: Optional public access via custom domain
- **CORS Configuration**: Configured for web application access

## 🚀 Performance Optimization

### Multipart Uploads

For large files (>10MB), the system automatically uses multipart uploads:

- **Threshold**: `R2_MULTIPART_THRESHOLD` (default: 10MB)
- **Chunk Size**: `R2_MULTIPART_CHUNKSIZE` (default: 5MB)
- **Concurrency**: `R2_MAX_CONCURRENCY` (default: 3)

### Caching

- **CDN Integration**: Files served via Cloudflare CDN
- **Cache Headers**: Configurable cache control
- **Edge Caching**: Global edge locations for fast access

## 🔍 Troubleshooting

### Common Issues

1. **Missing Environment Variables**

   ```
   Error: Missing required R2 environment variables: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID
   ```

   **Solution**: Ensure all required variables are set in your `.env` file

2. **Invalid Account ID**

   ```
   Warning: R2_ACCOUNT_ID should be 32 characters long, got 30
   ```

   **Solution**: Verify your account ID is exactly 32 characters

3. **Bucket Name Format**

   ```
   Error: R2_BUCKET_NAME can only contain lowercase letters, numbers, dots, and hyphens
   ```

   **Solution**: Use only lowercase letters, numbers, dots, and hyphens

4. **File Size Too Large**
   ```
   Error: File size too large. Maximum size is 10MB.
   ```
   **Solution**: Increase `R2_MAX_FILE_SIZE` or compress the file

### Debug Mode

Enable detailed logging by setting:

```bash
R2_ENABLE_REQUEST_LOGGING=true
R2_LOG_LEVEL=debug
```

## 📊 Monitoring

### Health Checks

The application provides health check endpoints:

- **Configuration Status**: Check if R2 is properly configured
- **Connection Test**: Verify R2 connectivity
- **Bucket Access**: Test bucket permissions

### Logging

All R2 operations are logged with:

- **Operation Type**: Upload, download, delete, etc.
- **File Information**: Name, size, MIME type
- **Performance Metrics**: Upload time, file size
- **Error Details**: Detailed error information

## 🔄 Migration from Supabase Storage

If migrating from Supabase Storage:

1. **Set Storage Provider**: `STORAGE_PROVIDER=r2`
2. **Configure R2**: Set up all R2 environment variables
3. **Test Configuration**: Verify R2 is working
4. **Migrate Files**: Use migration scripts to move existing files
5. **Update URLs**: Update database records with new R2 URLs

## 📚 Additional Resources

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [AWS S3 SDK Documentation](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/)
- [R2 Pricing](https://developers.cloudflare.com/r2/platform/pricing/)
- [R2 API Reference](https://developers.cloudflare.com/r2/api/)
