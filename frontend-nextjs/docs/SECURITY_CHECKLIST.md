# Frontend Security Checklist

Quick checklist for implementing security in your forms and components.

---

## ✅ Before Committing Any Form

- [ ] Form uses `useSecureForm` hook with Zod schema
- [ ] All text inputs are validated with appropriate schema
- [ ] Password fields use `type="password"` and `autocomplete="new-password"`
- [ ] Password fields meet strength requirements (12+ chars, upper/lower/number/special)
- [ ] Email inputs validate against school domain if required
- [ ] No sensitive data in URL parameters or GET requests
- [ ] Error messages don't leak sensitive information
- [ ] Loading states prevent double submission
- [ ] Form has CSRF protection (via Supabase when integrated)

## ✅ File Uploads

- [ ] File type validated on client-side (MIME type + extension)
- [ ] File size limits enforced (10MB docs, 5MB images, 2MB avatars)
- [ ] Filename sanitized (no path traversal, special chars)
- [ ] Magic number verification enabled for important uploads
- [ ] File validation schema from `@/lib/validation/file-upload` used
- [ ] Preview before upload for images
- [ ] Upload progress indication for large files

## ✅ Rich Text Content (Tiptap)

- [ ] Editor configured with secure link options (`getSecureLinkOptions()`)
- [ ] Editor configured with secure image options (`getSecureImageOptions()`)
- [ ] Content sanitized before saving (`sanitizeTiptapContent()`)
- [ ] Content security checked (`checkTiptapContentSecurity()`)
- [ ] Character/word limit enforced
- [ ] Paste content sanitized (`sanitizePastedContent()`)
- [ ] No dangerous tags allowed (script, iframe, object)
- [ ] Links validated (no javascript:, data: URLs)

## ✅ User Input Sanitization

- [ ] All user text inputs sanitized with `sanitizeString()` or `safeString` schema
- [ ] URLs validated with `sanitizeUrl()` or `urlSchema`
- [ ] Search queries sanitized with `sanitizeSearchQuery()`
- [ ] User-generated HTML sanitized with `sanitizeHtml()`
- [ ] Filenames sanitized with `sanitizeFilename()`
- [ ] XSS detection enabled for critical inputs
- [ ] Unicode normalization applied where needed

## ✅ Authentication

- [ ] Login forms use appropriate schema (student/teacher/parent)
- [ ] Password never stored in localStorage or state
- [ ] Remember me feature uses secure cookies only
- [ ] Session timeout implemented (auto-logout)
- [ ] Failed login attempts tracked and rate-limited
- [ ] Logout clears all client-side data
- [ ] Password reset uses secure token validation

## ✅ Authorization

- [ ] Route-based access control for /student, /teacher, /admin, /superadmin
- [ ] Component-level permission checks
- [ ] API requests include auth headers
- [ ] Unauthorized users redirected to login
- [ ] Role-based UI rendering (hide features based on role)

## ✅ Data Protection (GDPR)

- [ ] Minimum data collected (only what's necessary)
- [ ] Clear consent checkboxes (terms, privacy, parental consent)
- [ ] Privacy settings accessible to users
- [ ] User can view/download their data
- [ ] User can delete their account
- [ ] Data retention policy documented
- [ ] No tracking without consent
- [ ] Cookie consent banner for analytics

## ✅ Client-Side Security Headers

- [ ] CSP (Content Security Policy) configured in next.config.js
- [ ] X-Frame-Options: SAMEORIGIN
- [ ] X-Content-Type-Options: nosniff
- [ ] X-XSS-Protection: 1; mode=block
- [ ] Strict-Transport-Security (HSTS)
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Permissions-Policy (camera, microphone, geolocation restricted)

## ✅ Error Handling

- [ ] No sensitive data in error messages
- [ ] Generic error messages to users ("Invalid credentials", not "User not found")
- [ ] Detailed errors logged server-side only
- [ ] Error boundaries for graceful failure
- [ ] Network errors handled appropriately
- [ ] Timeout errors show user-friendly message

## ✅ Performance & Security

- [ ] Rate limiting on sensitive actions (login, search, file upload)
- [ ] Debouncing on search inputs
- [ ] File size validation before upload
- [ ] Large forms split into steps to prevent timeout
- [ ] Infinite scroll with pagination limits
- [ ] Client-side caching doesn't store sensitive data

## ✅ Testing

- [ ] Test with XSS payload: `<script>alert('xss')</script>`
- [ ] Test with SQL injection: `' OR '1'='1`
- [ ] Test with path traversal filename: `../../etc/passwd`
- [ ] Test with oversized files
- [ ] Test with wrong file types
- [ ] Test with malformed data
- [ ] Test with empty/null values
- [ ] Test with unicode exploits: `а` (Cyrillic) vs `a` (Latin)
- [ ] Test password strength validator
- [ ] Test form validation on all fields

## ✅ Code Review Checklist

- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] No inline event handlers (`onClick="..."` in HTML strings)
- [ ] No `eval()` or `Function()` constructor
- [ ] No sensitive data in console.log (remove before production)
- [ ] No API keys or secrets in frontend code
- [ ] All environment variables use `NEXT_PUBLIC_` prefix if needed by client
- [ ] Dependencies up to date (`npm audit`)
- [ ] No unused imports that could bloat bundle

## ✅ Accessibility & Security

- [ ] ARIA labels don't expose sensitive info
- [ ] Screen reader text doesn't leak sensitive data
- [ ] Focus management secure (no focus traps)
- [ ] Keyboard navigation doesn't bypass security

## ✅ Mobile Security

- [ ] Touch-friendly secure inputs (password visibility toggle)
- [ ] Biometric authentication supported (future)
- [ ] Secure data storage on mobile browsers
- [ ] No sensitive data persists after logout on mobile

---

## Quick Fix Guide

### Issue: XSS vulnerability detected
**Fix**: Wrap output in `sanitizeString()` or use Zod schema with validation

### Issue: File upload accepts wrong types
**Fix**: Use `documentFileSchema` or `imageFileSchema` from validation library

### Issue: Form allows SQL injection patterns
**Fix**: Use Zod schemas which automatically sanitize + detect SQL patterns

### Issue: Tiptap allows dangerous content
**Fix**: Use `sanitizeTiptapContent()` before saving, `checkTiptapContentSecurity()` to validate

### Issue: Password too weak
**Fix**: Use `passwordSchema` from validation library (enforces 12+ chars, complexity)

### Issue: User bypassing client validation
**Fix**: Always validate on server too (this is frontend defense only)

---

## Security Incidents

If you detect a security issue:

1. **DO NOT** commit the vulnerable code
2. **FIX** the issue immediately using validation schemas
3. **TEST** the fix with malicious payloads
4. **DOCUMENT** the issue and fix
5. **REVIEW** similar code for same vulnerability
6. **REPORT** to team lead if severe

---

## Monthly Security Tasks

- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Update dependencies (`npm outdated` then `npm update`)
- [ ] Review security logs (once Sentry integrated)
- [ ] Test forms with OWASP Top 10 payloads
- [ ] Review GDPR compliance
- [ ] Update security documentation
- [ ] Train team on new security practices

---

## Resources

- **Security Plan**: See `SECURITY_PLAN.md` for complete security architecture
- **Implementation Guide**: See `IMPLEMENTATION_GUIDE.md` for code examples
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **Next.js Security**: https://nextjs.org/docs/app/building-your-application/deploying/security
- **Zod Documentation**: https://zod.dev/

---

**Last Updated**: 2025-10-13
**Next Review**: 2025-11-13

_Print this checklist and keep it near your desk!_
