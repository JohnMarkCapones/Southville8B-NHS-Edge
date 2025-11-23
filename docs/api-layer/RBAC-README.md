# 🔐 Role-Based Access Control (RBAC) System

This system provides comprehensive role-based access control using Supabase authentication and custom role verification.

## 📋 Available Roles

Based on your Supabase configuration, the system supports these roles:

- **`Admin`** - Full system access
- **`Teacher`** - Educational staff access
- **`Student`** - Student-level access

## 🏗️ System Architecture

### **Components:**

1. **`RolesGuard`** - Validates user roles before endpoint access
2. **`@Roles()` Decorator** - Specifies required roles for endpoints
3. **`UserRole` Enum** - Type-safe role definitions
4. **`AuthService.getUserRoleFromSupabase()`** - Fetches user roles from Supabase

### **Flow:**

1. **Authentication** → `SupabaseAuthGuard` verifies JWT token
2. **Role Verification** → `RolesGuard` checks user role against requirements
3. **Access Control** → Endpoint access granted/denied based on role

## 🚀 Usage Examples

### **Basic Role Protection:**

```typescript
import { UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, UserRole } from '../auth/decorators/roles.decorator';

@Controller('protected')
export class ProtectedController {
  // Admin only
  @Get('admin-only')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  adminOnly() {
    return { message: 'Admin access granted' };
  }

  // Multiple roles
  @Get('staff-only')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  staffOnly() {
    return { message: 'Staff access granted' };
  }

  // All roles
  @Get('all-users')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  allUsers() {
    return { message: 'All users access granted' };
  }
}
```

### **Students Controller Example:**

```typescript
@Controller('api/students')
export class StudentsController {
  // Only Admin and Teacher can create students
  @Post()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  // Only Admin can delete students
  @Delete(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.studentsService.remove(+id);
  }

  // All roles can view specific student
  @Get(':id')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT)
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(+id);
  }
}
```

## 🔧 Configuration

### **Role Storage in Supabase:**

The system fetches user roles from Supabase's `auth.users` table:

```sql
-- User roles are stored in raw_user_meta_data
SELECT raw_user_meta_data->>'role' as role
FROM auth.users
WHERE id = 'user-id';
```

### **Setting User Roles:**

```typescript
// In Supabase Dashboard or via API
const { data, error } = await supabase.auth.admin.updateUserById(userId, {
  user_metadata: {
    role: 'Admin', // or 'Teacher' or 'Student'
  },
});
```

## 📊 API Endpoints

### **Authentication:**

- `POST /api/auth/login` - Traditional email/password login
- `POST /api/auth/verify` - JWT token verification

### **Students (Role-Protected):**

- `POST /api/students` - **Admin, Teacher** only
- `GET /api/students` - **Admin, Teacher** only
- `GET /api/students/:id` - **All roles**
- `PATCH /api/students/:id` - **Admin, Teacher** only
- `DELETE /api/students/:id` - **Admin** only

### **Role Examples:**

- `GET /api/examples/admin-only` - **Admin** only
- `GET /api/examples/teacher-only` - **Teacher** only
- `GET /api/examples/student-only` - **Student** only
- `GET /api/examples/admin-teacher` - **Admin, Teacher** only
- `GET /api/examples/all-roles` - **All roles**

## 🛡️ Security Features

- ✅ **JWT Token Verification** - Validates Supabase-issued tokens
- ✅ **Role-Based Access Control** - Granular permission system
- ✅ **Type-Safe Roles** - TypeScript enum for role definitions
- ✅ **Error Handling** - Proper HTTP status codes (401, 403)
- ✅ **Swagger Documentation** - Complete API documentation
- ✅ **Audit Logging** - User actions logged with role information

## 🚨 Error Responses

### **401 Unauthorized:**

```json
{
  "statusCode": 401,
  "message": "Invalid or expired authentication token",
  "error": "Unauthorized"
}
```

### **403 Forbidden:**

```json
{
  "statusCode": 403,
  "message": "Access denied. Required roles: Admin, Teacher. Your role: Student",
  "error": "Forbidden"
}
```

## 💡 Recommendations

1. **Role Assignment:** Use Supabase Dashboard to assign roles to users
2. **Testing:** Test each role with different user accounts
3. **Monitoring:** Monitor role-based access logs for security
4. **Documentation:** Keep role permissions documented for team
5. **Regular Audits:** Periodically review user roles and permissions

## 🔍 Testing Roles

```bash
# Test Admin access
curl -H "Authorization: Bearer <admin-jwt>" \
  http://localhost:3000/api/examples/admin-only

# Test Teacher access
curl -H "Authorization: Bearer <teacher-jwt>" \
  http://localhost:3000/api/examples/teacher-only

# Test Student access
curl -H "Authorization: Bearer <student-jwt>" \
  http://localhost:3000/api/examples/student-only
```

The system is now fully configured with comprehensive role-based access control! 🎯
