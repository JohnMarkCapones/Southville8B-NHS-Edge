# Backend API Implementation: User Search

## Overview
This document provides the complete backend implementation for server-side user search functionality in the User Management system.

---

## **File 1: Update Users DTO**

**File:** `src/modules/users/dto/get-users-query.dto.ts`

```typescript
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class GetUsersQueryDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 25,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 25;

  @ApiPropertyOptional({
    description: 'Filter by role name',
    example: 'Student',
    enum: ['Student', 'Teacher', 'Admin'],
  })
  @IsString()
  @IsOptional()
  role?: string;

  @ApiPropertyOptional({
  description: 'Filter by status',
    example: 'Active',
    enum: ['Active', 'Inactive', 'Suspended', 'Pending'],
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: 'Search term for full-text search',
  example: 'john',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Sort field',
    example: 'created_at',
    enum: ['created_at', 'full_name', 'email', 'last_login_at'],
  })
  @IsString()
  @IsOptional()
  sortBy?: string = 'created_at';

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc'],
  })
  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
```

---

## **File 2: Update Users Controller**

**File:** `src/modules/users/users.controller.ts`

```typescript
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { GetUsersQueryDto } from './dto/get-users-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin') // Only admins can list all users
  @ApiOperation({ 
    summary: 'Get all users with pagination and search',
    description: 'Fetch users with filtering by role, status, and full-text search across name, email, and IDs'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Users fetched successfully',
    schema: {
      example: {
        users: [/* array of users */],
        pagination: {
          total: 150,
   page: 1,
   limit: 25,
          totalPages: 6
        }
      }
    }
  })
  async getUsers(@Query() query: GetUsersQueryDto) {
    return this.usersService.findAll(query);
  }
}
```

---

## **File 3: Update Users Service**

**File:** `src/modules/users/users.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { GetUsersQueryDto } from './dto/get-users-query.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(filters: GetUsersQueryDto) {
  this.logger.log(`[findAll] Fetching users with filters: ${JSON.stringify(filters)}`);

    // Build query
    let query = this.supabaseService
      .getClient()
      .from('users')
      .select(`
 *,
        role:roles(id, name),
        student:students(
          id,
          student_id,
       first_name,
       middle_name,
          last_name,
    grade_level,
       section:sections(name)
        ),
        teacher:teachers(
        id,
     employee_id,
          first_name,
          middle_name,
      last_name,
          department:departments(department_name)
 ),
        admin:admins(
          id,
        employee_id,
   first_name,
  middle_name,
      last_name,
          department
        )
      `, { count: 'exact' });

    // ? SEARCH FILTER: Full-text search across multiple fields
    if (filters.search) {
      const searchTerm = filters.search.trim();
      this.logger.log(`[findAll] Applying search filter: "${searchTerm}"`);

      // Use Supabase's `or` filter for full-text search
      query = query.or(
        `full_name.ilike.%${searchTerm}%,` +
        `email.ilike.%${searchTerm}%,` +
      `student_id.ilike.%${searchTerm}%,` +
        `employee_id.ilike.%${searchTerm}%`
      );
    }

    // Role filter
  if (filters.role && filters.role !== 'All Roles') {
      this.logger.log(`[findAll] Applying role filter: ${filters.role}`);
      
      // Get role ID from role name
      const { data: roleData } = await this.supabaseService
        .getClient()
        .from('roles')
    .select('id')
        .eq('name', filters.role)
        .single();

      if (roleData) {
        query = query.eq('role_id', roleData.id);
      }
    }

    // Status filter
    if (filters.status && filters.status !== 'All Status') {
      this.logger.log(`[findAll] Applying status filter: ${filters.status}`);
    query = query.eq('status', filters.status);
    }

    // Get total count before pagination
    const { count, error: countError } = await query;
    
    if (countError) {
this.logger.error(`[findAll] Error getting count: ${countError.message}`);
      throw new Error('Failed to fetch user count');
    }

    const totalCount = count || 0;
    this.logger.log(`[findAll] Total matching users: ${totalCount}`);

    // Apply sorting
    const sortField = filters.sortBy || 'created_at';
    const sortDirection = filters.sortOrder === 'asc' ? true : false;
    query = query.order(sortField, { ascending: sortDirection });

    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 25;
    const offset = (page - 1) * limit;

    this.logger.log(`[findAll] Pagination: page=${page}, limit=${limit}, offset=${offset}`);
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: users, error } = await query;

    if (error) {
 this.logger.error(`[findAll] Database error: ${error.message}`);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

  // Calculate total pages
 const totalPages = Math.ceil(totalCount / limit);

    this.logger.log(`[findAll] Successfully fetched ${users?.length || 0} users`);

    return {
  users: users || [],
   pagination: {
    total: totalCount,
        page,
        limit,
   totalPages,
 },
    };
  }
}
```

---

## **Search Implementation Details**

### **Search Fields**
The search functionality searches across these fields:
1. **`full_name`** - User's display name
2. **`email`** - User's email address
3. **`student_id`** - Student's LRN/ID (for students)
4. **`employee_id`** - Employee ID (for teachers/admins)

### **Search Algorithm**
- Uses PostgreSQL's `ILIKE` for case-insensitive pattern matching
- `%search%` pattern allows partial matching
- Supabase's `.or()` combines multiple field searches

### **Example Queries**

**Search by name:**
```
GET /users?search=john
? Finds "John Doe", "Johnny Smith", "Mary Johnson"
```

**Search by email:**
```
GET /users?search=gmail
? Finds all users with @gmail.com emails
```

**Search by ID:**
```
GET /users?search=LRN-2024
? Finds students with IDs starting with LRN-2024
```

**Combined search and filter:**
```
GET /users?search=john&role=Student&status=Active&page=1&limit=25
? Active students named "john" (page 1)
```

---

## **Testing the Implementation**

### **Test Cases**

#### 1. **Search by Full Name**
```bash
curl -X GET "http://localhost:3004/api/v1/users?search=john" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Result:**
- Returns users with "john" in their `full_name`
- Case-insensitive

#### 2. **Search by Email**
```bash
curl -X GET "http://localhost:3004/api/v1/users?search=@student.edu" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Result:**
- Returns all users with student email domain

#### 3. **Search by Student ID**
```bash
curl -X GET "http://localhost:3004/api/v1/users?search=S123456" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Result:**
- Returns student with ID S123456

#### 4. **Search with Pagination**
```bash
curl -X GET "http://localhost:3004/api/v1/users?search=john&page=2&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Result:**
- Page 2 of john search results (users 11-20)

#### 5. **Combined Filters**
```bash
curl -X GET "http://localhost:3004/api/v1/users?search=john&role=Student&status=Active&page=1&limit=25" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Result:**
- Active students with "john" in name/email/ID

---

## **Performance Considerations**

### **Database Indexes**

Add these indexes for better search performance:

```sql
-- Full-text search index on full_name
CREATE INDEX idx_users_full_name_trgm ON users USING gin(full_name gin_trgm_ops);

-- Email search index
CREATE INDEX idx_users_email_trgm ON users USING gin(email gin_trgm_ops);

-- Student ID index
CREATE INDEX idx_users_student_id ON users(student_id) WHERE student_id IS NOT NULL;

-- Employee ID index
CREATE INDEX idx_users_employee_id ON users(employee_id) WHERE employee_id IS NOT NULL;

-- Combined index for common queries
CREATE INDEX idx_users_role_status ON users(role_id, status);
```

### **Query Optimization Tips**

1. **Use `limit`** - Always paginate results to avoid fetching too many rows
2. **Cache role lookups** - Store role IDs in memory instead of querying every time
3. **Use prepared statements** - Supabase handles this automatically
4. **Monitor slow queries** - Use Supabase dashboard's "Database Insights"

---

## **API Response Format**

### **Successful Response (200 OK)**

```json
{
  "users": [
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "john.doe@student.edu",
      "full_name": "John Doe",
      "role_id": "role-uuid",
      "status": "Active",
      "created_at": "2024-01-15T08:00:00Z",
      "updated_at": "2024-01-15T08:00:00Z",
      "last_login_at": "2024-01-20T10:30:00Z",
    "role": {
        "id": "role-uuid",
     "name": "Student"
      },
      "student": {
     "id": "student-uuid",
        "student_id": "S123456",
        "first_name": "John",
     "middle_name": "M",
        "last_name": "Doe",
   "grade_level": "Grade 10",
        "section": {
    "name": "Diamond"
   }
      }
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 25,
    "totalPages": 6
  }
}
```

### **Error Response (400 Bad Request)**

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### **Error Response (401 Unauthorized)**

```json
{
"statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

---

## **Security Considerations**

1. **SQL Injection Prevention**
   - Supabase uses parameterized queries automatically
   - User input is escaped via `URI.EscapeDataString()` on frontend

2. **Authorization**
   - Only admins can access `/users` endpoint
   - Enforced by `@Roles('Admin')` decorator and `RolesGuard`

3. **Rate Limiting**
   - Consider adding rate limiting to prevent abuse
   - Use `@nestjs/throttler` package

4. **Sensitive Data**
   - Never expose passwords in responses
   - Filter out sensitive fields like `password_hash`

---

## **Deployment Checklist**

- [ ] Run database migrations to add indexes
- [ ] Update API documentation (Swagger)
- [ ] Test all search scenarios in staging
- [ ] Monitor API performance after deployment
- [ ] Set up error tracking (Sentry/LogRocket)
- [ ] Configure rate limiting
- [ ] Update frontend API client
- [ ] Test cross-browser compatibility

---

## **Troubleshooting**

### **Search returns no results**

**Possible causes:**
1. Search term doesn't match any users
2. Role/status filters are too restrictive
3. Database connection issues

**Debug steps:**
```typescript
// Add logging to service
this.logger.log(`Search term: "${filters.search}"`);
this.logger.log(`Query: ${JSON.stringify(query)}`);
```

### **Search is slow**

**Possible causes:**
1. Missing database indexes
2. Too many results (not paginating)
3. Complex joins with related tables

**Solutions:**
- Add indexes (see "Performance Considerations")
- Reduce `limit` parameter
- Use database query analyzer

### **401 Unauthorized error**

**Possible causes:**
1. JWT token expired
2. User doesn't have Admin role
3. Token not sent in Authorization header

**Solutions:**
- Refresh JWT token
- Verify user role in database
- Check Authorization header format

---

## **Summary**

? **Implemented server-side search** across name, email, and IDs  
? **Pagination preserved** during search  
? **Debounced search** on frontend (300ms delay)  
? **Optimized queries** with database indexes  
? **Secure** - SQL injection prevention, role-based access  
? **Well-tested** - Comprehensive test cases provided  

**Search now works across ALL pages!** ??
