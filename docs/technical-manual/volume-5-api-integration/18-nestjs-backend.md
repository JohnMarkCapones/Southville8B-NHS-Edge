# 18. NestJS Backend API

**Last Updated:** January 10, 2026
**Status:** ✅ Complete

---

## Table of Contents

- [18.1 NestJS Architecture](#181-nestjs-architecture)
- [18.2 Core API Endpoints](#182-core-api-endpoints)
- [18.3 File Upload & Storage](#183-file-upload--storage)
- [18.4 Data Validation](#184-data-validation)
- [18.5 Error Handling](#185-error-handling)

---

## 18.1 NestJS Architecture

### 18.1.1 Module System

NestJS organizes code into **modules** that encapsulate related functionality.

#### Application Structure

```
core-api-layer/src/
├── main.ts                      # Application entry point
├── app.module.ts                # Root module
├── config/                      # Configuration files
│   ├── supabase.config.ts
│   └── r2.config.ts
├── supabase/                    # Supabase integration
│   ├── supabase.module.ts
│   └── supabase.service.ts
├── storage/                     # R2 storage abstraction
│   ├── storage.module.ts
│   └── r2-storage.service.ts
├── auth/                        # Authentication & authorization
│   ├── auth.module.ts
│   ├── supabase-auth.guard.ts
│   ├── roles.guard.ts
│   └── policies.guard.ts
├── students/                    # Student management
│   ├── students.module.ts
│   ├── students.controller.ts
│   ├── students.service.ts
│   └── dto/
│       ├── create-student.dto.ts
│       └── update-student.dto.ts
├── teachers/                    # Teacher management
├── modules/                     # Learning modules (with R2)
│   ├── modules.module.ts
│   ├── modules.controller.ts
│   ├── modules.service.ts
│   ├── services/
│   │   ├── module-access.service.ts
│   │   ├── module-storage.service.ts
│   │   └── module-download-logger.service.ts
│   ├── guards/
│   │   └── module-upload-throttle.guard.ts
│   └── dto/
│       ├── create-module.dto.ts
│       └── update-module.dto.ts
└── common/                      # Shared utilities
    ├── decorators/
    ├── filters/
    └── pipes/
```

---

#### Root Module

```typescript
// app.module.ts
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'

import { SupabaseModule } from './supabase/supabase.module'
import { StorageModule } from './storage/storage.module'
import { AuthModule } from './auth/auth.module'
import { StudentsModule } from './students/students.module'
import { TeachersModule } from './teachers/teachers.module'
import { ModulesModule } from './modules/modules.module'

import supabaseConfig from './config/supabase.config'
import r2Config from './config/r2.config'

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [supabaseConfig, r2Config],
    }),

    // Rate limiting
    ThrottlerModule.forRoot({
      ttl: 60,      // Time window in seconds
      limit: 100,   // Max requests per window
    }),

    // Core modules
    SupabaseModule,
    StorageModule,
    AuthModule,

    // Feature modules
    StudentsModule,
    TeachersModule,
    ModulesModule,
  ],
})
export class AppModule {}
```

---

### 18.1.2 Controllers & Services

#### Controller Pattern

Controllers handle HTTP requests and delegate business logic to services.

```typescript
// students/students.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'

import { StudentsService } from './students.service'
import { CreateStudentDto } from './dto/create-student.dto'
import { UpdateStudentDto } from './dto/update-student.dto'
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'

@ApiTags('Students')
@ApiBearerAuth()
@Controller({
  path: 'students',
  version: '1',
})
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @ApiOperation({ summary: 'Get all students' })
  @ApiResponse({ status: 200, description: 'List of students' })
  @Get()
  @Roles('Admin', 'Teacher')
  async findAll(@Query() query: any) {
    return this.studentsService.findAll(query)
  }

  @ApiOperation({ summary: 'Get student by ID' })
  @ApiResponse({ status: 200, description: 'Student details' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @Get(':id')
  @Roles('Admin', 'Teacher', 'Student')
  async findOne(@Param('id') id: string, @Req() request: any) {
    return this.studentsService.findOne(id, request.user)
  }

  @ApiOperation({ summary: 'Create new student' })
  @ApiResponse({ status: 201, description: 'Student created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @Post()
  @Roles('Admin')
  async create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto)
  }

  @ApiOperation({ summary: 'Update student' })
  @ApiResponse({ status: 200, description: 'Student updated' })
  @Put(':id')
  @Roles('Admin')
  async update(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentsService.update(id, updateStudentDto)
  }

  @ApiOperation({ summary: 'Delete student' })
  @ApiResponse({ status: 200, description: 'Student deleted' })
  @Delete(':id')
  @Roles('Admin')
  async remove(@Param('id') id: string) {
    return this.studentsService.remove(id)
  }
}
```

---

#### Service Pattern

Services contain business logic and interact with the database.

```typescript
// students/students.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { SupabaseService } from '../supabase/supabase.service'
import { CreateStudentDto } from './dto/create-student.dto'
import { UpdateStudentDto } from './dto/update-student.dto'

@Injectable()
export class StudentsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(query: any) {
    const { page = 1, limit = 20, gradeLevel, sectionId } = query

    let queryBuilder = this.supabaseService
      .getClient()
      .from('students')
      .select('*, sections(*)', { count: 'exact' })

    // Apply filters
    if (gradeLevel) {
      queryBuilder = queryBuilder.eq('grade_level', gradeLevel)
    }

    if (sectionId) {
      queryBuilder = queryBuilder.eq('section_id', sectionId)
    }

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await queryBuilder
      .range(from, to)
      .order('last_name', { ascending: true })

    if (error) {
      throw new InternalServerErrorException(error.message)
    }

    return {
      data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        totalPages: Math.ceil((count || 0) / limit),
      },
    }
  }

  async findOne(id: string, user: any) {
    const { data: student, error } = await this.supabaseService
      .getClient()
      .from('students')
      .select('*, sections(*)')
      .eq('id', id)
      .single()

    if (error || !student) {
      throw new NotFoundException(`Student with ID ${id} not found`)
    }

    // Check access permissions
    if (user.role === 'Student' && student.user_id !== user.id) {
      throw new ForbiddenException('You can only view your own data')
    }

    return student
  }

  async create(createStudentDto: CreateStudentDto) {
    // Use service client to bypass RLS
    const { data, error } = await this.supabaseService
      .getServiceClient()
      .from('students')
      .insert({
        user_id: createStudentDto.userId,
        first_name: createStudentDto.firstName,
        last_name: createStudentDto.lastName,
        email: createStudentDto.email,
        grade_level: createStudentDto.gradeLevel,
        section_id: createStudentDto.sectionId,
      })
      .select()
      .single()

    if (error) {
      throw new BadRequestException(error.message)
    }

    return data
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    // Use service client for updates
    const { data, error } = await this.supabaseService
      .getServiceClient()
      .from('students')
      .update({
        first_name: updateStudentDto.firstName,
        last_name: updateStudentDto.lastName,
        email: updateStudentDto.email,
        grade_level: updateStudentDto.gradeLevel,
        section_id: updateStudentDto.sectionId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      throw new NotFoundException(`Student with ID ${id} not found`)
    }

    return data
  }

  async remove(id: string) {
    // Soft delete
    const { error } = await this.supabaseService
      .getServiceClient()
      .from('students')
      .update({ is_deleted: true })
      .eq('id', id)

    if (error) {
      throw new NotFoundException(`Student with ID ${id} not found`)
    }

    return { message: 'Student deleted successfully' }
  }
}
```

---

### 18.1.3 Dependency Injection

NestJS uses dependency injection to manage component dependencies.

```typescript
// Module definition
@Module({
  imports: [SupabaseModule, StorageModule],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],  // Make available to other modules
})
export class StudentsModule {}

// Service injection
@Injectable()
export class StudentsService {
  constructor(
    private readonly supabaseService: SupabaseService,  // Injected
    private readonly storageService: R2StorageService,  // Injected
  ) {}
}

// Controller injection
@Controller('students')
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,  // Injected
  ) {}
}
```

**Benefits:**
- Loose coupling
- Easy testing (mock dependencies)
- Centralized configuration
- Automatic lifecycle management

---

## 18.2 Core API Endpoints

### 18.2.1 Students API

#### Endpoints

```
GET    /api/v1/students              - List all students
GET    /api/v1/students/:id          - Get student by ID
POST   /api/v1/students              - Create new student
PUT    /api/v1/students/:id          - Update student
DELETE /api/v1/students/:id          - Delete student
GET    /api/v1/students/:id/grades   - Get student grades
```

#### Request/Response Examples

**Create Student:**

```typescript
// POST /api/v1/students
// Request body:
{
  "userId": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@school.edu",
  "gradeLevel": 8,
  "sectionId": "section-uuid"
}

// Response (201 Created):
{
  "id": "student-uuid",
  "user_id": "uuid",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@school.edu",
  "grade_level": 8,
  "section_id": "section-uuid",
  "created_at": "2026-01-10T10:00:00Z",
  "updated_at": "2026-01-10T10:00:00Z"
}
```

**List Students with Pagination:**

```typescript
// GET /api/v1/students?page=1&limit=20&gradeLevel=8

// Response (200 OK):
{
  "data": [
    {
      "id": "student-uuid-1",
      "first_name": "John",
      "last_name": "Doe",
      "sections": {
        "name": "8-A"
      }
    },
    // ... more students
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

### 18.2.2 Teachers API

```typescript
// teachers/teachers.controller.ts
@Controller({
  path: 'teachers',
  version: '1',
})
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get()
  @Roles('Admin')
  async findAll() {
    return this.teachersService.findAll()
  }

  @Get(':id')
  @Roles('Admin', 'Teacher')
  async findOne(@Param('id') id: string, @Req() request: any) {
    return this.teachersService.findOne(id, request.user)
  }

  @Get(':id/students')
  @Roles('Admin', 'Teacher')
  async getStudents(@Param('id') id: string) {
    // Get all students taught by this teacher
    return this.teachersService.getStudents(id)
  }

  @Post()
  @Roles('Admin')
  async create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teachersService.create(createTeacherDto)
  }
}
```

---

### 18.2.3 Modules/Learning Resources API

The Modules API is the most complex, handling file uploads to R2 storage.

```typescript
// modules/modules.controller.ts
import { FastifyRequest } from 'fastify'

@Controller({
  path: 'modules',
  version: '1',
})
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Get()
  @Roles('Student', 'Teacher', 'Admin')
  async findAll(@Query() query: any, @Req() request: any) {
    return this.modulesService.findAll(query, request.user)
  }

  @Get(':id')
  @Roles('Student', 'Teacher', 'Admin')
  async findOne(@Param('id') id: string, @Req() request: any) {
    return this.modulesService.findOne(id, request.user)
  }

  @Get(':id/download')
  @Roles('Student', 'Teacher', 'Admin')
  async download(@Param('id') id: string, @Req() request: any) {
    // Generate presigned URL for download
    return this.modulesService.generateDownloadUrl(id, request.user)
  }

  @Post('upload')
  @Roles('Teacher', 'Admin')
  @UseGuards(ModuleUploadThrottleGuard)  // Rate limit: 10/hour
  async upload(@Req() request: FastifyRequest) {
    return this.modulesService.uploadModule(request)
  }

  @Delete(':id')
  @Roles('Teacher', 'Admin')
  async remove(@Param('id') id: string, @Req() request: any) {
    return this.modulesService.remove(id, request.user)
  }
}
```

---

### 18.2.4 Quizzes & Assignments API

```typescript
// quizzes/quizzes.controller.ts
@Controller({
  path: 'quizzes',
  version: '1',
})
export class QuizzesController {
  @Get()
  @Roles('Student', 'Teacher', 'Admin')
  async findAll(@Query() query: any, @Req() request: any) {
    // Students see only their assigned quizzes
    // Teachers see quizzes they created
    return this.quizzesService.findAll(query, request.user)
  }

  @Get(':id')
  @Roles('Student', 'Teacher', 'Admin')
  async findOne(@Param('id') id: string, @Req() request: any) {
    return this.quizzesService.findOne(id, request.user)
  }

  @Post()
  @Roles('Teacher', 'Admin')
  async create(@Body() createQuizDto: CreateQuizDto, @Req() request: any) {
    return this.quizzesService.create(createQuizDto, request.user)
  }

  @Post(':id/submit')
  @Roles('Student')
  async submit(
    @Param('id') id: string,
    @Body() submitDto: SubmitQuizDto,
    @Req() request: any,
  ) {
    return this.quizzesService.submitQuiz(id, submitDto, request.user)
  }

  @Get(':id/results')
  @Roles('Student', 'Teacher', 'Admin')
  async getResults(@Param('id') id: string, @Req() request: any) {
    return this.quizzesService.getResults(id, request.user)
  }
}
```

---

## 18.3 File Upload & Storage

### 18.3.1 Cloudflare R2 Integration

#### R2 Storage Service

```typescript
// storage/r2-storage.service.ts
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class R2StorageService {
  private s3Client: S3Client
  private bucketName: string

  constructor(private configService: ConfigService) {
    const accountId = this.configService.get<string>('r2.accountId')
    const accessKeyId = this.configService.get<string>('r2.accessKeyId')
    const secretAccessKey = this.configService.get<string>('r2.secretAccessKey')
    this.bucketName = this.configService.get<string>('r2.bucketName')

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
  }

  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    path: string = 'uploads',
  ): Promise<{ key: string; url: string }> {
    // Generate unique file key
    const fileKey = `${path}/${uuidv4()}-${this.sanitizeFileName(fileName)}`

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: mimeType,
    })

    await this.s3Client.send(command)

    return {
      key: fileKey,
      url: `https://${this.bucketName}.r2.cloudflarestorage.com/${fileKey}`,
    }
  }

  async generatePresignedUrl(
    fileKey: string,
    expiresIn: number = 3600,  // 1 hour
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    })

    return getSignedUrl(this.s3Client, command, { expiresIn })
  }

  async deleteFile(fileKey: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    })

    await this.s3Client.send(command)
  }

  async moveToDeleted(fileKey: string): Promise<void> {
    // Soft delete: move to .deleted/ prefix
    const deletedKey = `.deleted/${fileKey}`

    const copyCommand = new CopyObjectCommand({
      Bucket: this.bucketName,
      CopySource: `${this.bucketName}/${fileKey}`,
      Key: deletedKey,
    })

    await this.s3Client.send(copyCommand)
    await this.deleteFile(fileKey)
  }

  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
  }
}
```

---

### 18.3.2 Multipart File Handling (Fastify)

**⚠️ Critical:** NestJS uses **Fastify** adapter, not Express. File upload handling is different!

```typescript
// modules/modules.service.ts
import { Injectable } from '@nestjs/common'
import { FastifyRequest } from 'fastify'
import { R2StorageService } from '../storage/r2-storage.service'
import { SupabaseService } from '../supabase/supabase.service'

@Injectable()
export class ModulesService {
  constructor(
    private readonly r2StorageService: R2StorageService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async uploadModule(request: FastifyRequest) {
    // Fastify multipart handling
    const data = await request.file()

    if (!data) {
      throw new BadRequestException('No file uploaded')
    }

    // Read file buffer
    const chunks: Buffer[] = []
    for await (const chunk of data.file) {
      chunks.push(chunk)
    }
    const fileBuffer = Buffer.concat(chunks)

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024
    if (fileBuffer.length > maxSize) {
      throw new BadRequestException('File size exceeds 10MB limit')
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]

    if (!allowedTypes.includes(data.mimetype)) {
      throw new BadRequestException('Invalid file type')
    }

    // Get form fields
    const title = data.fields.title?.value
    const description = data.fields.description?.value
    const isGlobal = ['true', '1', true].includes(data.fields.isGlobal?.value)
    const subjectId = data.fields.subjectId?.value

    // Upload to R2
    const path = isGlobal ? 'modules/global' : 'modules/sections'
    const { key, url } = await this.r2StorageService.uploadFile(
      fileBuffer,
      data.filename,
      data.mimetype,
      path,
    )

    // Save metadata to database
    const { data: module, error } = await this.supabaseService
      .getServiceClient()
      .from('modules')
      .insert({
        title,
        description,
        file_url: url,
        r2_file_key: key,
        file_name: data.filename,
        file_size: fileBuffer.length,
        mime_type: data.mimetype,
        is_global: isGlobal,
        subject_id: subjectId,
        uploaded_by: request.user.id,
      })
      .select()
      .single()

    if (error) {
      // Rollback: delete uploaded file
      await this.r2StorageService.deleteFile(key)
      throw new InternalServerErrorException('Failed to save module metadata')
    }

    return module
  }
}
```

---

### 18.3.3 Presigned URLs for Downloads

```typescript
async generateDownloadUrl(id: string, user: any) {
  // Get module metadata
  const { data: module, error } = await this.supabaseService
    .getClient()
    .from('modules')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !module) {
    throw new NotFoundException(`Module with ID ${id} not found`)
  }

  // Check access permissions
  await this.moduleAccessService.checkAccess(module, user)

  // Generate presigned URL (valid for 1 hour)
  const presignedUrl = await this.r2StorageService.generatePresignedUrl(
    module.r2_file_key,
    3600,
  )

  // Log download
  await this.moduleDownloadLoggerService.logDownload(id, user.id)

  return {
    url: presignedUrl,
    fileName: module.file_name,
    expiresIn: 3600,
  }
}
```

---

### 18.3.4 File Management

```typescript
async remove(id: string, user: any) {
  // Get module
  const { data: module } = await this.supabaseService
    .getClient()
    .from('modules')
    .select('*')
    .eq('id', id)
    .single()

  if (!module) {
    throw new NotFoundException(`Module with ID ${id} not found`)
  }

  // Check permissions
  if (module.uploaded_by !== user.id && user.role !== 'Admin') {
    throw new ForbiddenException('You can only delete your own modules')
  }

  // Soft delete in R2 (move to .deleted/)
  await this.r2StorageService.moveToDeleted(module.r2_file_key)

  // Soft delete in database
  await this.supabaseService
    .getServiceClient()
    .from('modules')
    .update({ is_deleted: true })
    .eq('id', id)

  return { message: 'Module deleted successfully' }
}
```

---

## 18.4 Data Validation

### 18.4.1 DTOs with class-validator

```typescript
// students/dto/create-student.dto.ts
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsInt,
  IsUUID,
  IsOptional,
  Min,
  Max,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateStudentDto {
  @ApiProperty({
    description: 'User ID from Supabase Auth',
    example: 'uuid-string',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string

  @ApiProperty({
    description: 'Student first name',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string

  @ApiProperty({
    description: 'Student last name',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string

  @ApiProperty({
    description: 'Student email address',
    example: 'john.doe@school.edu',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({
    description: 'Grade level (7-10)',
    example: 8,
    minimum: 7,
    maximum: 10,
  })
  @IsInt()
  @Min(7)
  @Max(10)
  gradeLevel: number

  @ApiProperty({
    description: 'Section ID',
    example: 'section-uuid',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  sectionId?: string
}
```

---

### 18.4.2 Validation Pipes

```typescript
// main.ts - Global validation pipe
import { ValidationPipe } from '@nestjs/common'

app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,              // Strip non-whitelisted properties
    forbidNonWhitelisted: true,   // Throw error on unknown properties
    transform: true,               // Auto-transform to DTO instances
    transformOptions: {
      enableImplicitConversion: true,  // Auto-convert types
    },
  }),
)
```

**What this does:**
- Automatically validates all request bodies
- Removes extra fields not in DTO
- Throws error if unknown fields are sent
- Converts string numbers to actual numbers

**Example:**

```typescript
// Request body:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@school.edu",
  "gradeLevel": "8",        // String
  "unknownField": "value"   // Not in DTO
}

// After validation:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@school.edu",
  "gradeLevel": 8           // Converted to number
}
// unknownField is removed
```

---

### 18.4.3 Custom Validators

```typescript
// common/validators/is-valid-school-email.validator.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

@ValidatorConstraint({ async: false })
export class IsValidSchoolEmailConstraint implements ValidatorConstraintInterface {
  validate(email: string) {
    const allowedDomains = ['@school.edu', '@southville8b.edu']
    return allowedDomains.some((domain) => email.endsWith(domain))
  }

  defaultMessage() {
    return 'Email must be from an authorized school domain'
  }
}

export function IsValidSchoolEmail(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidSchoolEmailConstraint,
    })
  }
}

// Usage in DTO:
export class CreateStudentDto {
  @IsEmail()
  @IsValidSchoolEmail()  // Custom validator
  email: string
}
```

---

## 18.5 Error Handling

### 18.5.1 Exception Filters

```typescript
// common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { FastifyReply } from 'fastify'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<FastifyReply>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = 'Internal server error'
    let errors = undefined

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message
        errors = (exceptionResponse as any).errors
      } else {
        message = exceptionResponse as string
      }
    }

    response.status(status).send({
      statusCode: status,
      message,
      errors,
      timestamp: new Date().toISOString(),
    })
  }
}

// main.ts
app.useGlobalFilters(new AllExceptionsFilter())
```

---

### 18.5.2 Custom Exceptions

```typescript
// common/exceptions/validation.exception.ts
import { BadRequestException } from '@nestjs/common'

export class ValidationException extends BadRequestException {
  constructor(errors: Record<string, string[]>) {
    super({
      message: 'Validation failed',
      errors,
    })
  }
}

// Usage:
throw new ValidationException({
  email: ['Invalid email format', 'Email already exists'],
  gradeLevel: ['Must be between 7 and 10'],
})

// Response:
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": {
    "email": [
      "Invalid email format",
      "Email already exists"
    ],
    "gradeLevel": [
      "Must be between 7 and 10"
    ]
  },
  "timestamp": "2026-01-10T10:00:00Z"
}
```

---

### 18.5.3 Error Response Format

#### Standard Error Responses

```typescript
// 400 Bad Request - Validation Error
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": {
    "field": ["error message"]
  }
}

// 401 Unauthorized
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Invalid or expired token"
}

// 403 Forbidden
{
  "statusCode": 403,
  "message": "Forbidden",
  "error": "You do not have permission to perform this action"
}

// 404 Not Found
{
  "statusCode": 404,
  "message": "Student with ID 'abc-123' not found"
}

// 500 Internal Server Error
{
  "statusCode": 500,
  "message": "Internal server error",
  "timestamp": "2026-01-10T10:00:00Z"
}
```

---

## NestJS Best Practices Summary

### ✅ Do

- **Use dependency injection** - Loose coupling, easy testing
- **Validate all input with DTOs** - Type safety and validation
- **Use service client for writes** - Bypass RLS in backend
- **Implement proper error handling** - Custom exception filters
- **Use Fastify multipart** - Not Express multer
- **Generate presigned URLs for R2** - Time-limited secure access
- **Implement rate limiting** - Prevent abuse
- **Document with Swagger** - Auto-generated API docs
- **Use environment variables** - Never hardcode secrets
- **Implement logging** - Track errors and usage

### ❌ Don't

- **Don't use Express patterns** - This is Fastify
- **Don't skip validation** - Always validate input
- **Don't expose service role key** - Backend only
- **Don't use regular client for INSERT/UPDATE** - Use service client
- **Don't skip error handling** - Always handle errors
- **Don't ignore RLS** - Important for security
- **Don't hardcode file paths** - Use configuration
- **Don't skip rate limiting** - Prevent abuse
- **Don't forget to clean up** - Delete files on failure
- **Don't use synchronous operations** - Always async

---

## Quick Reference

```typescript
// Controller
@Controller({ path: 'resource', version: '1' })
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class ResourceController {
  @Get()
  @Roles('Admin')
  async findAll() {}
}

// Service with Supabase
const { data } = await this.supabaseService
  .getServiceClient()  // For writes
  .from('table')
  .insert(dto)

// File upload (Fastify)
const data = await request.file()
const chunks: Buffer[] = []
for await (const chunk of data.file) {
  chunks.push(chunk)
}
const fileBuffer = Buffer.concat(chunks)

// R2 upload
const { key, url } = await this.r2StorageService.uploadFile(
  fileBuffer,
  fileName,
  mimeType,
  'path'
)

// DTO validation
export class CreateDto {
  @IsString()
  @IsNotEmpty()
  field: string
}
```

---

## Navigation

- [← Previous: Supabase Integration](./17-supabase-integration.md)
- [Next: Chat Service Integration →](./19-chat-service.md)
- [↑ Back to Volume 5 Index](./README.md)
- [↑↑ Back to Manual Index](../README.md)
