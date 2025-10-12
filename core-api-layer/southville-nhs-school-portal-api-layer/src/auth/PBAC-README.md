# PBAC (Policy-Based Access Control) Implementation

## Overview

This implementation provides **Policy-Based Access Control (PBAC)** for the Southville NHS School Portal API. PBAC works in conjunction with the existing **Role-Based Access Control (RBAC)** to provide fine-grained, domain-specific permissions.

## Architecture

### Flow Diagram

```
Incoming Request → SupabaseAuthGuard → RolesGuard → PoliciesGuard → Controller
                      ↓                    ↓              ↓
                   Verify JWT        Check Global    Check Domain
                                   Role (Teacher/    Permissions
                                      Admin)         (club.manage_finances)
```

### Components

1. **@Policies Decorator** - Specifies domain parameter and permission key
2. **PoliciesGuard** - Evaluates domain-specific permissions
3. **PolicyEngineService** - Core permission evaluation logic
4. **DomainMappingService** - Maps entity IDs to domain IDs
5. **PbacManagementService** - CRUD operations for PBAC data

## Database Schema

The PBAC system uses these tables:

- `domains` - Defines domain contexts (clubs, events, projects)
- `domain_roles` - Roles within specific domains (Treasurer, Secretary)
- `permissions` - Atomic permissions (club.manage_finances)
- `domain_role_permissions` - Links roles to permissions with allow/deny
- `user_domain_roles` - Assigns users to domain roles

## Usage Examples

### Basic PBAC Usage

```typescript
@Patch(':clubId/finances')
@UseGuards(SupabaseAuthGuard, RolesGuard, PoliciesGuard)
@Roles(UserRole.TEACHER, UserRole.ADMIN) // RBAC: Global role check
@Policies('clubId', 'club.manage_finances') // PBAC: Domain permission check
async updateClubFinances(@Param('clubId') clubId: string) {
  // Implementation
}
```

### Multiple Permission Types

```typescript
// Different actions require different permissions
@Get(':clubId/members')
@Policies('clubId', 'club.view_members')
async getMembers() { }

@Post(':clubId/members')
@Policies('clubId', 'club.manage_members')
async addMember() { }

@Patch(':clubId/finances')
@Policies('clubId', 'club.manage_finances')
async updateFinances() { }
```

## Permission Key Convention

Permissions follow dot notation: `{domain_type}.{action}`

Examples:

- `club.manage_finances`
- `club.view_members`
- `club.manage_members`
- `club.delete`
- `event.edit_details`
- `event.manage_schedule`

## Domain Mapping

The system automatically maps route parameters to domains:

- `clubId` → queries `clubs.domain_id`
- `eventId` → queries `events.domain_id`
- `projectId` → queries `projects.domain_id`

## Management Operations

### Creating Domain Roles and Permissions

```typescript
// 1. Create a domain
const domainId = await pbacManagementService.createDomain(
  'club',
  'Math Club',
  userId,
);

// 2. Create a domain role
const roleId = await pbacManagementService.createDomainRole(
  domainId,
  'Treasurer',
  userId,
);

// 3. Create permissions
const permissionId = await pbacManagementService.createPermission(
  'club.manage_finances',
  'Manage club finances',
);

// 4. Assign permission to role
await pbacManagementService.assignPermissionToRole(roleId, permissionId, true);

// 5. Assign role to user
await pbacManagementService.assignRoleToUser(userId, roleId);
```

## Error Handling

The system provides comprehensive error handling:

- **Authentication errors**: User not authenticated
- **Authorization errors**: Missing global role or domain permission
- **Parameter errors**: Missing or invalid domain parameters
- **Database errors**: Failed permission evaluation

## Performance Considerations

- **No caching initially**: Optimize later as needed
- **Efficient queries**: Uses joins to minimize database calls
- **Lazy loading**: Services initialize Supabase clients on demand

## Security Features

- **JWT verification**: All requests must have valid Supabase JWT
- **Role hierarchy**: Global roles (Teacher/Admin) required before domain permissions
- **Permission isolation**: Domain permissions are isolated per domain
- **Audit trail**: All permission evaluations are logged

## Extensibility

The system is designed to be easily extensible:

- **New domain types**: Add mappings to DomainMappingService
- **New permissions**: Create with dot notation convention
- **New roles**: Create domain-specific roles at runtime
- **Custom logic**: Extend PolicyEngineService for complex scenarios

## Testing

Example test scenarios:

1. **Valid access**: User with correct role and domain permission
2. **Missing role**: User without required global role
3. **Missing permission**: User with role but no domain permission
4. **Invalid domain**: Non-existent domain ID
5. **Wrong domain**: User has permission in different domain

## Migration Guide

To add PBAC to existing routes:

1. Add `PoliciesGuard` to `@UseGuards`
2. Add `@Policies` decorator with domain param and permission key
3. Ensure domain mapping exists in DomainMappingService
4. Create necessary permissions and roles in database
5. Assign roles to users

## Best Practices

1. **Use descriptive permission keys**: `club.manage_finances` not `club.fin`
2. **Group related permissions**: `club.view_*`, `club.manage_*`
3. **Test permission boundaries**: Verify users can't access unauthorized domains
4. **Monitor permission usage**: Log permission evaluations for audit
5. **Regular cleanup**: Remove unused permissions and roles
