# Quick Start Guide - User Search Fix

## ?? **Quick Deploy (5 Minutes)**

### **Step 1: Backend (2 min)**

1. Open terminal in backend directory:
```bash
cd core-api-layer/southville-nhs-school-portal-api-layer
```

2. Update the users service file:
   - Open: `src/modules/users/users.service.ts`
   - Find the `findAll` method
   - Add this code after the query initialization:

```typescript
// Add search filter
if (filters.search) {
  const searchTerm = filters.search.trim();
  query = query.or(
`full_name.ilike.%${searchTerm}%,` +
    `email.ilike.%${searchTerm}%,` +
    `student_id.ilike.%${searchTerm}%,` +
    `employee_id.ilike.%${searchTerm}%`
  );
}
```

3. Restart the backend:
```bash
npm run start:dev
```

---

### **Step 2: Database Indexes (1 min)**

Run this in Supabase SQL Editor:

```sql
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_full_name_trgm 
ON users USING gin(full_name gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email_trgm 
ON users USING gin(email gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_student_id 
ON users(student_id) WHERE student_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_employee_id 
ON users(employee_id) WHERE employee_id IS NOT NULL;
```

---

### **Step 3: Frontend (1 min)**

The frontend changes are already complete! Just rebuild:

```bash
cd desktop-app
dotnet build
dotnet run --project Southville8BEdgeUI
```

---

### **Step 4: Test (1 min)**

1. Open User Management page
2. Go to page 2 (click "Next")
3. Search for a user you know exists on page 1
4. ? **Success!** Search should find the user and reset to page 1

---

## ?? **Quick Test Checklist**

- [ ] Search on page 1 finds users from page 2
- [ ] Search on page 2 finds users from page 1
- [ ] Typing waits 300ms before searching (watch network tab)
- [ ] Empty search shows all users
- [ ] Pagination works with search results

---

## ?? **If Something Goes Wrong**

### **Backend not finding users:**
Check the terminal for errors. Make sure the search code is in the right place.

### **Still only searching current page:**
Clear your browser cache and restart the frontend app.

### **Build errors:**
Run: `dotnet clean` then `dotnet build`

---

## ?? **Need Help?**

1. Check `USER_SEARCH_FIX_SUMMARY.md` for full details
2. Check `BACKEND_USER_SEARCH_IMPLEMENTATION.md` for backend guide
3. Check `USER_SEARCH_TEST_PLAN.md` for testing help

---

## ? **Done!**

Your user search now works across ALL pages! ??
