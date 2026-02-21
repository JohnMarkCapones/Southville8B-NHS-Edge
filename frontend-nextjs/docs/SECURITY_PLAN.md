# Frontend Security Plan - Southville 8B NHS Edge

**Target**: Next.js 15 School LMS/CMS Frontend
**Focus**: Client-side defense, validation, sanitization & GDPR compliance
**Updated**: 2025-10-13

---

## Executive Summary

This security plan provides comprehensive frontend defense for a school learning management system handling:
- **Personal Data**: Student/teacher credentials, profiles, academic records
- **User Roles**: Superadmin, Teachers, Students, Guests
- **File Handling**: PDF, PPTX, DOCX uploads (no videos)
- **Rich Content**: Tiptap editor for comments and content creation
- **Compliance**: GDPR, ISO 27001/27002

---

## 1. Security Architecture Overview

### 1.1 Defense Layers

```
┌─────────────────────────────────────────────────────┐
│         Layer 1: Input Validation (Zod)             │
│  ✓ Schema-based validation before processing        │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│      Layer 2: Sanitization & Normalization          │
│  ✓ XSS prevention, SQL injection defense            │
│  ✓ HTML/Script stripping from user inputs           │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│       Layer 3: Authentication & Authorization        │
│  ✓ Supabase Auth integration                        │
│  ✓ Role-based access control (RBAC)                 │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│          Layer 4: Secure API Communication           │
│  ✓ HTTPS-only, CSRF tokens, secure headers          │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│          Layer 5: Monitoring & Logging               │
│  ✓ Sentry error tracking, DataDog (future)          │
└─────────────────────────────────────────────────────┘
```

---

## 2. Input Validation Strategy (Zod)

### 2.1 Core Validation Principles

1. **Validate Early**: All user input validated before processing
2. **Strict Types**: Leverage TypeScript + Zod for type safety
3. **Whitelist Approach**: Define what's allowed, reject everything else
4. **Custom Validators**: Domain-specific validation (student IDs, dates, etc.)

### 2.2 Validation Schema Organization

```
lib/
└── validation/
    ├── index.ts                    # Central exports
    ├── common.ts                   # Reusable validators (email, phone, etc.)
    ├── auth.ts                     # Login, registration, password reset
    ├── profile.ts                  # User profile updates
    ├── file-upload.ts              # File validation (type, size, name)
    ├── academic.ts                 # Grades, assignments, courses
    ├── rich-text.ts                # Tiptap content validation
    ├── comments.ts                 # Comment/discussion validation
    └── admin.ts                    # Admin-specific schemas
```

### 2.3 Common Validation Patterns

**Student ID Validation**
```typescript
z.string()
  .regex(/^S\d{6}$/, "Student ID must be S followed by 6 digits")
  .transform(s => s.toUpperCase())
```

**Email Validation (School Domain)**
```typescript
z.string()
  .email("Invalid email format")
  .toLowerCase()
  .refine(
    email => email.endsWith("@southville8b.edu.ph") || email.endsWith("@student.southville8b.edu.ph"),
    "Must use school email domain"
  )
```

**Safe String Validation**
```typescript
z.string()
  .min(1, "Required")
  .max(500, "Too long")
  .trim()
  .transform(sanitizeString) // Custom sanitizer
```

---

## 3. Sanitization Strategy

### 3.1 Input Sanitization

All user inputs must be sanitized to prevent:
- **XSS (Cross-Site Scripting)**: Remove/escape HTML/JavaScript
- **SQL Injection**: Though frontend-only, prepare for API integration
- **Path Traversal**: Sanitize file names
- **Special Character Abuse**: Normalize unicode, remove zero-width chars

### 3.2 Sanitization Utilities

```
lib/
└── security/
    ├── sanitizers.ts              # Core sanitization functions
    ├── xss-protection.ts          # XSS prevention utilities
    ├── file-validators.ts         # File upload security
    └── content-security.ts        # Rich text content security
```

### 3.3 Sanitization Functions

- `sanitizeString()` - Remove HTML, scripts, normalize whitespace
- `sanitizeHtml()` - Allow safe HTML tags only (for rich text)
- `sanitizeFileName()` - Remove path traversal, special chars
- `sanitizeSearchQuery()` - Escape special characters for search
- `normalizeUnicode()` - Prevent unicode exploits

---

## 4. XSS (Cross-Site Scripting) Prevention

### 4.1 Output Encoding

- **React Default**: React escapes by default (use it!)
- **dangerouslySetInnerHTML**: NEVER use unless content is sanitized
- **Tiptap Content**: Sanitize before saving, validate on load

### 4.2 Content Security Policy (CSP)

Implement CSP headers via Next.js config:

```typescript
// next.config.js
{
  headers: [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co"
        }
      ]
    }
  ]
}
```

### 4.3 Tiptap Security

- **Allowed Extensions**: Strictly control which Tiptap extensions are enabled
- **Link Validation**: Validate URLs, prevent javascript: and data: schemes
- **Image Upload**: Validate image sources, use content hashing
- **Content Filtering**: Sanitize on paste, validate on save

---

## 5. File Upload Security

### 5.1 Upload Validation Rules

**Allowed File Types**:
- Documents: `.pdf`, `.docx`, `.doc`, `.pptx`, `.ppt`
- Images: `.jpg`, `.jpeg`, `.png`, `.gif` (for profiles/content)

**Validation Checks**:
1. **MIME Type**: Verify actual file type (not just extension)
2. **File Size**: Max 10MB for documents, 5MB for images
3. **File Name**: Sanitize, max 255 chars, alphanumeric only
4. **Magic Number**: Validate file signature (prevent spoofing)
5. **Virus Scan**: Client-side pre-check (future: ClamAV integration)

### 5.2 Upload Implementation

```typescript
// Validation schema
const fileSchema = z.object({
  file: z.custom<File>()
    .refine(f => f.size <= 10 * 1024 * 1024, "Max 10MB")
    .refine(f => ALLOWED_TYPES.includes(f.type), "Invalid file type")
    .refine(f => validateFileSignature(f), "File type mismatch")
})
```

---

## 6. Authentication & Authorization

### 6.1 Supabase Auth Integration

- **Session Management**: Secure cookies, httpOnly, sameSite=strict
- **Token Storage**: Never store tokens in localStorage (use httpOnly cookies)
- **Auto-refresh**: Handle token refresh automatically
- **Logout**: Clear all client-side data on logout

### 6.2 Role-Based Access Control (RBAC)

```typescript
// Middleware for route protection
const rolePermissions = {
  superadmin: ['*'],
  teacher: ['/teacher/*', '/student/*/view'],
  student: ['/student/*'],
  guest: ['/guess/*']
}
```

### 6.3 Password Requirements

```typescript
const passwordSchema = z.string()
  .min(12, "Password must be at least 12 characters")
  .regex(/[A-Z]/, "Must contain uppercase letter")
  .regex(/[a-z]/, "Must contain lowercase letter")
  .regex(/[0-9]/, "Must contain number")
  .regex(/[^A-Za-z0-9]/, "Must contain special character")
  .refine(pwd => !COMMON_PASSWORDS.includes(pwd), "Password too common")
```

---

## 7. GDPR & Data Protection

### 7.1 Data Minimization

- **Collect Only Necessary Data**: No excessive personal data
- **Clear Purpose**: Every field has documented purpose
- **Retention Policy**: Define data retention periods

### 7.2 User Consent

- **Cookie Consent**: Banner for analytics cookies
- **Terms of Service**: Required acceptance on registration
- **Privacy Policy**: Clear, accessible privacy policy
- **Data Access Rights**: Allow users to download their data

### 7.3 Data Protection Measures

- **Encryption in Transit**: HTTPS only (Next.js + Supabase)
- **Secure Forms**: All forms use HTTPS POST
- **No Sensitive Data in URLs**: Never pass personal data in query params
- **Session Timeout**: Auto-logout after 30 mins inactivity

---

## 8. Client-Side Security Headers

### 8.1 Next.js Security Headers

```typescript
// next.config.js
{
  headers: [
    {
      key: 'X-DNS-Prefetch-Control',
      value: 'on'
    },
    {
      key: 'Strict-Transport-Security',
      value: 'max-age=63072000; includeSubDomains; preload'
    },
    {
      key: 'X-Frame-Options',
      value: 'SAMEORIGIN'
    },
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff'
    },
    {
      key: 'X-XSS-Protection',
      value: '1; mode=block'
    },
    {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin'
    },
    {
      key: 'Permissions-Policy',
      value: 'camera=(), microphone=(), geolocation=()'
    }
  ]
}
```

---

## 9. Dependencies & Supply Chain Security

### 9.1 Recommended Security Packages

**Required**:
- `zod` (✓ Already installed) - Schema validation
- `dompurify` - HTML sanitization
- `isomorphic-dompurify` - Universal DOMPurify for SSR
- `validator` - Additional string validation

**Optional (Future)**:
- `helmet` - Additional security headers (if using custom server)
- `@sentry/nextjs` - Error monitoring
- `iron-session` - Secure session management

### 9.2 Dependency Auditing

```bash
# Regular security audits
npm audit
npm audit fix

# Check for outdated packages
npm outdated

# Use Snyk for deeper analysis (future)
npx snyk test
```

---

## 10. Form Security Best Practices

### 10.1 React Hook Form + Zod Pattern

```typescript
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema } from "@/lib/validation/auth"

const form = useForm({
  resolver: zodResolver(loginSchema),
  mode: "onBlur", // Validate on blur
  reValidateMode: "onChange" // Re-validate on change
})
```

### 10.2 Form Security Checklist

- [ ] All inputs have Zod validation
- [ ] Sensitive inputs use type="password"
- [ ] Forms use HTTPS POST (never GET for sensitive data)
- [ ] No autocomplete on password fields (autocomplete="new-password")
- [ ] Client-side validation + server-side validation
- [ ] Error messages don't leak sensitive info
- [ ] Rate limiting on submit (prevent spam)
- [ ] Loading states prevent double submission

---

## 11. Search & Query Security

### 11.1 Search Input Sanitization

```typescript
const searchSchema = z.string()
  .max(100)
  .transform(sanitizeSearchQuery)
  .refine(q => !q.includes('<script'), "Invalid search")
```

### 11.2 Query Parameter Validation

```typescript
// Validate all URL params
const pageParamsSchema = z.object({
  id: z.string().uuid(),
  page: z.coerce.number().int().positive().max(1000),
  sort: z.enum(['asc', 'desc']).optional()
})
```

---

## 12. Error Handling & Logging

### 12.1 Secure Error Messages

**Bad** ❌:
```typescript
throw new Error(`User ${email} not found in database`)
```

**Good** ✓:
```typescript
throw new Error("Invalid credentials")
```

### 12.2 Error Logging

- **Sentry Integration**: Log errors without exposing to users
- **No Sensitive Data in Logs**: Redact passwords, tokens, PII
- **Error Boundaries**: React error boundaries for graceful failures

---

## 13. Testing & Validation

### 13.1 Security Testing Checklist

- [ ] Test XSS payloads in all text inputs
- [ ] Test file upload with malicious files
- [ ] Test SQL injection patterns in search
- [ ] Test path traversal in file names
- [ ] Test CSRF protection
- [ ] Test session timeout
- [ ] Test role-based access control
- [ ] Test password strength validation

### 13.2 Automated Testing

```typescript
// Example security test
describe('Login Form Security', () => {
  it('should reject XSS payloads', () => {
    const xssPayload = '<script>alert("xss")</script>'
    const result = loginSchema.safeParse({ email: xssPayload, password: '123' })
    expect(result.success).toBe(false)
  })
})
```

---

## 14. Monitoring & Incident Response

### 14.1 Monitoring Plan

**Phase 1 (Current)**:
- Console.error logging
- React error boundaries
- Manual monitoring

**Phase 2 (1 Week)**:
- Sentry integration for error tracking
- Basic analytics (respecting GDPR)

**Phase 3 (Future)**:
- DataDog full observability
- Security event logging
- Automated alerting

### 14.2 Incident Response

1. **Detect**: Monitor errors, user reports
2. **Assess**: Determine severity (Critical/High/Medium/Low)
3. **Contain**: Disable affected features if needed
4. **Remediate**: Fix vulnerability, deploy patch
5. **Review**: Post-mortem, update security plan

---

## 15. Implementation Roadmap

### Phase 1: Foundation (Week 1) - **CURRENT FOCUS**

- [x] Document security plan
- [ ] Install security dependencies
- [ ] Create validation schema library
- [ ] Create sanitization utilities
- [ ] Implement file upload validation
- [ ] Add XSS protection to Tiptap
- [ ] Configure security headers in next.config.js

### Phase 2: Integration (Week 2)

- [ ] Integrate Supabase Auth
- [ ] Implement RBAC middleware
- [ ] Add validation to all existing forms
- [ ] Add error boundaries
- [ ] Implement GDPR consent flow

### Phase 3: Testing (Week 3)

- [ ] Security penetration testing
- [ ] Automated security tests
- [ ] User acceptance testing
- [ ] Performance testing with security features

### Phase 4: Monitoring (Week 4+)

- [ ] Sentry integration
- [ ] Security event logging
- [ ] Regular security audits
- [ ] Team security training

---

## 16. Security Resources

### 16.1 Documentation

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/deploying/security)
- [Zod Documentation](https://zod.dev/)
- [GDPR Compliance Guide](https://gdpr.eu/)

### 16.2 Tools

- **Validation**: Zod, validator.js
- **Sanitization**: DOMPurify, sanitize-html
- **Monitoring**: Sentry, DataDog (future)
- **Testing**: Jest, Playwright, OWASP ZAP

---

## 17. Developer Guidelines

### 17.1 Code Review Checklist

Before merging any PR with user input handling:

- [ ] All inputs have Zod validation
- [ ] Sensitive data is sanitized
- [ ] No dangerouslySetInnerHTML without sanitization
- [ ] File uploads validated properly
- [ ] Error messages don't leak info
- [ ] Tests include security test cases
- [ ] RBAC permissions checked

### 17.2 Secure Coding Principles

1. **Never Trust User Input**: Validate everything
2. **Defense in Depth**: Multiple security layers
3. **Principle of Least Privilege**: Minimal permissions
4. **Fail Securely**: Errors should not expose data
5. **Keep Dependencies Updated**: Regular npm audit
6. **Security by Design**: Plan security from start, not after

---

## Appendix A: Common Attack Vectors

### A.1 XSS (Cross-Site Scripting)
**Risk**: Attacker injects malicious scripts
**Defense**: Input sanitization, CSP headers, React default escaping

### A.2 CSRF (Cross-Site Request Forgery)
**Risk**: Attacker tricks user into unwanted actions
**Defense**: SameSite cookies, CSRF tokens (Supabase handles this)

### A.3 File Upload Exploits
**Risk**: Malicious files executed on server
**Defense**: File type validation, size limits, magic number checking

### A.4 Broken Authentication
**Risk**: Weak passwords, session hijacking
**Defense**: Strong password policy, secure session management

### A.5 Sensitive Data Exposure
**Risk**: Personal data leaked
**Defense**: Encryption, secure storage, GDPR compliance

---

## Appendix B: School-Specific Security Concerns

### B.1 Student Privacy (FERPA Compliance)

- **Academic Records**: Encrypted, access-controlled
- **Grades**: Only visible to student, teachers, parents (with consent)
- **Personal Info**: Minimal collection, strict access control

### B.2 Parental Consent

- **Minors**: Require parental consent for data collection
- **Opt-out**: Allow parents to opt-out of optional features
- **Data Requests**: Honor parent/student data access requests

### B.3 School Environment

- **No Social Media Integration**: Keep student data within school system
- **No Third-Party Tracking**: Avoid analytics that track students
- **Age-Appropriate**: No inappropriate content, strict moderation

---

## Contact & Support

**Security Concerns**: Report to security@southville8b.edu.ph
**Technical Issues**: Contact IT department
**Data Protection Officer**: [TBD]

---

**Last Updated**: 2025-10-13
**Next Review**: 2025-11-13
**Version**: 1.0

---

*This security plan is a living document. Review and update monthly or after any security incident.*
