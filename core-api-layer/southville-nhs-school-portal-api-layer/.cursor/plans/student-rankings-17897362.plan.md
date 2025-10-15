<!-- 17897362-de13-49f5-84e5-195afca3de42 5364416e-16dd-405a-be31-a3b720bd8964 -->
# FAQ Module Implementation

## Database Setup

### Create `faq` table via MCP

- Table structure:
  - `id` uuid (PK, auto-generated for consistency)
  - `question` varchar (NOT NULL)
  - `answer` text (NOT NULL)
  - `created_at` timestamp with time zone (default now())
  - `updated_at` timestamp with time zone (default now())

### Add indexes for performance

- Index on `created_at` for chronological sorting
- Full-text search index on `question` and `answer` for search functionality

### RLS Policies

- Public: Read access (SELECT) without authentication
- Admin: Full CRUD access (INSERT, UPDATE, DELETE)

## NestJS Module Structure

### 1. Generate Module Structure

Create directory `src/faq/` with:

- `faq.module.ts`
- `faq.controller.ts`
- `faq.service.ts`
- `dto/create-faq.dto.ts`
- `dto/update-faq.dto.ts`
- `entities/faq.entity.ts`

### 2. Create DTOs in `src/faq/dto/`

**create-faq.dto.ts**

- Validators: IsString, IsNotEmpty, MinLength, MaxLength
- `question`: string (required, 5-500 chars)
- `answer`: text (required, 10-5000 chars)

**update-faq.dto.ts**

- PartialType of CreateFaqDto

### 3. Create Entity in `src/faq/entities/`

**faq.entity.ts**

- ApiProperty decorators for Swagger
- All fields typed properly
- Matches database schema

### 4. Implement Service in `src/faq/faq.service.ts`

**Methods:**

- `create(dto)`: Create new FAQ (Admin only)
- `findAll(filters)`: Get all FAQs with pagination and optional search
- `findOne(id)`: Get single FAQ by ID
- `update(id, dto)`: Update FAQ (Admin only)
- `remove(id)`: Delete FAQ (Admin only)
- `search(query)`: Search FAQs by question/answer text

**Features:**

- Pagination support (page, limit)
- Search functionality (filter by question/answer text)
- Proper error handling with HTTP exceptions
- Logging for all operations
- Input validation

### 5. Implement Controller in `src/faq/faq.controller.ts`

**Endpoints:**

**Public (No Auth Required):**

- `GET /faq` - List all FAQs with pagination
- `GET /faq/search?q=...` - Search FAQs
- `GET /faq/:id` - Get single FAQ

**Admin Only (Requires Auth + Admin Role):**

- `POST /faq` - Create FAQ
- `PATCH /faq/:id` - Update FAQ
- `DELETE /faq/:id` - Delete FAQ

**Guards:**

- Public endpoints: No guards
- Admin endpoints: SupabaseAuthGuard + RolesGuard with @Roles(UserRole.ADMIN)

### 6. Module Configuration

**faq.module.ts**

- Import AuthModule for guards
- Register controller and service
- Export service if needed by other modules

**app.module.ts**

- Import FaqModule in the imports array

### 7. Swagger Documentation

- Complete API documentation with @ApiTags, @ApiOperation, @ApiResponse
- Request/response examples
- Query parameter documentation
- Proper status codes

## Implementation Details

### Public Access Pattern

Since GET endpoints are public, they should NOT use `@UseGuards()` decorator. Only POST, PATCH, DELETE need guards.

Example:

```typescript
// Public endpoint - no guards
@Get()
@ApiOperation({ summary: 'Get all FAQs (Public)' })
async findAll(@Query() filters) { }

// Admin endpoint - with guards
@Post()
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiOperation({ summary: 'Create FAQ (Admin only)' })
async create(@Body() dto) { }
```

### Key Features

- **Public read access**: Anyone can view FAQs without authentication
- **Admin-only writes**: Only admins can create, update, delete
- **Search functionality**: Full-text search on question and answer
- **Pagination**: Efficient data loading
- **Validation**: Strict input validation with class-validator
- **Error handling**: Proper HTTP exceptions
- **Logging**: Comprehensive logging for debugging
- **Swagger docs**: Complete API documentation

### File References

- Follow patterns from `src/announcements/` for structure
- Use similar service patterns from `src/students/students.service.ts`
- Controller patterns from `src/students/students.controller.ts`

### To-dos

- [ ] Create student_rankings table in Supabase with proper schema, indexes, and RLS policies
- [ ] Create CreateStudentRankingDto and UpdateStudentRankingDto with validation
- [ ] Create StudentRanking entity with ApiProperty decorators
- [ ] Add ranking CRUD methods to StudentsService with auto-sync logic
- [ ] Add ranking endpoints to StudentsController with proper guards and authorization
- [ ] Verify all endpoints work correctly and RLS policies are enforced