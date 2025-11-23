# User Management Search Fix - Test Plan

## Overview
This document provides a comprehensive test plan to verify the user search functionality works correctly across all pages in pagination.

---

## **Test Environment Setup**

### **Prerequisites**
- ? Backend API running on `localhost:3004`
- ? Frontend desktop app built and running
- ? Test database with at least 100+ users
- ? Admin account credentials for testing

### **Test Data Requirements**

**Minimum Test Data:**
- 50+ Students (with varied names: John, Mary, Alice, Bob, etc.)
- 20+ Teachers (with email domains: @staff.edu, @teacher.edu)
- 5+ Admins
- User with Student ID: S123456
- User with Employee ID: T12345
- Users on Page 1 (1-25), Page 2 (26-50), Page 3 (51-75)

---

## **Test Cases**

### **1. Basic Search Functionality**

#### **TC-001: Search on Page 1**
**Steps:**
1. Open User Management page
2. Wait for page to load (should show page 1, users 1-25)
3. Type "john" in search box
4. Wait 300ms (debounce delay)

**Expected Result:**
- ? Loading indicator appears
- ? Search query sent to backend: `GET /users?search=john&page=1&limit=25`
- ? Results show ALL users with "john" in name (across all pages)
- ? Page resets to 1
- ? Pagination shows correct total (e.g., "Page 1 of 2" if 30 Johns total)

**Pass Criteria:**
- Search returns users from original page 1, 2, 3, etc.
- No users are missing
- Results are accurate

---

#### **TC-002: Search on Page 2**
**Steps:**
1. Open User Management page
2. Click "Next" to go to page 2
3. Verify page shows users 26-50
4. Type "mary" in search box
5. Wait 300ms

**Expected Result:**
- ? Page resets to 1
- ? Shows users with "mary" from ALL pages (not just page 2)
- ? If only 15 Marys total, shows single page
- ? If 30 Marys total, shows "Page 1 of 2"

**Pass Criteria:**
- Finds "Mary Johnson" from page 1 (user #5)
- Finds "Mary Smith" from page 3 (user #52)
- Total count matches database

---

#### **TC-003: Search on Page 3+**
**Steps:**
1. Navigate to page 3 or higher
2. Search for a user that exists on page 1
3. Verify results

**Expected Result:**
- ? Search finds the user
- ? Page resets to 1
- ? User is displayed in search results

---

### **2. Search Field Coverage**

#### **TC-004: Search by Full Name**
**Input:** "Alice"
**Expected:** Finds "Alice Cooper", "Alice Smith", etc.

#### **TC-005: Search by Email**
**Input:** "@gmail.com"
**Expected:** Finds all users with Gmail emails

#### **TC-006: Search by Student ID**
**Input:** "S123456"
**Expected:** Finds student with ID S123456

#### **TC-007: Search by Employee ID**
**Input:** "T12345"
**Expected:** Finds teacher/admin with ID T12345

#### **TC-008: Partial Match**
**Input:** "jo"
**Expected:** Finds "John", "Joseph", "Joaquin", etc.

#### **TC-009: Case Insensitive**
**Input:** "JOHN"
**Expected:** Same results as "john" or "John"

---

### **3. Search with Filters**

#### **TC-010: Search + Role Filter**
**Steps:**
1. Type "john" in search
2. Select "Student" from role filter
3. Verify results

**Expected:**
- ? Shows only students named John
- ? Excludes teachers/admins named John
- ? Backend receives: `?search=john&role=Student`

#### **TC-011: Search + Status Filter**
**Steps:**
1. Type "mary" in search
2. Select "Active" from status filter

**Expected:**
- ? Shows only active users named Mary
- ? Excludes inactive/suspended Marys
- ? Backend receives: `?search=mary&status=Active`

#### **TC-012: Search + Multiple Filters**
**Steps:**
1. Type "alice"
2. Select "Teacher" role
3. Select "Active" status
4. Select "Grade 10" (if applicable)

**Expected:**
- ? Shows active teacher named Alice teaching Grade 10
- ? Backend receives all filters: `?search=alice&role=Teacher&status=Active&grade=10`

---

### **4. Pagination During Search**

#### **TC-013: Search Results Pagination**
**Setup:** Search term returns 50+ results

**Steps:**
1. Type search term that matches 50+ users (e.g., "@student.edu")
2. Verify first page shows 1-25
3. Click "Next" to go to page 2
4. Verify page 2 shows 26-50

**Expected:**
- ? Pagination works correctly for search results
- ? "Next/Previous" buttons work
- ? Page info shows "Page X of Y"
- ? Backend receives: `?search=...&page=2`

#### **TC-014: Page Size Change During Search**
**Steps:**
1. Search for "john" (assume 30 results)
2. Change page size from 25 to 10
3. Verify pagination updates

**Expected:**
- ? Shows 10 results per page
- ? Total pages updates (30 results ? 3 pages)
- ? Page resets to 1

---

### **5. Debouncing**

#### **TC-015: Rapid Typing**
**Steps:**
1. Rapidly type "j-o-h-n" (each letter < 100ms apart)
2. Stop typing
3. Wait 300ms

**Expected:**
- ? Only ONE API call is made (after 300ms of no typing)
- ? API receives full search term: `?search=john`
- ? No intermediate searches for "j", "jo", "joh"

#### **TC-016: Backspace During Typing**
**Steps:**
1. Type "john"
2. Wait 200ms
3. Backspace to "joh"
4. Wait 400ms

**Expected:**
- ? First search canceled (didn't reach 300ms)
- ? Second search executes: `?search=joh`

---

### **6. Empty and Edge Cases**

#### **TC-017: No Search Results**
**Input:** "zzzzzz" (non-existent name)

**Expected:**
- ? Shows "No users found" message
- ? Empty state UI appears
- ? No pagination controls

#### **TC-018: Clear Search**
**Steps:**
1. Search for "john"
2. Clear search box (delete all text)
3. Wait 300ms

**Expected:**
- ? Shows all users again (back to default view)
- ? Page resets to 1
- ? Pagination shows total users (not search results)
- ? Backend receives: `?page=1&limit=25` (no search param)

#### **TC-019: Special Characters**
**Input:** "O'Brien"

**Expected:**
- ? Search works correctly
- ? No SQL injection errors
- ? Finds users with apostrophes in names

#### **TC-020: Very Long Search**
**Input:** 100+ character string

**Expected:**
- ? Search is truncated or validated
- ? No server errors
- ? Returns no results gracefully

---

### **7. Performance**

#### **TC-021: Search Response Time**
**Steps:**
1. Search for common term (e.g., "john")
2. Measure time from keystroke to results display

**Expected:**
- ? Results appear within 1 second
- ? Loading indicator shows during search
- ? UI remains responsive

#### **TC-022: Large Result Sets**
**Steps:**
1. Search for term matching 100+ users
2. Verify performance

**Expected:**
- ? Only 25 results loaded initially (pagination)
- ? No UI freezing
- ? Pagination controls responsive

---

### **8. Filter Interactions**

#### **TC-023: Change Filter During Search**
**Steps:**
1. Search for "john"
2. Wait for results
3. Change role filter to "Teacher"
4. Verify results update

**Expected:**
- ? Results filtered to teachers only
- ? Page resets to 1
- ? Backend receives: `?search=john&role=Teacher&page=1`

#### **TC-024: Remove Filter During Search**
**Steps:**
1. Search for "mary" with "Student" filter
2. Change role filter to "All Roles"

**Expected:**
- ? Shows all Marys (students, teachers, admins)
- ? Result count increases

---

### **9. UI Behavior**

#### **TC-025: Loading State**
**Steps:**
1. Type search term
2. Observe loading indicator

**Expected:**
- ? Loading spinner appears immediately
- ? User cards fade out/skeleton loads
- ? "Loading users..." message shows
- ? Search input remains enabled

#### **TC-026: Error State**
**Steps:**
1. Stop backend API
2. Try searching

**Expected:**
- ? Error toast appears: "Failed to load users"
- ? Graceful error message
- ? No crash or blank screen
- ? Can retry search after backend restarts

---

### **10. Console Logs Verification**

#### **TC-027: Debug Logging**
**Steps:**
1. Open browser dev tools console
2. Search for "john"
3. Check console logs

**Expected Console Logs:**
```
=== Loading Users ===
Search: 'john'
Role: null
Status: null
Page: 1, Limit: 25
[ApiClient] GetUsersAsync URL: users?search=john&page=1&limit=25
API Response: true
Users in response: 12
Users loaded into collection: 12
Total users: 12
```

---

## **Automated Test Script**

### **PowerShell Test Script**

Create `test-user-search.ps1`:

```powershell
# User Management Search Test Script
$baseUrl = "http://localhost:3004/api/v1"
$token = "YOUR_ADMIN_JWT_TOKEN"

$headers = @{
  "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "=== User Management Search Tests ===" -ForegroundColor Cyan

# Test 1: Search by name
Write-Host "`nTest 1: Search by name (john)" -ForegroundColor Yellow
$response1 = Invoke-RestMethod -Uri "$baseUrl/users?search=john&page=1&limit=25" -Headers $headers
Write-Host "Results: $($response1.pagination.total) users found" -ForegroundColor Green

# Test 2: Search by email
Write-Host "`nTest 2: Search by email (@student.edu)" -ForegroundColor Yellow
$response2 = Invoke-RestMethod -Uri "$baseUrl/users?search=@student.edu&page=1&limit=25" -Headers $headers
Write-Host "Results: $($response2.pagination.total) users found" -ForegroundColor Green

# Test 3: Search by Student ID
Write-Host "`nTest 3: Search by Student ID (S123456)" -ForegroundColor Yellow
$response3 = Invoke-RestMethod -Uri "$baseUrl/users?search=S123456" -Headers $headers
Write-Host "Results: $($response3.pagination.total) users found" -ForegroundColor Green

# Test 4: Search with role filter
Write-Host "`nTest 4: Search + Role Filter (john + Student)" -ForegroundColor Yellow
$response4 = Invoke-RestMethod -Uri "$baseUrl/users?search=john&role=Student" -Headers $headers
Write-Host "Results: $($response4.pagination.total) students found" -ForegroundColor Green

# Test 5: Pagination in search
Write-Host "`nTest 5: Search Pagination (page 2)" -ForegroundColor Yellow
$response5 = Invoke-RestMethod -Uri "$baseUrl/users?search=@student.edu&page=2&limit=10" -Headers $headers
Write-Host "Results: Page $($response5.pagination.page) of $($response5.pagination.totalPages)" -ForegroundColor Green

Write-Host "`n=== All Tests Passed ===" -ForegroundColor Green
```

**Usage:**
```powershell
.\test-user-search.ps1
```

---

## **Manual Test Checklist**

Print this checklist and check off as you test:

### **Basic Functionality**
- [ ] TC-001: Search on page 1
- [ ] TC-002: Search on page 2
- [ ] TC-003: Search on page 3+

### **Search Fields**
- [ ] TC-004: Search by full name
- [ ] TC-005: Search by email
- [ ] TC-006: Search by student ID
- [ ] TC-007: Search by employee ID
- [ ] TC-008: Partial match
- [ ] TC-009: Case insensitive

### **Combined Filters**
- [ ] TC-010: Search + role filter
- [ ] TC-011: Search + status filter
- [ ] TC-012: Search + multiple filters

### **Pagination**
- [ ] TC-013: Search results pagination
- [ ] TC-014: Page size change during search

### **Debouncing**
- [ ] TC-015: Rapid typing
- [ ] TC-016: Backspace during typing

### **Edge Cases**
- [ ] TC-017: No search results
- [ ] TC-018: Clear search
- [ ] TC-019: Special characters
- [ ] TC-020: Very long search

### **Performance**
- [ ] TC-021: Search response time
- [ ] TC-022: Large result sets

### **UI Behavior**
- [ ] TC-025: Loading state
- [ ] TC-026: Error state

---

## **Bug Report Template**

If you find a bug, use this template:

```markdown
### Bug Report: [Title]

**Test Case:** TC-XXX
**Severity:** Critical / High / Medium / Low

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Screenshots:**
[Attach screenshots if applicable]

**Console Logs:**
```
[Paste console errors]
```

**Environment:**
- OS: Windows 11
- .NET Version: 9.0
- Backend API: v1.0.0
```

---

## **Success Criteria**

The fix is considered successful if:

? **All 27 test cases pass**  
? **Search works across all pages**  
? **No performance degradation**  
? **No console errors**  
? **Debouncing works correctly**  
? **Edge cases handled gracefully**  
? **UI remains responsive**  
? **Error states display properly**  

---

## **Known Limitations**

1. **Search is case-insensitive only** - Exact case matching not supported
2. **Partial matching required** - Must type at least 2 characters
3. **Debounce delay** - 300ms delay before search (intentional)
4. **Backend limit** - Maximum 100 results per page (backend restriction)

---

## **Post-Deployment Monitoring**

After deploying the fix, monitor:

1. **API Response Times** - Track `/users` endpoint performance
2. **Error Rates** - Watch for 500 errors or timeouts
3. **User Feedback** - Check if users report improved search
4. **Database Performance** - Monitor query execution times

**Monitoring Tools:**
- Supabase Dashboard ? Database Insights
- NestJS Logger ? Search query logs
- Frontend Console ? Search API calls

---

## **Rollback Plan**

If the fix causes issues:

1. **Revert frontend changes:**
   ```bash
   git revert HEAD
   cd desktop-app
   dotnet build
   ```

2. **Revert backend changes:**
   ```bash
git revert HEAD
   cd core-api-layer
   npm run build
   npm run start:prod
   ```

3. **Restore database indexes:**
   ```sql
   DROP INDEX IF EXISTS idx_users_full_name_trgm;
   DROP INDEX IF EXISTS idx_users_email_trgm;
   ```

---

## **Summary**

This test plan provides **27 comprehensive test cases** covering:
- ? Basic search functionality
- ? Search across all pagination pages
- ? Debouncing
- ? Filter combinations
- ? Edge cases
- ? Performance
- ? UI behavior
- ? Error handling

**Execute all tests before marking the fix as complete!** ??
