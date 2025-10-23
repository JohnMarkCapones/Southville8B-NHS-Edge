# R2 Multipart File Upload Solution

## 🎯 Problem Solved

**Issue**: File uploads worked for small files (12KB) but failed for large files (400KB+) with the error:

```
"Section IDs are required for section-specific modules"
```

**Root Cause**: Fastify multipart parsing was failing for large files, causing form fields to not be parsed correctly, leading to validation errors.

## 🔧 Solution Implemented

### 1. Enhanced R2 Configuration (`src/config/r2.config.ts`)

```typescript
export default registerAs('r2', () => ({
  // File Upload Configuration
  maxFileSize: parseInt(process.env.R2_MAX_FILE_SIZE || '10485760'), // 10MB default
  allowedMimeTypes: process.env.R2_ALLOWED_MIME_TYPES?.split(',') || [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],

  // Performance Configuration
  multipartThreshold: parseInt(
    process.env.R2_MULTIPART_THRESHOLD || '10485760',
  ), // 10MB
  multipartChunksize: parseInt(process.env.R2_MULTIPART_CHUNKSIZE || '5242880'), // 5MB
  maxConcurrency: parseInt(process.env.R2_MAX_CONCURRENCY || '3'),

  // Connection Configuration
  connectionTimeout: parseInt(process.env.R2_CONNECTION_TIMEOUT || '30000'), // 30 seconds
  requestTimeout: parseInt(process.env.R2_REQUEST_TIMEOUT || '60000'), // 60 seconds
  maxRetries: parseInt(process.env.R2_MAX_RETRIES || '3'),

  // Security Configuration
  enableVirusScanning: process.env.R2_ENABLE_VIRUS_SCANNING === 'true',
  enableContentValidation: process.env.R2_ENABLE_CONTENT_VALIDATION !== 'false',
}));
```

### 2. Robust Multipart Handling (`src/modules/modules.controller.ts`)

**BEFORE (Problematic)**:

```typescript
// Only gets first file, fails with large files
const data = await request.file();
const createModuleDto: CreateModuleDto = {
  title: data.fields.title?.value || '',
  isGlobal: data.fields.isGlobal?.value === 'true',
  // ... other fields
};
```

**AFTER (Robust)**:

```typescript
async create(@Req() request: any, @AuthUser() user: any): Promise<Module> {
  try {
    // Parse multipart data using Fastify
    // Collect all parts (both fields and file) properly
    const parts = request.parts();
    const fields: Record<string, any> = {};
    let fileData: any = null;
    let fileBuffer: Buffer | null = null;

    // Iterate through all parts to collect fields and file
    for await (const part of parts) {
      if (part.type === 'file') {
        // This is the file part - must consume the stream IMMEDIATELY
        const chunks: Buffer[] = [];
        for await (const chunk of part.file) {
          chunks.push(chunk);
        }
        fileBuffer = Buffer.concat(chunks);

        // Store file metadata
        fileData = {
          fieldname: part.fieldname,
          filename: part.filename,
          encoding: part.encoding,
          mimetype: part.mimetype,
        };
      } else {
        // This is a field part
        fields[part.fieldname] = part.value;
      }
    }

    if (!fileData || !fileBuffer) {
      throw new BadRequestException('No file uploaded');
    }

    // Extract form fields - handle both string and boolean values properly
    const createModuleDto: CreateModuleDto = {
      title: fields.title || '',
      description: fields.description,
      isGlobal: fields.isGlobal === 'true' || fields.isGlobal === true,
      subjectId: fields.subjectId,
      sectionIds: fields.sectionIds
        ? Array.isArray(fields.sectionIds)
          ? fields.sectionIds
          : [fields.sectionIds]
        : undefined,
    };

    // Create a file object compatible with the service
    const file: Express.Multer.File = {
      fieldname: fileData.fieldname,
      originalname: fileData.filename,
      encoding: fileData.encoding,
      mimetype: fileData.mimetype,
      size: fileBuffer.length,
      buffer: fileBuffer,
      stream: null as any,
      destination: '',
      filename: fileData.filename,
      path: '',
    };

    return this.modulesService.createWithFile(createModuleDto, file, user.id);
  } catch (error) {
    throw new BadRequestException(`Failed to create module: ${error.message}`);
  }
}
```

### 3. Fastify Multipart Configuration (`src/main.ts`)

```typescript
// Multipart support for file uploads
await app.register(multipart, {
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});
```

## 🔑 Key Improvements

### 1. **Proper Multipart Parsing**

- **Before**: Used `request.file()` - only gets first file, fails with large files
- **After**: Used `request.parts()` - gets ALL parts (fields + files)

### 2. **Immediate Stream Consumption**

- **Before**: Stream could timeout during processing
- **After**: File stream consumed immediately into buffer

### 3. **Robust Field Extraction**

- **Before**: Fields not parsed correctly for large files
- **After**: All fields properly extracted regardless of file size

### 4. **Better Boolean Handling**

- **Before**: Simple string comparison `=== 'true'`
- **After**: Handles both string and boolean: `fields.isGlobal === 'true' || fields.isGlobal === true`

### 5. **Enhanced Configuration**

- Added timeout configurations
- Increased file size limits
- Added multipart chunking settings
- Enhanced error handling

### 6. **TypeScript Type Safety**

- **Before**: `let fileBuffer: Buffer = null;` (TypeScript error)
- **After**: `let fileBuffer: Buffer | null = null;` (Proper nullable type)

## 🎯 Why This Solution Works

### **Technical Deep Dive**

The key insight is in the **immediate stream consumption** approach:

```typescript
// This is the file part - must consume the stream IMMEDIATELY
const chunks: Buffer[] = [];
for await (const chunk of part.file) {
  chunks.push(chunk);
}
fileBuffer = Buffer.concat(chunks);

// Store file metadata
fileData = {
  fieldname: part.fieldname,
  filename: part.filename,
  encoding: part.encoding,
  mimetype: part.mimetype,
};
```

### **Why This Works**

1. ✅ **Immediate consumption**: Stream chunks are read immediately as we encounter the file part
2. ✅ **No `.toBuffer()` call**: We manually read chunks, no need for the non-existent method
3. ✅ **No hanging**: Request completes because stream is fully consumed
4. ✅ **All fields available**: Works regardless of field order in the multipart request
5. ✅ **Works for any file size**: Handles both 40kb and 400kb+ files

### **Critical Differences from Previous Approach**

| Aspect                | Previous (Broken)             | Current (Working)        |
| --------------------- | ----------------------------- | ------------------------ |
| **Method**            | `request.file()`              | `request.parts()`        |
| **Stream Handling**   | `.toBuffer()` (doesn't exist) | Manual chunk reading     |
| **Field Parsing**     | `data.fields.title?.value`    | `fields[part.fieldname]` |
| **File Size Support** | Small files only              | All file sizes           |
| **TypeScript**        | Type errors                   | Proper nullable types    |

## 🚀 Why This Works for Both Small and Large Files

### **Small Files (12KB)**

- Processed quickly
- No timeout issues
- Fields parsed correctly

### **Large Files (400KB+)**

- Stream consumed immediately
- Prevents multipart parsing timeouts
- All fields properly extracted
- File buffer created successfully

### **All Files**

- Robust error handling
- Proper validation
- Consistent behavior

## 📋 Testing Results

### ✅ **Small File Test (12KB)**

```bash
curl -X 'POST' \
  'http://localhost:3000/api/v1/modules' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@small-file.txt' \
  -F 'title=Test Module' \
  -F 'isGlobal=true' \
  -F 'subjectId=635fe7a9-bda5-4c80-91a8-8c89cf01ef47'
```

**Result**: ✅ Success - Module created successfully

### ✅ **Large File Test (400KB)**

```bash
curl -X 'POST' \
  'http://localhost:3000/api/v1/modules' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@large-file.docx' \
  -F 'title=Large Module' \
  -F 'isGlobal=true' \
  -F 'subjectId=635fe7a9-bda5-4c80-91a8-8c89cf01ef47'
```

**Result**: ✅ Success - Module created successfully

## 🛠️ Environment Variables

Add these to your `.env` file for optimal configuration:

```env
# R2 File Upload Configuration
R2_MAX_FILE_SIZE=52428800  # 50MB
R2_MULTIPART_THRESHOLD=10485760  # 10MB
R2_MULTIPART_CHUNKSIZE=5242880   # 5MB
R2_MAX_CONCURRENCY=3

# R2 Connection Configuration
R2_CONNECTION_TIMEOUT=30000  # 30 seconds
R2_REQUEST_TIMEOUT=60000     # 60 seconds
R2_MAX_RETRIES=3

# R2 Security Configuration
R2_ENABLE_VIRUS_SCANNING=false
R2_ENABLE_CONTENT_VALIDATION=true

# R2 Allowed MIME Types
R2_ALLOWED_MIME_TYPES=application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/webp,text/plain
```

## 🎯 Key Takeaways

1. **Use `request.parts()`** instead of `request.file()` for robust multipart handling
2. **Consume file streams immediately** to prevent timeout issues
3. **Iterate through ALL parts** to ensure no data is lost
4. **Handle both string and boolean values** for form fields
5. **Configure proper timeouts** for large file uploads
6. **Test with both small and large files** to ensure reliability

## 🔧 Troubleshooting

### If uploads still fail:

1. **Check file size limits**:
   - Fastify multipart: 50MB
   - R2 config: 10MB (configurable)

2. **Verify MIME types**:
   - Check if file type is in `allowedMimeTypes`

3. **Check timeout settings**:
   - Connection timeout: 30s
   - Request timeout: 60s

4. **Monitor logs**:
   - Look for R2 upload errors
   - Check multipart parsing logs

### TypeScript Compilation Errors

If you encounter TypeScript errors like:

```
error TS2322: Type 'null' is not assignable to type 'Buffer<ArrayBufferLike>'.
```

**Fix**: Change the type declaration to allow null:

```typescript
// ❌ Wrong
let fileBuffer: Buffer = null;

// ✅ Correct
let fileBuffer: Buffer | null = null;
```

This needs to be applied in both the `create()` and `uploadModule()` methods.

### Testing Checklist

**Before testing, ensure:**

- [ ] TypeScript compiles without errors
- [ ] Application starts successfully
- [ ] R2 configuration is correct
- [ ] Database connection is working

**Test with:**

- [ ] Small file (40-50KB) - should work quickly
- [ ] Large file (400KB+) - should work without hanging
- [ ] Different file types (PDF, DOCX, images)
- [ ] Both global and section-specific modules

## 📚 Related Files

- `src/config/r2.config.ts` - R2 configuration
- `src/modules/modules.controller.ts` - Multipart handling
- `src/storage/r2-storage/r2-storage.service.ts` - R2 upload service
- `src/main.ts` - Fastify multipart configuration

---

**Solution implemented**: ✅ **Working for both small and large files**
**Date**: October 16, 2025
**Status**: Production Ready
