# 🔓 Public vs Protected Routes

## ✅ PUBLIC ROUTES (No Login Required)

These routes are accessible without authentication:

### **Guest/Public Pages:**
```
/                           - Homepage (root)
/guess/*                    - All guest pages
  /guess/login              - Login page
  /guess/announcements      - Public announcements
  /guess/events             - Public events
  /guess/news               - Public news
  /guess/clubs              - Club listings
  /guess/academics          - Academic information
  /guess/about              - About page
  /guess/*                  - Any other guest pages
```

### **API Routes (Public):**
```
/api/auth/*                 - Authentication endpoints
  /api/auth/login           - Login endpoint
  /api/auth/verify          - Token verification
  
/api/test                   - Phase 1 test endpoint
/api/announcements          - Public announcements API (if configured)
```

### **Next.js Internal Routes:**
```
/_next/*                    - Next.js internals
/favicon.ico                - Favicon
/sitemap.xml                - Sitemap
/robots.txt                 - Robots file
/*.svg, *.png, *.jpg, etc.  - Static assets
```

---

## 🔒 PROTECTED ROUTES (Login Required)

These routes require authentication (JWT token in cookie):

### **Student Portal:**
```
/student/*                  - All student pages
  /student/dashboard        - Student dashboard
  /student/assignments      - Assignments
  /student/grades           - Grades/GWA
  /student/quiz             - Quiz taking
  /student/schedule         - Class schedule
  /student/*                - All other student pages
```

### **Teacher Portal:**
```
/teacher/*                  - All teacher pages
  /teacher/dashboard        - Teacher dashboard
  /teacher/students         - Student management
  /teacher/quiz             - Quiz builder
  /teacher/grading          - Grading interface
  /teacher/*                - All other teacher pages
```

### **Admin Portal:**
```
/admin/*                    - All admin pages
  /admin/dashboard          - Admin dashboard
  /admin/users              - User management
  /admin/settings           - System settings
  /admin/*                  - All other admin pages
```

### **Super Admin Portal:**
```
/superadmin/*               - All super admin pages
```

### **Protected API Routes:**
```
/api/users/*                - User management API
/api/quiz/*                 - Quiz API
/api/modules/*              - Learning modules API
/api/grades/*               - Grades API
/api/*                      - Most other API routes
```

---

## 🛡️ How Protection Works

### **For Page Routes:**
1. User visits protected route (e.g., `/student/dashboard`)
2. Middleware checks for `sb-access-token` cookie
3. If no token → Redirect to `/guess/login?redirect=/student/dashboard`
4. If token exists → Allow access (Phase 1)
5. In Phase 2: Also verify token validity and role

### **For API Routes:**
1. Request made to protected API (e.g., `/api/users/me`)
2. Middleware checks for `sb-access-token` cookie
3. If no token → Return 401 Unauthorized JSON
4. If token exists → Allow request (Phase 1)
5. In Phase 2: Also verify token validity

---

## 🧪 Testing Public Routes

**Without logging in, you should be able to access:**

```bash
# Homepage
http://localhost:3000/

# Guest pages
http://localhost:3000/guess/login
http://localhost:3000/guess/announcements
http://localhost:3000/guess/events

# Test endpoint
http://localhost:3000/api/test
```

**All of the above should load WITHOUT redirecting to login.**

---

## 🧪 Testing Protected Routes

**Without logging in, you should be redirected:**

```bash
# Try accessing student dashboard
http://localhost:3000/student/dashboard

# Should redirect to:
http://localhost:3000/guess/login?redirect=/student/dashboard
```

---

## 🔍 Debugging Tips

### **Check Middleware Logs:**

When you access any route, the middleware logs should show:

```
[Middleware] Path: /guess/login, Public: true, Root: false
[Middleware] Path: /student/dashboard, Public: false, Root: false
[Middleware] ❌ No auth token for protected route: /student/dashboard
```

### **Check Browser Console:**

1. Open DevTools (F12)
2. Go to Console tab
3. Look for middleware logs

### **Check Network Tab:**

1. Open DevTools (F12)
2. Go to Network tab
3. Access a route
4. Look for redirects (Status 307)

---

## ⚙️ Configuration

Public routes are defined in `middleware.ts`:

```typescript
const publicPaths = [
  '/guess',           // Guest pages
  '/_next',           // Next.js internals
  '/api/auth',        // Auth endpoints
  '/api/test',        // Test endpoint
  '/favicon.ico',     // Favicon
  '/api/announcements', // Public announcements
];

// Root path is also public
const isRootPath = pathname === '/';
const isPublicPath = isRootPath || publicPaths.some(path => pathname.startsWith(path));
```

---

## 🚨 Common Issues

### **Issue: Guest pages redirect to login**
- **Cause:** `/guess` not in publicPaths
- **Fix:** Already fixed - `/guess` is in the list

### **Issue: Homepage (/) redirects to login**
- **Cause:** Root path not handled
- **Fix:** Already fixed - root path is now public

### **Issue: Static assets not loading**
- **Cause:** Middleware matcher catching static files
- **Fix:** Already fixed - matcher excludes images, etc.

---

## 📝 Notes

- **Phase 1:** Token validation only checks if token EXISTS
- **Phase 2:** Will add JWT verification and role checking
- **Future:** Will add permission-based access control (PBAC)

---

**Last Updated:** Phase 1 Complete

