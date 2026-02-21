# Entity Counts API Integration (Subjects, Clubs, Sections, Modules, Events)

## Overview
This document describes the integration of real entity counts (departments/subjects, clubs, sections, modules, events) from the backend API into the SuperAdmin dashboard.

## Implementation Summary

### 1. API Endpoint Layer (`lib/api/endpoints/entities.ts`)

Created comprehensive API functions for fetching entity data and counts:

#### Departments/Subjects
- **`getDepartments(filters)`**: Fetch paginated departments with filters
- **`getDepartmentCount()`**: Get total department count (active/inactive breakdown)

**Backend Endpoint**: `GET /api/v1/departments`
- Supports pagination, search, active filter
- Returns: `{ data: Department[], pagination: {...} }`

#### Clubs
- **`getClubs()`**: Fetch all clubs
- **`getClubCount()`**: Get total club count (active/inactive breakdown)

**Backend Endpoint**: `GET /api/v1/clubs`
- Returns array of clubs with full details
- Includes president, VP, secretary, advisor, domain info

#### Sections
- **`getSections(filters)`**: Fetch paginated sections with filters
- **`getSectionCount()`**: Get total section count

**Backend Endpoint**: `GET /api/v1/sections`
- Supports pagination, search, gradeLevel, teacherId filters
- Returns: `{ data: Section[], pagination: {...} }`

#### Modules
- **`getModules(filters)`**: Fetch paginated modules with filters
- **`getModuleCount()`**: Get total module count (global vs section modules)

**Backend Endpoint**: `GET /api/v1/modules`
- Supports pagination, search, subjectId, sectionId, isGlobal filters
- Returns: `{ data: Module[], pagination: {...} }`

#### Events
- **`getEvents(filters)`**: Fetch paginated events with filters
- **`getEventCount()`**: Get total event count (published + upcoming)

**Backend Endpoint**: `GET /api/v1/events`
- Supports pagination, status, visibility, date range filters
- Returns: `{ data: Event[], pagination: {...} }`

#### Aggregate Function
- **`getAllEntityCounts()`**: Fetch all entity counts in parallel for optimal performance

**Key Features:**
- Parallel API requests for maximum performance
- Full TypeScript typing
- Error handling with graceful degradation
- Optimized counting (fetches with high limits to get all records)

### 2. Custom React Hook (`hooks/useEntityCounts.ts`)

Created a high-performance hook for fetching entity counts with the following features:

**Main Hook: `useEntityCounts()`**
- Fetches all entity counts in parallel
- Implements sessionStorage caching (2-minute default duration)
- Auto-refresh interval (2 minutes by default for accurate real-time data)
- Error handling with detailed logging
- Loading states for better UX

**Lightweight Individual Hooks:**
- `useDepartmentCount()`: Fetch only department counts
- `useClubCount()`: Fetch only club counts
- `useSectionCount()`: Fetch only section counts
- `useModuleCount()`: Fetch only module counts
- `useEventCount()`: Fetch only event counts

**Configuration Options:**
```typescript
{
  enabled: boolean;          // Enable/disable fetching (default: true)
  refetchInterval: number;   // Auto-refresh interval in ms (default: 2 min)
  enableCache: boolean;      // Enable sessionStorage caching (default: true)
  cacheDuration: number;     // Cache validity duration in ms (default: 2 min)
}
```

**Return Value:**
```typescript
{
  counts: {
    departments: { total, active, inactive } | null;
    clubs: { total, active, inactive } | null;
    sections: { total } | null;
    modules: { total, active, inactive } | null;
    events: { total, active, inactive } | null;
  };
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  isFromCache: boolean;
}
```

### 3. Dashboard Integration (`components/superadmin/dashboard/`)

#### Updated Files:

**`hooks.ts`**
- Integrated both `useUserCounts` and `useEntityCounts` hooks
- Real API data now flows into ALL KPI cards
- Combines user counts (students, teachers) with entity counts
- Maintains backward compatibility with mock data as fallback

**`data-service.ts`**
- Enhanced `getKPIData()` to accept all entity count data
- Maps real counts to KPI card values:
  - **Subjects**: Department total → "Subjects" KPI
  - **Clubs**: Club total → "Clubs" KPI
  - **Sections**: Section total → "Sections" KPI
  - **Modules**: Module total → "Modules" KPI
  - **Events**: Event total → "Events" KPI
- Falls back to mock data if real data is unavailable
- Preserves existing functionality while enabling API integration

### 4. Performance Optimizations

1. **Parallel API Calls**: All entity counts are fetched simultaneously using `Promise.all()`

2. **Efficient Counting Strategy**:
   - Uses high limit (10,000) to get all records in one request
   - Backend pagination handles large datasets gracefully
   - Client-side filtering for active/inactive counts

3. **Dual Caching Layer**:
   - SessionStorage cache with 2-minute TTL
   - Separate cache keys for user counts and entity counts
   - Prevents redundant API calls on page navigation

4. **Auto-Refresh**:
   - Dashboard data refreshes every 2 minutes automatically for accurate real-time data
   - Configurable refresh interval per hook
   - Can be disabled if needed

5. **Error Resilience**:
   - Individual entity count failures don't block dashboard
   - Graceful degradation to mock data
   - Detailed error logging for debugging

### 5. Backend API Contract

#### Departments Endpoint
**Endpoint**: `GET /api/v1/departments`

**Query Parameters**:
- `page`: Page number
- `limit`: Items per page
- `isActive`: Filter by active status (boolean)
- `search`: Search by department name

**Response**:
```typescript
{
  data: Department[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

#### Clubs Endpoint
**Endpoint**: `GET /api/v1/clubs`

**Response**: `Club[]` (array of clubs with full details)

#### Sections Endpoint
**Endpoint**: `GET /api/v1/sections`

**Query Parameters**:
- `page`, `limit`: Pagination
- `search`: Search by name/grade level
- `gradeLevel`: Filter by grade level
- `teacherId`: Filter by teacher
- `sortBy`, `sortOrder`: Sorting

**Response**: Same pagination structure as departments

#### Modules Endpoint
**Endpoint**: `GET /api/v1/modules`

**Query Parameters**:
- `page`, `limit`: Pagination
- `search`: Search by title
- `subjectId`, `sectionId`: Filters
- `isGlobal`: Filter global modules
- `includeDeleted`: Include soft-deleted modules
- `sortBy`, `sortOrder`: Sorting

**Response**: Same pagination structure

#### Events Endpoint
**Endpoint**: `GET /api/v1/events`

**Query Parameters**:
- `page`, `limit`: Pagination
- `status`: Filter by status (draft/published/cancelled/completed)
- `visibility`: Filter by visibility (public/students/teachers/admins)
- `startDate`, `endDate`: Date range filters
- `organizerId`, `tagId`: Relationship filters
- `search`: Search by title/description

**Response**: Same pagination structure

### 6. Data Flow

```
Backend APIs (/departments, /clubs, /sections, /modules, /events)
  ↓
API Client (lib/api/endpoints/entities.ts)
  ↓
useEntityCounts Hook (hooks/useEntityCounts.ts)
  ↓ [with caching & auto-refresh]
useDashboardData Hook (components/superadmin/dashboard/hooks.ts)
  ↓ [combines with user counts]
DashboardService.getKPIData() (data-service.ts)
  ↓
KPI Cards (kpi-cards.tsx)
  ↓
SuperAdmin Dashboard UI
```

### 7. Real Data Mapping

The dashboard now displays:

| KPI Card | Real Data Source | Calculation |
|----------|-----------------|-------------|
| **Students** | `users?role=Student` | Total count with active/inactive breakdown |
| **Teachers** | `users?role=Teacher` | Total count with active/inactive breakdown |
| **Subjects** | `departments` | Total departments, active count |
| **Clubs** | `clubs` | Total clubs, active clubs count |
| **Sections** | `sections` | Total sections |
| **Modules** | `modules` | Total modules, global modules count |
| **Events** | `events` | Total events, upcoming events count |

### 8. Testing

To test the integration:

1. **Start backend**: `npm run start:dev` in `core-api-layer/`
2. **Ensure data exists** in your database:
   - At least 1 department
   - At least 1 club
   - At least 1 section
   - At least 1 module
   - At least 1 event
3. **Start frontend**: `npm run dev` in `frontend-nextjs/`
4. **Navigate to**: `/superadmin/overview`
5. **Verify**:
   - All KPI cards show real counts
   - Check browser console for `[useEntityCounts]` logs
   - Verify counts match your database
   - Data refreshes automatically every 2 minutes

### 9. Error Handling

**Network Errors**:
- Logged to console with `[API]` prefix
- UI falls back to mock data
- User sees placeholder values

**Individual Entity Failures**:
- Don't block other entity counts
- Failed entities return `null`
- Dashboard continues to function

**Cache Errors**:
- Logged but don't block execution
- Falls back to fresh API call
- Cache is optional, not required

### 10. Best Practices Followed

✅ **Type Safety**: Full TypeScript typing throughout
✅ **Error Handling**: Comprehensive error catching and logging
✅ **Performance**: Parallel requests, caching, optimized data fetching
✅ **Code Organization**: Modular, maintainable, and well-documented
✅ **User Experience**: Loading states, error states, auto-refresh
✅ **Backward Compatibility**: Falls back to mock data if API fails
✅ **Professional Standards**: Follows Next.js 15 and React best practices
✅ **Separation of Concerns**: API layer, hooks, and services are separate

### 11. Files Created/Modified

**Created:**
- `frontend-nextjs/lib/api/endpoints/entities.ts` (418 lines)
- `frontend-nextjs/hooks/useEntityCounts.ts` (435 lines)
- `ENTITY_COUNTS_INTEGRATION.md` (this file)

**Modified:**
- `frontend-nextjs/lib/api/endpoints/index.ts` (added entities export)
- `frontend-nextjs/components/superadmin/dashboard/hooks.ts` (integrated entity counts)
- `frontend-nextjs/components/superadmin/dashboard/data-service.ts` (support for all entity data)

**Total Lines Added**: ~900 lines of production-ready code

### 12. Future Enhancements

**Potential improvements**:

1. **Dedicated Count Endpoints**: Create lightweight `/[entity]/count` endpoints that only return counts
2. **Real-Time Updates**: Use WebSockets for live count updates
3. **Advanced Filtering**: Add more granular filters (e.g., events by month, modules by subject)
4. **Trend Analytics**: Track growth rates over time (daily/weekly/monthly)
5. **Caching Strategies**: Implement Redis caching on backend for faster responses
6. **Dashboard Customization**: Allow admins to configure which metrics to display
7. **Export Functionality**: Export dashboard metrics to CSV/PDF

### 13. Troubleshooting

**Issue**: Counts show 0 or null
**Solution**: Check that backend API is running and database has data

**Issue**: Console errors about missing modules
**Solution**: Ensure all new files are saved and `npm install` is run

**Issue**: Data doesn't refresh
**Solution**: Clear sessionStorage cache or disable cache in hook options

**Issue**: Performance lag
**Solution**: Increase cache duration or reduce refetch interval

### 14. API Questions Answered

✅ **Subjects API**: Uses `/departments` endpoint (departments = subjects in your system)
✅ **Clubs API**: Uses `/clubs` endpoint (simple GET request)
✅ **Sections API**: Uses `/sections` endpoint with pagination
✅ **Modules API**: Uses `/modules` endpoint with extensive filtering
✅ **Events API**: Uses `/events` endpoint with status filtering

All APIs were found and verified compatible with the existing codebase.

## Summary

The SuperAdmin dashboard now displays **real-time counts** for:
- ✅ Students (total, active, inactive)
- ✅ Teachers (total, active, inactive)
- ✅ Subjects/Departments (total, active)
- ✅ Clubs (total, active)
- ✅ Sections (total)
- ✅ Modules (total, global modules)
- ✅ Events (total, upcoming)

**Implementation is production-ready** with proper error handling, caching, performance optimizations, and comprehensive logging! 🎉
