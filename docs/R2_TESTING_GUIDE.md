# 🧪 R2 Connection Testing Guide

This guide explains how to test your Cloudflare R2 connection and verify that everything is working correctly.

## 🚀 **Quick Test Methods**

### **Method 1: Standalone Test Script (Recommended)**

```bash
# Test R2 connection without starting the full application
npm run test:r2-connection
```

### **Method 2: API Endpoints (After App Start)**

```bash
# Start the application first
npm run start:dev

# Then test via API endpoints
curl -X GET "http://localhost:3000/r2-health/status" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Method 3: Swagger UI**

1. Start the application: `npm run start:dev`
2. Open: `http://localhost:3000/api`
3. Navigate to **R2 Health Check** section
4. Use the endpoints with your admin JWT token

## 📋 **Test Results Explained**

### **✅ Successful Test Results**

```json
{
  "isConnected": true,
  "bucketExists": true,
  "canUpload": true,
  "canDownload": true,
  "canDelete": true,
  "bucketName": "your-bucket-name",
  "endpoint": "https://your-account-id.r2.cloudflarestorage.com",
  "errors": [],
  "testResults": {
    "configuration": true,
    "bucketAccess": true,
    "uploadTest": true,
    "downloadTest": true,
    "deleteTest": true
  }
}
```

### **❌ Failed Test Results**

```json
{
  "isConnected": false,
  "bucketExists": false,
  "canUpload": false,
  "canDownload": false,
  "canDelete": false,
  "bucketName": "your-bucket-name",
  "endpoint": "https://your-account-id.r2.cloudflarestorage.com",
  "errors": ["R2 configuration is invalid", "Bucket access denied"],
  "testResults": {
    "configuration": false,
    "bucketAccess": false,
    "uploadTest": false,
    "downloadTest": false,
    "deleteTest": false
  }
}
```

## 🔍 **Troubleshooting Common Issues**

### **1. Configuration Issues**

#### **Missing Environment Variables**

```
❌ Configuration Validation - 2ms
   Error: R2_ACCOUNT_ID must be exactly 32 characters
```

**Solution**: Check your `.env` file and ensure all required variables are set:

```bash
R2_ACCOUNT_ID=your_32_character_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your-bucket-name
```

#### **Invalid Account ID**

```
❌ Configuration Validation - 1ms
   Error: R2_ACCOUNT_ID must be exactly 32 characters
```

**Solution**: Verify your Cloudflare account ID is exactly 32 characters long.

### **2. Bucket Access Issues**

#### **Bucket Not Found**

```
❌ Bucket Access - 150ms
   Error: The specified bucket does not exist
```

**Solution**:

1. Check if the bucket exists in your Cloudflare dashboard
2. Verify the bucket name is correct
3. Ensure the bucket is in the same account as your API credentials

#### **Access Denied**

```
❌ Bucket Access - 200ms
   Error: Access Denied
```

**Solution**:

1. Check your R2 API token permissions
2. Ensure the token has `Cloudflare R2:Edit` permission
3. Verify the token is not expired

### **3. File Operation Issues**

#### **Upload Failed**

```
❌ File Upload - 500ms
   Error: InvalidAccessKeyId
```

**Solution**:

1. Verify your `R2_ACCESS_KEY_ID` is correct
2. Check if the access key is active
3. Ensure the key has proper permissions

#### **Download Failed**

```
❌ File Download - 300ms
   Error: NoSuchKey
```

**Solution**: This usually means the upload test failed, check upload permissions first.

#### **Delete Failed**

```
❌ File Deletion - 250ms
   Error: AccessDenied
```

**Solution**: Check if your API token has delete permissions.

## 🛠️ **Manual Testing Steps**

### **Step 1: Verify Environment Variables**

```bash
# Check if all required variables are set
echo "R2_ACCOUNT_ID: ${R2_ACCOUNT_ID:0:8}..."
echo "R2_BUCKET_NAME: $R2_BUCKET_NAME"
echo "R2_ENDPOINT: $R2_ENDPOINT"
```

### **Step 2: Test Configuration**

```bash
# Run configuration validation
npm run test:r2-connection
```

### **Step 3: Test API Endpoints**

```bash
# Start the application
npm run start:dev

# Test health endpoint (replace with your JWT token)
curl -X GET "http://localhost:3000/r2-health/status" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### **Step 4: Test File Operations**

```bash
# Test file upload via API
curl -X POST "http://localhost:3000/r2-health/test" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## 📊 **Performance Benchmarks**

### **Expected Response Times**

- **Configuration Validation**: < 5ms
- **Bucket Access**: 50-200ms
- **File Upload**: 100-500ms (depending on file size)
- **File Download**: 50-300ms
- **File Deletion**: 50-200ms

### **Performance Issues**

If tests are taking longer than expected:

1. Check your internet connection
2. Verify R2 endpoint is accessible
3. Consider using a different R2 region
4. Check for network firewall issues

## 🔧 **Advanced Testing**

### **Test with Custom Files**

```typescript
// You can modify the test script to test with different file types
const testFiles = [
  { content: 'test', type: 'text/plain', size: 4 },
  { content: Buffer.from('test'), type: 'application/octet-stream', size: 4 },
  // Add more test cases as needed
];
```

### **Test Multiple Buckets**

```typescript
// Test different buckets
const buckets = [
  'southville-portal-images',
  'southville-portal-documents',
  'southville-portal-temp',
];
```

### **Load Testing**

```bash
# Test multiple concurrent connections
for i in {1..10}; do
  npm run test:r2-connection &
done
wait
```

## 📝 **Test Logs**

### **Successful Test Log**

```
🔧 R2 Connection Tester Initialized
📦 Bucket: southville-portal-files
🌐 Endpoint: https://your-account-id.r2.cloudflarestorage.com
────────────────────────────────────────────────────────────
🚀 Starting R2 Connection Tests...

✅ Configuration Validation - 2ms
✅ Bucket Access - 150ms
✅ File Upload - 300ms
✅ File Download - 200ms
✅ File Deletion - 100ms

────────────────────────────────────────────────────────────
📊 Test Summary:
✅ Successful: 5/5
❌ Failed: 0/5

🎉 All tests passed! R2 is properly configured and accessible.
You can now start your NestJS application.

📋 Detailed Results:
   ✅ Configuration Validation (2ms)
   ✅ Bucket Access (150ms)
   ✅ File Upload (300ms)
   ✅ File Download (200ms)
   ✅ File Deletion (100ms)
```

### **Failed Test Log**

```
🔧 R2 Connection Tester Initialized
📦 Bucket: southville-portal-files
🌐 Endpoint: https://your-account-id.r2.cloudflarestorage.com
────────────────────────────────────────────────────────────
🚀 Starting R2 Connection Tests...

❌ Configuration Validation - 1ms
   Error: R2_ACCOUNT_ID must be exactly 32 characters

────────────────────────────────────────────────────────────
📊 Test Summary:
✅ Successful: 0/5
❌ Failed: 5/5

⚠️  Some tests failed. Please check your R2 configuration.
Failed tests:
   - Configuration Validation: R2_ACCOUNT_ID must be exactly 32 characters
```

## 🎯 **Next Steps After Successful Testing**

1. **Start Your Application**: `npm run start:dev`
2. **Test API Endpoints**: Use Swagger UI at `http://localhost:3000/api`
3. **Integrate with Modules**: Start using R2StorageService in your modules
4. **Monitor Performance**: Check logs for any issues
5. **Set Up Monitoring**: Configure alerts for R2 operations

## 🆘 **Getting Help**

If you're still having issues:

1. **Check Cloudflare Dashboard**: Verify bucket and credentials
2. **Review Logs**: Check application logs for detailed error messages
3. **Test Network**: Ensure R2 endpoints are accessible
4. **Verify Permissions**: Check API token permissions
5. **Contact Support**: Reach out to Cloudflare support if needed

---

**Remember**: Always test your R2 connection before deploying to production!
