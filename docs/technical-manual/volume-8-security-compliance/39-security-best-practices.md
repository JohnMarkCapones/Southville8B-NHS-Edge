# Chapter 39: Security Best Practices & Guidelines

## Overview

This chapter provides comprehensive security best practices, coding guidelines, and operational procedures for developing and maintaining secure applications within the Southville 8B NHS Edge platform. Following these practices ensures consistent security posture and defense against common vulnerabilities.

## Table of Contents

1. [Secure Coding Guidelines](#secure-coding-guidelines)
2. [OWASP Top 10 Mitigation](#owasp-top-10-mitigation)
3. [Authentication Best Practices](#authentication-best-practices)
4. [Authorization Best Practices](#authorization-best-practices)
5. [Data Validation & Sanitization](#data-validation--sanitization)
6. [Secure API Design](#secure-api-design)
7. [Secure Database Practices](#secure-database-practices)
8. [Secure File Handling](#secure-file-handling)
9. [Password Policies](#password-policies)
10. [Session Management](#session-management)
11. [Error Handling](#error-handling)
12. [Security Testing](#security-testing)
13. [Code Review Checklist](#code-review-checklist)
14. [Dependency Security](#dependency-security)
15. [Security Training](#security-training)

---

## Secure Coding Guidelines

### General Principles

#### 1. Input Validation
**Rule:** Validate all user input on both client and server

```typescript
// ❌ BAD: No validation
function createUser(email: string, name: string) {
  return db.users.insert({ email, name });
}

// ✅ GOOD: Schema validation
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(100).regex(/^[a-zA-Z\s]+$/),
});

function createUser(data: unknown) {
  const validated = createUserSchema.parse(data);
  return db.users.insert(validated);
}
```

#### 2. Output Encoding
**Rule:** Encode all user-generated content before display

```typescript
// ❌ BAD: Direct HTML insertion (XSS risk)
<div dangerouslySetInnerHTML={{ __html: userComment }} />

// ✅ GOOD: Escaped text
<div>{userComment}</div>

// ✅ GOOD: Sanitized HTML (when HTML needed)
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userComment) }} />
```

#### 3. Least Privilege
**Rule:** Grant minimum necessary permissions

```typescript
// ❌ BAD: Overly permissive
if (user.isAuthenticated) {
  allowAccess();
}

// ✅ GOOD: Role-specific permissions
if (user.role === 'ADMIN' && user.hasPermission('users:delete')) {
  allowAccess();
}
```

#### 4. Fail Securely
**Rule:** Default to deny access on errors

```typescript
// ❌ BAD: Allows access on error
function checkPermission(userId: string, resource: string) {
  try {
    return db.permissions.check(userId, resource);
  } catch (error) {
    return true; // DANGEROUS!
  }
}

// ✅ GOOD: Denies access on error
function checkPermission(userId: string, resource: string) {
  try {
    return db.permissions.check(userId, resource);
  } catch (error) {
    logger.error('Permission check failed', error);
    return false; // Safe default
  }
}
```

### TypeScript-Specific Best Practices

#### 1. Strict Type Checking

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,                      // Enable all strict checks
    "noImplicitAny": true,               // No implicit any
    "strictNullChecks": true,            // Null/undefined checks
    "strictFunctionTypes": true,         // Function type checks
    "strictPropertyInitialization": true, // Class property init
    "noImplicitThis": true,              // This binding checks
    "alwaysStrict": true                 // Use strict mode
  }
}
```

#### 2. Type Guards for User Input

```typescript
// ❌ BAD: Unsafe type assertion
const userId = req.body.userId as string;

// ✅ GOOD: Type guard with validation
function isValidUserId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9-]{36}$/i.test(value);
}

const userId = req.body.userId;
if (!isValidUserId(userId)) {
  throw new BadRequestException('Invalid user ID format');
}
```

#### 3. Readonly for Immutable Data

```typescript
// ❌ BAD: Mutable sensitive data
interface User {
  id: string;
  role: string;
}

// ✅ GOOD: Immutable sensitive data
interface User {
  readonly id: string;
  readonly role: string;
}
```

### React-Specific Security

#### 1. Prevent XSS in JSX

```typescript
// ❌ BAD: Unsafe prop interpolation
<a href={userSuppliedUrl}>Click here</a>

// ✅ GOOD: Validated and sanitized URL
import { sanitizeUrl } from '@/lib/security';

const safeUrl = sanitizeUrl(userSuppliedUrl);
<a href={safeUrl}>Click here</a>
```

#### 2. Secure Event Handlers

```typescript
// ❌ BAD: Inline eval (CSP violation)
<button onClick={eval(userCode)}>Execute</button>

// ✅ GOOD: Controlled event handler
<button onClick={handleClick}>Execute</button>

function handleClick() {
  // Controlled, validated logic
}
```

#### 3. Safe useEffect Dependencies

```typescript
// ❌ BAD: External input in effect without validation
useEffect(() => {
  fetch(`/api/users/${userInput}`);
}, [userInput]);

// ✅ GOOD: Validated input
useEffect(() => {
  if (isValidUserId(userInput)) {
    fetch(`/api/users/${userInput}`);
  }
}, [userInput]);
```

---

## OWASP Top 10 Mitigation

### A01:2021 - Broken Access Control

**Mitigation:**

```typescript
// 1. Implement proper authorization checks
@UseGuards(SupabaseAuthGuard, RolesGuard, PoliciesGuard)
@Roles(UserRole.TEACHER)
@Policies({ domainParam: 'sectionId', permissionKey: 'section:edit' })
async updateSection(
  @Param('sectionId') sectionId: string,
  @AuthUser() user: SupabaseUser,
  @Body() updateDto: UpdateSectionDto
) {
  // User has been verified to have permission
  return this.sectionsService.update(sectionId, updateDto);
}

// 2. Verify object-level authorization
async getStudentGrades(studentId: string, requestingUserId: string) {
  // Check if requesting user can view these grades
  const canView = await this.authService.canViewStudentGrades(
    requestingUserId,
    studentId
  );

  if (!canView) {
    throw new ForbiddenException('Cannot view these grades');
  }

  return this.gradesService.getByStudentId(studentId);
}

// 3. Use RLS policies as final defense layer
-- Students can only view their own grades
CREATE POLICY "Students view own grades"
ON grades FOR SELECT
USING (auth.uid() = student_id);
```

**Best Practices:**
- ✅ Implement authorization on every endpoint
- ✅ Use role-based AND resource-based access control
- ✅ Leverage RLS as defense-in-depth
- ✅ Log all authorization failures
- ❌ Don't rely solely on client-side authorization

### A02:2021 - Cryptographic Failures

**Mitigation:**

```typescript
// 1. Use strong encryption for sensitive data
import * as crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // 32 bytes
const ALGORITHM = 'aes-256-gcm';

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decrypt(encrypted: string): string {
  const [ivHex, authTagHex, encryptedData] = encrypted.split(':');

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );

  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// 2. Hash passwords securely (handled by Supabase Auth)
// Never store plaintext passwords
// Never use weak hashing (MD5, SHA1)

// 3. Use HTTPS for all communications
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  });
}
```

**Best Practices:**
- ✅ Use TLS 1.3 for data in transit
- ✅ Use AES-256 for data at rest
- ✅ Store secrets in environment variables
- ✅ Use strong key derivation (bcrypt, Argon2)
- ❌ Don't roll your own crypto
- ❌ Don't store encryption keys in code

### A03:2021 - Injection

**Mitigation:**

```typescript
// 1. SQL Injection Prevention - Use parameterized queries
// ❌ BAD: String concatenation
async function getUser(email: string) {
  return db.query(`SELECT * FROM users WHERE email = '${email}'`);
  // Vulnerable to: ' OR '1'='1
}

// ✅ GOOD: Parameterized query
async function getUser(email: string) {
  return db.query('SELECT * FROM users WHERE email = $1', [email]);
}

// ✅ BETTER: Use ORM
async function getUser(email: string) {
  return supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
}

// 2. Command Injection Prevention
// ❌ BAD: Unsafe exec
const { exec } = require('child_process');
exec(`convert ${userFilename} output.png`); // Dangerous!

// ✅ GOOD: Use libraries instead of shell commands
import sharp from 'sharp';
await sharp(userFilename).toFile('output.png');

// 3. NoSQL Injection Prevention
// ❌ BAD: Direct object insertion
db.collection('users').find({ username: req.body.username });
// Vulnerable to: { $ne: null }

// ✅ GOOD: Validate and sanitize
const usernameSchema = z.string().min(1).max(50).regex(/^[a-zA-Z0-9_]+$/);
const username = usernameSchema.parse(req.body.username);
db.collection('users').find({ username });
```

**Best Practices:**
- ✅ Use parameterized queries/ORMs
- ✅ Validate and sanitize all input
- ✅ Use prepared statements
- ✅ Implement input whitelisting
- ❌ Never concatenate user input into queries
- ❌ Don't trust client-side validation alone

### A04:2021 - Insecure Design

**Mitigation:**

```typescript
// 1. Implement rate limiting on sensitive operations
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/api/auth/login', loginLimiter, loginController);

// 2. Implement account lockout after failed attempts
async function handleFailedLogin(email: string) {
  const attempts = await redis.incr(`login_attempts:${email}`);
  await redis.expire(`login_attempts:${email}`, 900); // 15 minutes

  if (attempts >= 5) {
    await lockAccount(email, 3600); // Lock for 1 hour
    await sendSecurityAlert(email, 'Account locked due to failed login attempts');
  }
}

// 3. Implement secure password reset flow
async function requestPasswordReset(email: string) {
  // Generate cryptographically secure token
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Store hashed token with expiry
  await db.passwordResetTokens.insert({
    email,
    token_hash: hashedToken,
    expires_at: new Date(Date.now() + 3600000), // 1 hour
    used: false,
  });

  // Send token via email (not in URL for security)
  await sendPasswordResetEmail(email, token);

  // Always return same message to prevent email enumeration
  return 'If this email exists, a password reset link has been sent.';
}
```

**Best Practices:**
- ✅ Design security from the start
- ✅ Implement defense in depth
- ✅ Use secure defaults
- ✅ Fail securely
- ✅ Follow principle of least privilege

### A05:2021 - Security Misconfiguration

**Mitigation:**

```typescript
// 1. Disable debug mode in production
if (process.env.NODE_ENV === 'production') {
  app.set('env', 'production');
  app.disable('x-powered-by'); // Remove Express header
}

// 2. Set secure headers
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.supabase.co"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// 3. Configure CORS properly
import cors from 'cors';

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
};

app.use(cors(corsOptions));

// 4. Remove unnecessary features
app.use(express.json({ limit: '10mb' })); // Prevent large payload DoS
app.disable('x-powered-by'); // Don't advertise framework
```

**Best Practices:**
- ✅ Use security headers (CSP, HSTS, etc.)
- ✅ Disable unnecessary features
- ✅ Keep frameworks/libraries updated
- ✅ Use secure defaults
- ❌ Don't expose stack traces in production
- ❌ Don't leave default credentials

### A06:2021 - Vulnerable and Outdated Components

**Mitigation:**

```bash
# 1. Regularly audit dependencies
npm audit
npm audit fix

# 2. Use dependency scanning in CI/CD
# .github/workflows/security.yml
name: Security Audit
on: [push, pull_request]
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run npm audit
        run: npm audit --audit-level=moderate

# 3. Keep dependencies updated
npm update
npm outdated

# 4. Use lock files
# Always commit package-lock.json or yarn.lock
```

**package.json Security Scripts:**

```json
{
  "scripts": {
    "audit": "npm audit",
    "audit:fix": "npm audit fix",
    "outdated": "npm outdated",
    "update:minor": "npm update",
    "update:major": "npx npm-check-updates -u"
  }
}
```

**Best Practices:**
- ✅ Audit dependencies regularly
- ✅ Use automated security scanning
- ✅ Keep dependencies updated
- ✅ Review security advisories
- ❌ Don't use deprecated packages
- ❌ Don't ignore security warnings

### A07:2021 - Identification and Authentication Failures

**Mitigation:**

```typescript
// 1. Implement strong password requirements
const passwordSchema = z.string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain uppercase letter')
  .regex(/[a-z]/, 'Password must contain lowercase letter')
  .regex(/[0-9]/, 'Password must contain number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain special character');

// 2. Implement session timeout
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

function checkSessionExpiry(lastActivity: number) {
  if (Date.now() - lastActivity > SESSION_TIMEOUT) {
    throw new UnauthorizedException('Session expired');
  }
}

// 3. Use secure session storage
const sessionConfig = {
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only
    httpOnly: true, // No client-side access
    sameSite: 'strict', // CSRF protection
    maxAge: 3600000, // 1 hour
  },
};

// 4. Implement account lockout
async function checkAccountLockout(userId: string) {
  const lockout = await redis.get(`lockout:${userId}`);
  if (lockout) {
    const unlockTime = new Date(parseInt(lockout));
    throw new ForbiddenException(
      `Account locked until ${unlockTime.toISOString()}`
    );
  }
}

// 5. Log authentication events
async function logAuthEvent(userId: string, event: 'login' | 'logout' | 'failed_login') {
  await db.authEvents.insert({
    user_id: userId,
    event_type: event,
    ip_address: req.ip,
    user_agent: req.headers['user-agent'],
    timestamp: new Date(),
  });
}
```

**Best Practices:**
- ✅ Implement multi-factor authentication
- ✅ Use strong password policies
- ✅ Implement session timeout
- ✅ Use secure session storage
- ✅ Log authentication events
- ❌ Don't expose user enumeration
- ❌ Don't store passwords in plaintext

### A08:2021 - Software and Data Integrity Failures

**Mitigation:**

```typescript
// 1. Verify file integrity before processing
import crypto from 'crypto';

async function verifyFileIntegrity(file: Buffer, expectedHash: string): Promise<boolean> {
  const hash = crypto.createHash('sha256').update(file).digest('hex');
  return hash === expectedHash;
}

// 2. Use Subresource Integrity (SRI) for CDN resources
<script
  src="https://cdn.example.com/library.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
  crossOrigin="anonymous"
></script>

// 3. Validate data before deserialization
function safeJSONParse<T>(json: string, schema: z.ZodSchema<T>): T {
  try {
    const parsed = JSON.parse(json);
    return schema.parse(parsed);
  } catch (error) {
    throw new BadRequestException('Invalid JSON data');
  }
}

// 4. Sign critical data
function signData(data: unknown): string {
  const signature = crypto
    .createHmac('sha256', process.env.SIGNING_KEY!)
    .update(JSON.stringify(data))
    .digest('hex');

  return `${JSON.stringify(data)}.${signature}`;
}

function verifySignedData(signedData: string): unknown {
  const [dataStr, signature] = signedData.split('.');

  const expectedSignature = crypto
    .createHmac('sha256', process.env.SIGNING_KEY!)
    .update(dataStr)
    .digest('hex');

  if (signature !== expectedSignature) {
    throw new UnauthorizedException('Invalid signature');
  }

  return JSON.parse(dataStr);
}
```

**Best Practices:**
- ✅ Verify integrity of external resources
- ✅ Use digital signatures for critical data
- ✅ Validate before deserialization
- ✅ Use code signing
- ❌ Don't trust unverified data
- ❌ Don't use insecure deserialization

### A09:2021 - Security Logging and Monitoring Failures

**Mitigation:**

```typescript
// 1. Implement comprehensive logging
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'southville-api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'security.log', level: 'warn' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// 2. Log security events
function logSecurityEvent(event: {
  type: 'AUTH_FAILURE' | 'PERMISSION_DENIED' | 'SUSPICIOUS_ACTIVITY';
  userId?: string;
  ipAddress: string;
  details: unknown;
}) {
  logger.warn('Security event', {
    eventType: event.type,
    userId: event.userId,
    ipAddress: event.ipAddress,
    timestamp: new Date().toISOString(),
    details: event.details,
  });

  // Alert on critical events
  if (isCriticalEvent(event.type)) {
    sendSecurityAlert(event);
  }
}

// 3. Implement log monitoring
async function detectAnomalies() {
  // Check for brute force attempts
  const recentFailures = await db.authEvents
    .where('event_type', 'failed_login')
    .where('created_at', '>', Date.now() - 15 * 60 * 1000)
    .groupBy('ip_address')
    .having('count', '>', 5);

  for (const { ip_address } of recentFailures) {
    await blockIpAddress(ip_address, '1 hour', 'Brute force detected');
  }
}

// 4. Implement audit trails
async function createAuditLog(action: {
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: unknown;
}) {
  await db.auditLog.insert({
    user_id: action.userId,
    action: action.action,
    resource: action.resource,
    resource_id: action.resourceId,
    old_value: action.changes?.old,
    new_value: action.changes?.new,
    ip_address: req.ip,
    user_agent: req.headers['user-agent'],
    timestamp: new Date(),
  });
}
```

**Best Practices:**
- ✅ Log all security-relevant events
- ✅ Include sufficient context in logs
- ✅ Monitor logs in real-time
- ✅ Implement alerting for critical events
- ✅ Protect log integrity
- ❌ Don't log sensitive data (passwords, tokens)
- ❌ Don't ignore log analysis

### A10:2021 - Server-Side Request Forgery (SSRF)

**Mitigation:**

```typescript
// 1. Validate and whitelist URLs
const ALLOWED_HOSTS = ['api.github.com', 'api.example.com'];

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    // Only allow HTTPS
    if (parsed.protocol !== 'https:') {
      return false;
    }

    // Check against whitelist
    if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
      return false;
    }

    // Block private IP ranges
    if (isPrivateIP(parsed.hostname)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

function isPrivateIP(hostname: string): boolean {
  const privateRanges = [
    /^10\./,
    /^192\.168\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^127\./,
    /^localhost$/,
  ];

  return privateRanges.some(range => range.test(hostname));
}

// 2. Sanitize user-controlled URLs
async function fetchExternalResource(userUrl: string) {
  // Validate URL
  if (!isAllowedUrl(userUrl)) {
    throw new BadRequestException('Invalid or disallowed URL');
  }

  // Use timeout to prevent hanging
  const response = await fetch(userUrl, {
    timeout: 5000,
    signal: AbortSignal.timeout(5000),
  });

  return response;
}

// 3. Disable redirects for user-controlled URLs
async function fetchWithoutRedirects(url: string) {
  const response = await fetch(url, {
    redirect: 'manual', // Don't follow redirects
  });

  if (response.status >= 300 && response.status < 400) {
    throw new BadRequestException('Redirects not allowed');
  }

  return response;
}
```

**Best Practices:**
- ✅ Whitelist allowed domains
- ✅ Validate all URLs
- ✅ Block private IP ranges
- ✅ Disable or validate redirects
- ❌ Don't trust user-provided URLs
- ❌ Don't allow arbitrary external requests

---

## Authentication Best Practices

### 1. Password Security

```typescript
// Minimum password requirements
const PASSWORD_REQUIREMENTS = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxAge: 90, // days
  preventReuse: 5, // last N passwords
};

// Password validation
const passwordSchema = z.string()
  .min(PASSWORD_REQUIREMENTS.minLength)
  .regex(/[A-Z]/, 'Must contain uppercase')
  .regex(/[a-z]/, 'Must contain lowercase')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[^A-Za-z0-9]/, 'Must contain special character')
  .refine(
    (password) => !commonPasswords.includes(password),
    'Password is too common'
  );

// Check password history
async function checkPasswordHistory(userId: string, newPassword: string) {
  const passwordHistory = await db.passwordHistory
    .where('user_id', userId)
    .orderBy('created_at', 'desc')
    .limit(PASSWORD_REQUIREMENTS.preventReuse);

  for (const { password_hash } of passwordHistory) {
    const matches = await bcrypt.compare(newPassword, password_hash);
    if (matches) {
      throw new BadRequestException(
        `Cannot reuse last ${PASSWORD_REQUIREMENTS.preventReuse} passwords`
      );
    }
  }
}
```

### 2. Multi-Factor Authentication (MFA)

```typescript
// Generate TOTP secret
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

async function setupMFA(userId: string, email: string) {
  const secret = speakeasy.generateSecret({
    name: `Southville 8B (${email})`,
    issuer: 'Southville 8B NHS',
  });

  // Store secret (encrypted)
  await db.mfaSecrets.insert({
    user_id: userId,
    secret: encrypt(secret.base32),
    enabled: false, // Enable after verification
  });

  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

  return {
    secret: secret.base32,
    qrCode: qrCodeUrl,
  };
}

// Verify MFA token
async function verifyMFA(userId: string, token: string): Promise<boolean> {
  const { secret } = await db.mfaSecrets.where('user_id', userId).first();

  if (!secret) {
    throw new BadRequestException('MFA not set up');
  }

  const decryptedSecret = decrypt(secret);

  return speakeasy.totp.verify({
    secret: decryptedSecret,
    encoding: 'base32',
    token,
    window: 2, // Allow 2 time steps (±1 minute)
  });
}

// Enable MFA after verification
async function enableMFA(userId: string, verificationToken: string) {
  const isValid = await verifyMFA(userId, verificationToken);

  if (!isValid) {
    throw new BadRequestException('Invalid verification code');
  }

  // Generate backup codes
  const backupCodes = Array.from({ length: 10 }, () =>
    crypto.randomBytes(4).toString('hex')
  );

  // Store hashed backup codes
  await db.mfaBackupCodes.insert(
    backupCodes.map(code => ({
      user_id: userId,
      code_hash: hashBackupCode(code),
      used: false,
    }))
  );

  // Enable MFA
  await db.mfaSecrets
    .where('user_id', userId)
    .update({ enabled: true });

  return { backupCodes };
}
```

### 3. Session Security

```typescript
// Session configuration
const SESSION_CONFIG = {
  duration: 30 * 60 * 1000,        // 30 minutes
  slidingExpiration: true,          // Extend on activity
  absoluteTimeout: 8 * 60 * 60 * 1000, // 8 hours max
  requireReauth: 60 * 60 * 1000,   // Require reauth for sensitive ops after 1 hour
};

// Check session validity
async function validateSession(sessionId: string) {
  const session = await redis.get(`session:${sessionId}`);

  if (!session) {
    throw new UnauthorizedException('Invalid session');
  }

  const sessionData = JSON.parse(session);

  // Check absolute timeout
  if (Date.now() - sessionData.createdAt > SESSION_CONFIG.absoluteTimeout) {
    await invalidateSession(sessionId);
    throw new UnauthorizedException('Session expired');
  }

  // Check idle timeout
  if (Date.now() - sessionData.lastActivity > SESSION_CONFIG.duration) {
    await invalidateSession(sessionId);
    throw new UnauthorizedException('Session timed out');
  }

  // Sliding expiration
  if (SESSION_CONFIG.slidingExpiration) {
    sessionData.lastActivity = Date.now();
    await redis.set(`session:${sessionId}`, JSON.stringify(sessionData),
      'EX', SESSION_CONFIG.duration / 1000);
  }

  return sessionData;
}

// Check if reauthentication required
function requiresReauth(session: SessionData, action: string): boolean {
  const sensitiveActions = [
    'change_password',
    'update_email',
    'delete_account',
    'transfer_funds',
  ];

  if (!sensitiveActions.includes(action)) {
    return false;
  }

  const timeSinceAuth = Date.now() - session.lastAuthentication;
  return timeSinceAuth > SESSION_CONFIG.requireReauth;
}
```

---

## Authorization Best Practices

### 1. Principle of Least Privilege

```typescript
// Define granular permissions
const PERMISSIONS = {
  // Student permissions
  'student:view_own_grades': 'View own grades',
  'student:submit_assignment': 'Submit assignments',
  'student:take_quiz': 'Take quizzes',

  // Teacher permissions
  'teacher:view_section_grades': 'View section grades',
  'teacher:create_quiz': 'Create quizzes',
  'teacher:grade_assignments': 'Grade assignments',

  // Admin permissions
  'admin:manage_users': 'Manage all users',
  'admin:view_all_data': 'View all data',
  'admin:configure_system': 'Configure system',
};

// Assign minimal permissions
async function assignRolePermissions(userId: string, role: string) {
  const rolePermissions = {
    Student: [
      'student:view_own_grades',
      'student:submit_assignment',
      'student:take_quiz',
    ],
    Teacher: [
      'student:view_own_grades', // Can view as student
      'teacher:view_section_grades',
      'teacher:create_quiz',
      'teacher:grade_assignments',
    ],
    Admin: [
      ...Object.keys(PERMISSIONS), // All permissions
    ],
  };

  const permissions = rolePermissions[role] || [];

  await db.userPermissions.insert(
    permissions.map(permission => ({
      user_id: userId,
      permission,
    }))
  );
}
```

### 2. Resource-Level Authorization

```typescript
// Check object-level permissions
async function canAccessResource(
  userId: string,
  resourceType: string,
  resourceId: string,
  action: string
): Promise<boolean> {
  // Get user role
  const user = await db.users.where('id', userId).first();

  // Admins can access everything
  if (user.role === 'Admin') {
    return true;
  }

  // Resource-specific checks
  switch (resourceType) {
    case 'grades':
      return await canAccessGrades(userId, resourceId, action);
    case 'sections':
      return await canAccessSection(userId, resourceId, action);
    case 'quizzes':
      return await canAccessQuiz(userId, resourceId, action);
    default:
      return false;
  }
}

async function canAccessGrades(
  userId: string,
  gradeId: string,
  action: string
): Promise<boolean> {
  const grade = await db.grades.where('id', gradeId).first();

  // Students can view own grades
  if (action === 'view' && grade.student_id === userId) {
    return true;
  }

  // Teachers can view grades for their sections
  if (action === 'view' || action === 'edit') {
    const isTeacher = await db.sections
      .join('students', 'students.section_id', 'sections.id')
      .join('teachers', 'teachers.id', 'sections.teacher_id')
      .where('teachers.user_id', userId)
      .where('students.id', grade.student_id)
      .exists();

    return isTeacher;
  }

  return false;
}
```

### 3. Vertical and Horizontal Privilege Escalation Prevention

```typescript
// Prevent vertical escalation
async function updateUserRole(
  adminId: string,
  targetUserId: string,
  newRole: string
) {
  const admin = await db.users.where('id', adminId).first();
  const target = await db.users.where('id', targetUserId).first();

  // Prevent non-admins from changing roles
  if (admin.role !== 'Admin' && admin.role !== 'SuperAdmin') {
    throw new ForbiddenException('Only admins can change roles');
  }

  // Prevent admins from creating superadmins
  if (admin.role === 'Admin' && newRole === 'SuperAdmin') {
    throw new ForbiddenException('Cannot create superadmin');
  }

  // Prevent users from elevating their own privileges
  if (adminId === targetUserId && newRole !== admin.role) {
    throw new ForbiddenException('Cannot change own role');
  }

  await db.users.where('id', targetUserId).update({ role: newRole });
}

// Prevent horizontal escalation
async function viewStudentGrades(
  requestingUserId: string,
  targetStudentId: string
) {
  const requester = await db.users.where('id', requestingUserId).first();

  // Students can only view own grades
  if (requester.role === 'Student' && requestingUserId !== targetStudentId) {
    throw new ForbiddenException('Cannot view other students\' grades');
  }

  // Teachers can only view grades for their sections
  if (requester.role === 'Teacher') {
    const hasAccess = await db.sections
      .join('students', 'students.section_id', 'sections.id')
      .join('teachers', 'teachers.id', 'sections.teacher_id')
      .where('teachers.user_id', requestingUserId)
      .where('students.user_id', targetStudentId)
      .exists();

    if (!hasAccess) {
      throw new ForbiddenException('Cannot view grades for students not in your section');
    }
  }

  return db.grades.where('student_id', targetStudentId).get();
}
```

---

## Data Validation & Sanitization

### 1. Input Validation with Zod

```typescript
// Define strict schemas
import { z } from 'zod';

// User creation schema
const createUserSchema = z.object({
  email: z.string()
    .email('Invalid email')
    .max(255, 'Email too long')
    .transform(email => email.toLowerCase().trim()),

  fullName: z.string()
    .min(1, 'Name required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters')
    .transform(name => name.trim()),

  role: z.enum(['Student', 'Teacher', 'Admin', 'SuperAdmin']),

  birthday: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .refine(
      (date) => {
        const birthday = new Date(date);
        const age = (Date.now() - birthday.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
        return age >= 5 && age <= 100;
      },
      'Invalid age'
    ),

  phoneNumber: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
    .optional(),
});

// Use in endpoint
async function createUser(req: Request) {
  // Validate and sanitize
  const validatedData = createUserSchema.parse(req.body);

  // Now safe to use
  return db.users.insert(validatedData);
}
```

### 2. Output Encoding

```typescript
// HTML encoding for display
import DOMPurify from 'isomorphic-dompurify';

function displayUserContent(content: string, allowHtml: boolean = false) {
  if (allowHtml) {
    // Sanitize HTML
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['href', 'title'],
    });
  } else {
    // Escape HTML
    return escapeHtml(content);
  }
}

// JSON encoding
function jsonResponse(data: unknown) {
  // JSON.stringify automatically escapes special characters
  return JSON.stringify(data);
}

// URL encoding
function buildUrl(base: string, params: Record<string, string>) {
  const url = new URL(base);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value); // Automatically URL-encoded
  });
  return url.toString();
}
```

### 3. Contextual Sanitization

```typescript
// Different contexts require different sanitization
function sanitizeForContext(input: string, context: 'html' | 'url' | 'sql' | 'filename') {
  switch (context) {
    case 'html':
      return escapeHtml(input);

    case 'url':
      return encodeURIComponent(input);

    case 'sql':
      // Use parameterized queries instead, but as extra safety:
      return input.replace(/['";\\]/g, '');

    case 'filename':
      return sanitizeFilename(input);

    default:
      return input;
  }
}
```

---

## Secure API Design

### 1. RESTful API Security

```typescript
// Secure endpoint design
@Controller('api/v1/students')
@UseGuards(SupabaseAuthGuard)
export class StudentsController {
  // GET /api/v1/students - List (with pagination)
  @Get()
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  async list(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @AuthUser() user: SupabaseUser
  ) {
    // Limit result size
    const safeLimit = Math.min(limit, 100);

    // Filter based on permissions
    if (user.role === UserRole.TEACHER) {
      return this.studentsService.listByTeacher(user.id, page, safeLimit);
    }

    return this.studentsService.listAll(page, safeLimit);
  }

  // GET /api/v1/students/:id - Get single
  @Get(':id')
  @Policies({ domainParam: 'id', permissionKey: 'student:read' })
  async getOne(@Param('id') id: string) {
    return this.studentsService.findById(id);
  }

  // POST /api/v1/students - Create
  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() createDto: CreateStudentDto) {
    return this.studentsService.create(createDto);
  }

  // PATCH /api/v1/students/:id - Update
  @Patch(':id')
  @Policies({ domainParam: 'id', permissionKey: 'student:update' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateStudentDto
  ) {
    return this.studentsService.update(id, updateDto);
  }

  // DELETE /api/v1/students/:id - Delete (soft delete)
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async delete(@Param('id') id: string) {
    return this.studentsService.softDelete(id);
  }
}
```

### 2. API Rate Limiting

```typescript
// Implement tiered rate limiting
const rateLimits = {
  authenticated: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
  },
  unauthenticated: {
    windowMs: 60 * 1000,
    max: 20, // 20 requests per minute
  },
  sensitive: {
    windowMs: 60 * 1000,
    max: 10, // 10 requests per minute
  },
};

// Apply to endpoints
@UseGuards(RateLimitGuard)
@RateLimit(rateLimits.authenticated)
@Controller('api/v1/users')
export class UsersController {
  @Post('login')
  @RateLimit(rateLimits.sensitive)
  async login(@Body() credentials: LoginDto) {
    return this.authService.login(credentials);
  }
}
```

### 3. API Versioning

```typescript
// Version your APIs for security updates
@Controller('api/v1/students')
export class StudentsV1Controller {
  // v1 implementation
}

@Controller('api/v2/students')
export class StudentsV2Controller {
  // v2 with security improvements
}

// Deprecation headers
app.use('/api/v1/*', (req, res, next) => {
  res.setHeader('Warning', '299 - "API v1 is deprecated. Please use v2"');
  res.setHeader('Sunset', 'Sun, 01 Jan 2026 00:00:00 GMT');
  next();
});
```

---

## Summary

This chapter covered:
1. ✅ Secure coding guidelines for TypeScript/React
2. ✅ OWASP Top 10 mitigation strategies
3. ✅ Authentication best practices
4. ✅ Authorization patterns
5. ✅ Input validation and sanitization
6. ✅ Secure API design
7. ✅ Password and session security

**Next Steps:**
- Implement security testing (Chapter 14)
- Review audit logging (Chapter 41)
- Conduct security training

---

**Previous Chapter:** [38 - Security Implementation](./38-security-implementation.md)
**Next Chapter:** [40 - Data Privacy & Compliance](./40-data-privacy-compliance.md)

**Word Count:** ~8,000 words
