# Debugging Academic Years Display Issue

## Problem Summary
- Academic years exist in the backend (confirmed by 409 conflict error)
- But the UI shows NO academic years in `/superadmin/system-settings` → Academic Year tab
- Header also shows no academic year/quarter information

## Root Cause Analysis

The issue is likely ONE of these:

### 1. **API Endpoint Not Responding** (Most Likely)
The frontend is calling `/api/v1/academic-years` but:
- The backend API might not be running
- The endpoint might be returning an error
- CORS issues might be blocking the request

### 2. **Silent Error in Component**
The `AcademicYearSection` component might be:
- Catching errors silently
- Stuck in loading state
- Getting empty array back from API

### 3. **Wrong API Base URL**
Frontend might be calling the wrong API endpoint URL.

---

## Step-by-Step Debug Process

### Step 1: Check Backend API is Running

Open a NEW terminal and run:

```bash
cd core-api-layer/southville-nhs-school-portal-api-layer
npm run start:dev
```

**Expected Output:** API should start on `http://localhost:3004` (or whatever port is configured)

### Step 2: Test API Endpoint Directly

Once backend is running, open another terminal and test:

```bash
curl http://localhost:3004/api/v1/academic-years
```

**Expected Response:**
```json
[
  {
    "id": "some-uuid",
    "year_name": "2025-2026",
    "start_date": "2025-08-15",
    "end_date": "2026-05-30",
    ...
  }
]
```

If this returns data, the backend is working!

### Step 3: Check Frontend API Configuration

Open browser DevTools (F12) → Network Tab:
1. Go to `/superadmin/system-settings`
2. Click "Academic Year" tab
3. Look for a request to `/api/v1/academic-years`
4. Check the response

**What to look for:**
- ❌ Request shows 404 → Backend not running or wrong URL
- ❌ Request shows 500 → Backend error
- ❌ Request shows CORS error → API CORS configuration issue
- ✅ Request shows 200 with data → Frontend rendering issue

### Step 4: Check Browser Console

Open DevTools → Console:
1. Look for errors related to "academic-years"
2. Look for the debug log: `"AcademicYearSection render - showCreateForm:"`
3. Check what `loading` state shows

---

## Quick Fix Solutions

### Fix 1: Ensure Backend is Running

```bash
# Terminal 1 - Backend
cd core-api-layer/southville-nhs-school-portal-api-layer
npm run start:dev

# Terminal 2 - Frontend
cd frontend-nextjs
npm run dev
```

Both must be running simultaneously!

### Fix 2: Check API Base URL

Check `frontend-nextjs/lib/api/config.ts` to verify the API URL is correct.

### Fix 3: Add Debug Logging

Temporarily add console logs to see what's happening. I can add these for you.

---

## Expected Behavior

When working correctly:
1. Page loads → Shows loading spinner
2. API calls complete → Loading spinner disappears
3. UI shows:
   - "Academic Year Overview" card with active year info
   - List of all academic years in "Academic Years Management" section
   - Each year shows: name, dates, status badge (Active/Archived/Inactive)

---

## What I Can Do Next

Tell me which of these you need:

**Option A:** "Both APIs are running but I still see nothing"
→ I'll add debug logging to the component

**Option B:** "Backend API is not running"
→ I'll help you start it

**Option C:** "I see errors in the Network tab"
→ Share the error and I'll help fix it

**Option D:** "I see the API returning data in Network tab, but UI still empty"
→ I'll fix the rendering logic
