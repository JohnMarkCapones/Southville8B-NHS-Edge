import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { StudentActivitiesService } from '../student-activities/student-activities.service';
import { ActivityType } from '../student-activities/entities/student-activity.entity';
import { ModuleStorageService } from './services/module-storage.service';
import { ModuleAccessService } from './services/module-access.service';
import { ModuleDownloadLoggerService } from './services/module-download-logger.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { UploadModuleDto } from './dto/upload-module.dto';
import { ModuleQueryDto } from './dto/module-query.dto';
import {
  AssignModuleDto,
  UpdateModuleAssignmentDto,
} from './dto/assign-module.dto';
import {
  Module,
  ModuleWithDetails,
  SectionModule,
} from './entities/module.entity';

export interface ModuleUploadResult {
  module: Module;
  uploadResult: any;
}

export interface ModuleListResult {
  modules: ModuleWithDetails[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ModulesService {
  private readonly logger = new Logger(ModulesService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly moduleStorageService: ModuleStorageService,
    private readonly moduleAccessService: ModuleAccessService,
    private readonly moduleDownloadLoggerService: ModuleDownloadLoggerService,
    private readonly studentActivitiesService: StudentActivitiesService,
  ) {}

  /**
   * Create a new module
   */
  async create(
    createModuleDto: CreateModuleDto,
    uploadedBy: string,
  ): Promise<Module> {
    try {
      // Validate global module requirements
      if (createModuleDto.isGlobal && !createModuleDto.subjectId) {
        throw new BadRequestException(
          'Subject ID is required for global modules',
        );
      }

      if (
        !createModuleDto.isGlobal &&
        (!createModuleDto.sectionIds || createModuleDto.sectionIds.length === 0)
      ) {
        throw new BadRequestException(
          'Section IDs are required for non-global modules',
        );
      }

      // Create module record
      const { data: module, error } = await this.supabaseService
        .getServiceClient() // Use service role to bypass RLS for trusted operations
        .from('modules')
        .insert({
          title: createModuleDto.title,
          description: createModuleDto.description,
          is_global: createModuleDto.isGlobal || false,
          subject_id: createModuleDto.subjectId,
          uploaded_by: uploadedBy,
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Failed to create module:', error);
        throw new BadRequestException('Failed to create module');
      }

      // Assign to sections if not global
      if (!createModuleDto.isGlobal && createModuleDto.sectionIds) {
        await this.assignModuleToSections(
          module.id,
          createModuleDto.sectionIds,
          uploadedBy,
        );
      }

      this.logger.log(`Module created successfully: ${module.id}`);
      return module;
    } catch (error) {
      this.logger.error('Error creating module:', error);
      throw error;
    }
  }

  /**
   * Create a new module with file upload
   */
  async createWithFile(
    createModuleDto: CreateModuleDto,
    file: Express.Multer.File,
    uploadedBy: string,
  ): Promise<Module> {
    try {
      // Validate global module requirements
      if (createModuleDto.isGlobal && !createModuleDto.subjectId) {
        throw new BadRequestException(
          'Subject ID is required for global modules',
        );
      }

      if (
        !createModuleDto.isGlobal &&
        (!createModuleDto.sectionIds || createModuleDto.sectionIds.length === 0)
      ) {
        throw new BadRequestException(
          'Section IDs are required for non-global modules',
        );
      }

      // Upload file to R2
      const uploadResult = await this.moduleStorageService.uploadModule(
        file,
        uploadedBy,
        createModuleDto.isGlobal || false,
        createModuleDto.subjectId,
        createModuleDto.sectionIds?.[0], // Use first section for key generation
      );

      // Create module record with file information
      const { data: module, error } = await this.supabaseService
        .getServiceClient() // Use service role to bypass RLS for trusted operations
        .from('modules')
        .insert({
          title: createModuleDto.title,
          description: createModuleDto.description,
          is_global: createModuleDto.isGlobal || false,
          subject_id: createModuleDto.subjectId,
          uploaded_by: uploadedBy,
          file_url: uploadResult.fileUrl, // Store the R2 file URL
          r2_file_key: uploadResult.r2FileKey,
          file_size_bytes: uploadResult.fileSize,
          mime_type: uploadResult.mimeType,
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Failed to create module:', error);
        throw new BadRequestException('Failed to create module');
      }

      // Assign to sections if not global
      if (!createModuleDto.isGlobal && createModuleDto.sectionIds) {
        await this.assignModuleToSections(
          module.id,
          createModuleDto.sectionIds,
          uploadedBy,
        );
      }

      this.logger.log(`Module with file created successfully: ${module.id}`);
      return module;
    } catch (error) {
      this.logger.error('Error creating module with file:', error);
      throw error;
    }
  }

  /**
   * Upload a module file
   */
  async uploadModule(
    moduleId: string,
    file: Express.Multer.File,
    uploadModuleDto: UploadModuleDto,
    uploadedBy: string,
  ): Promise<ModuleUploadResult> {
    try {
      // Get existing module
      const module = await this.findOne(moduleId);
      if (!module) {
        throw new NotFoundException('Module not found');
      }

      // Check if user can upload to this module
      const canUpload = await this.canUserUploadToModule(module, uploadedBy);
      if (!canUpload) {
        throw new ForbiddenException(
          'You do not have permission to upload to this module',
        );
      }

      // Upload file to R2
      const uploadResult = await this.moduleStorageService.uploadModuleFile(
        moduleId,
        file.originalname,
        file.buffer,
        file.mimetype,
        uploadedBy,
      );

      // Update module with file information
      const { data: updatedModule, error } = await this.supabaseService
        .getServiceClient() // Use service role to bypass RLS for trusted operations
        .from('modules')
        .update({
          file_url: uploadResult.publicUrl,
          r2_file_key: uploadResult.filePath,
          file_size_bytes: uploadResult.fileSize,
          mime_type: uploadResult.mimeType,
          title: uploadModuleDto.title || module.title,
          description: uploadModuleDto.description || module.description,
          is_global:
            uploadModuleDto.isGlobal !== undefined
              ? uploadModuleDto.isGlobal
              : module.is_global,
          subject_id: uploadModuleDto.subjectId || module.subject_id,
        })
        .eq('id', moduleId)
        .select()
        .single();

      if (error) {
        this.logger.error('Failed to update module with file info:', error);
        throw new BadRequestException(
          'Failed to update module with file information',
        );
      }

      // Handle section assignments
      if (uploadModuleDto.sectionIds && uploadModuleDto.sectionIds.length > 0) {
        // Remove existing assignments
        await this.supabaseService
          .getServiceClient() // Use service role to bypass RLS for trusted operations
          .from('section_modules')
          .delete()
          .eq('module_id', moduleId);

        // Add new assignments
        await this.assignModuleToSections(
          moduleId,
          uploadModuleDto.sectionIds,
          uploadedBy,
        );
      }

      this.logger.log(`Module file uploaded successfully: ${moduleId}`);

      // 🎯 CREATE ACTIVITIES - Notify students about the new module
      try {
        this.logger.log(
          `🎯 Starting activity creation for module: ${updatedModule.title}`,
        );
        this.logger.log(
          `Module is_global: ${updatedModule.is_global}, sectionIds: ${uploadModuleDto.sectionIds}`,
        );

        // Get teacher info
        const { data: teacher } = await this.supabaseService
          .getServiceClient()
          .from('users')
          .select('full_name')
          .eq('id', uploadedBy)
          .single();

        const teacherName = teacher?.full_name || 'Teacher';
        this.logger.log(`Teacher name: ${teacherName}`);

        // Get all students who should receive this module
        let studentIds: string[] = [];

        if (updatedModule.is_global) {
          // Global modules - get all students
          this.logger.log('Fetching all students for global module...');
          const { data: allStudents, error } = await this.supabaseService
            .getServiceClient()
            .from('students')
            .select('user_id');

          if (error) {
            this.logger.error('Error fetching students:', error);
          }

          studentIds = allStudents?.map((s) => s.user_id).filter(Boolean) || [];
          this.logger.log(
            `Found ${studentIds.length} students for global module`,
          );
        } else if (
          uploadModuleDto.sectionIds &&
          uploadModuleDto.sectionIds.length > 0
        ) {
          // Section-specific modules - get students from those sections
          this.logger.log(
            `Fetching students from sections: ${uploadModuleDto.sectionIds.join(', ')}`,
          );
          const { data: sectionStudents, error } = await this.supabaseService
            .getServiceClient()
            .from('students')
            .select('user_id')
            .in('section_id', uploadModuleDto.sectionIds);

          if (error) {
            this.logger.error('Error fetching section students:', error);
          }

          studentIds =
            sectionStudents?.map((s) => s.user_id).filter(Boolean) || [];
          this.logger.log(`Found ${studentIds.length} students in sections`);
        } else {
          this.logger.warn(
            '⚠️ No sectionIds provided and module is not global - no students will be notified!',
          );
        }

        // Create activity for each student (limit to first 100 to avoid overload)
        const limitedStudentIds = studentIds.slice(0, 100);
        this.logger.log(
          `📝 Creating activities for ${limitedStudentIds.length} students`,
        );

        for (const studentId of limitedStudentIds) {
          try {
            await this.studentActivitiesService.create({
              studentUserId: studentId,
              activityType: ActivityType.MODULE_UPLOADED_BY_TEACHER,
              title: `${teacherName} uploaded ${updatedModule.title}`,
              description: 'New learning material available',
              metadata: {
                module_id: updatedModule.id,
                module_title: updatedModule.title,
                teacher_name: teacherName,
                teacher_id: uploadedBy,
              },
              relatedEntityId: updatedModule.id,
              relatedEntityType: 'module',
              icon: 'BookOpen',
              color: 'text-purple-500',
            });
          } catch (activityError) {
            // Don't fail upload if activity creation fails for a student
            this.logger.error(
              `Failed to create activity for student ${studentId}:`,
              activityError,
            );
          }
        }
      } catch (activityError) {
        // Don't fail the upload if activity creation fails
        this.logger.error(
          'Failed to create module upload activities:',
          activityError,
        );
      }

      return {
        module: updatedModule,
        uploadResult,
      };
    } catch (error) {
      this.logger.error('Error uploading module file:', error);
      throw error;
    }
  }

  /**
   * Find all modules with pagination and filtering
   */
  async findAll(
    query: ModuleQueryDto,
    userId: string,
  ): Promise<ModuleListResult> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        subjectId,
        sectionId,
        isGlobal,
        uploadedBy,
        includeDeleted = false,
        sortBy = 'created_at',
        sortOrder = 'desc',
      } = query;

      let queryBuilder = this.supabaseService.getServiceClient().from('modules')
        .select(`
          *,
          uploader:users!modules_uploaded_by_fkey(id, full_name, email),
          subject:subjects!modules_subject_id_fkey(id, subject_name, description),
          sections:section_modules(
            section:sections!section_modules_section_id_fkey(id, name, grade_level)
          )
        `);

      // Apply filters
      if (!includeDeleted) {
        queryBuilder = queryBuilder.eq('is_deleted', false);
      }

      if (search) {
        queryBuilder = queryBuilder.or(
          `title.ilike.%${search}%,description.ilike.%${search}%`,
        );
      }

      if (subjectId) {
        queryBuilder = queryBuilder.eq('subject_id', subjectId);
      }

      if (isGlobal !== undefined) {
        queryBuilder = queryBuilder.eq('is_global', isGlobal);
      }

      if (uploadedBy) {
        queryBuilder = queryBuilder.eq('uploaded_by', uploadedBy);
      }

      if (sectionId) {
        queryBuilder = queryBuilder.eq('section_modules.section_id', sectionId);
      }

      // Apply sorting
      queryBuilder = queryBuilder.order(sortBy, {
        ascending: sortOrder === 'asc',
      });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      queryBuilder = queryBuilder.range(from, to);

      const { data: modules, error, count } = await queryBuilder;

      if (error) {
        this.logger.error('Failed to fetch modules:', error);
        throw new BadRequestException('Failed to fetch modules');
      }

      // Get download stats for each module
      const modulesWithStats = await Promise.all(
        (modules || []).map(async (module) => {
          const downloadStats =
            await this.moduleDownloadLoggerService.getModuleDownloadStats(
              module.id,
            );
          return {
            ...module,
            downloadStats,
          };
        }),
      );

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        modules: modulesWithStats,
        total: count || 0,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      this.logger.error('Error fetching modules:', error);
      throw error;
    }
  }

  /**
   * Find a single module by ID
   */
  async findOne(id: string): Promise<Module | null> {
    try {
      const { data: module, error } = await this.supabaseService
        .getServiceClient()
        .from('modules')
        .select(
          `
          *,
          uploader:users!modules_uploaded_by_fkey(id, full_name, email),
          subject:subjects!modules_subject_id_fkey(id, subject_name, description),
          sections:section_modules(
            section:sections!section_modules_section_id_fkey(id, name, grade_level)
          )
        `,
        )
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        this.logger.error('Failed to fetch module:', error);
        throw new BadRequestException('Failed to fetch module');
      }

      return module;
    } catch (error) {
      this.logger.error('Error fetching module:', error);
      throw error;
    }
  }

  /**
   * Update a module
   */
  async update(
    id: string,
    updateModuleDto: UpdateModuleDto,
    userId: string,
  ): Promise<Module> {
    try {
      const module = await this.findOne(id);
      if (!module) {
        throw new NotFoundException('Module not found');
      }

      // Check if user can update this module
      const canUpdate = await this.canUserUpdateModule(module, userId);
      if (!canUpdate) {
        throw new ForbiddenException(
          'You do not have permission to update this module',
        );
      }

      const updateData: any = {
        title: updateModuleDto.title,
        description: updateModuleDto.description,
        is_global: updateModuleDto.isGlobal,
        subject_id: updateModuleDto.subjectId,
      };

      const { data: updatedModule, error } = await this.supabaseService
        .getServiceClient() // Use service role to bypass RLS for trusted operations
        .from('modules')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.logger.error('Failed to update module:', error);
        throw new BadRequestException('Failed to update module');
      }

      // Handle section assignments if provided
      if (updateModuleDto.sectionIds) {
        // Remove existing assignments
        await this.supabaseService
          .getServiceClient() // Use service role to bypass RLS for trusted operations
          .from('section_modules')
          .delete()
          .eq('module_id', id);

        // Add new assignments
        if (updateModuleDto.sectionIds.length > 0) {
          await this.assignModuleToSections(
            id,
            updateModuleDto.sectionIds,
            userId,
          );
        }
      }

      this.logger.log(`Module updated successfully: ${id}`);
      return updatedModule;
    } catch (error) {
      this.logger.error('Error updating module:', error);
      throw error;
    }
  }

  /**
   * Soft delete a module
   */
  async remove(id: string, userId: string): Promise<void> {
    try {
      const module = await this.findOne(id);
      if (!module) {
        throw new NotFoundException('Module not found');
      }

      // Check if user can delete this module
      const canDelete = await this.canUserDeleteModule(module, userId);
      if (!canDelete) {
        throw new ForbiddenException(
          'You do not have permission to delete this module',
        );
      }

      const { error } = await this.supabaseService
        .getServiceClient() // Use service role to bypass RLS for trusted operations
        .from('modules')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: userId,
        })
        .eq('id', id);

      if (error) {
        this.logger.error('Failed to delete module:', error);
        throw new BadRequestException('Failed to delete module');
      }

      this.logger.log(`Module soft deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error('Error deleting module:', error);
      throw error;
    }
  }

  /**
   * Generate download URL for a module
   */
  async generateDownloadUrl(
    moduleId: string,
    userId: string,
  ): Promise<{
    downloadUrl?: string;
    slideUrls?: string[];
    fileType: 'pdf' | 'pptx';
    expiresAt: string;
  }> {
    try {
      const module = await this.findOne(moduleId);
      if (!module) {
        throw new NotFoundException('Module not found');
      }

      if (!module.r2_file_key) {
        throw new BadRequestException('Module file not found');
      }

      // Allow anyone to download modules - no access restrictions

      // Generate presigned URL using the r2_file_key directly
      const downloadResult =
        await this.moduleStorageService.generateDownloadUrl(
          module.id,
          module.r2_file_key,
          userId,
        );

      // Log download attempt
      await this.moduleDownloadLoggerService.logDownload(
        moduleId,
        userId,
        true,
      );

      return {
        downloadUrl: downloadResult.downloadUrl || undefined,
        slideUrls: downloadResult.slideUrls || undefined,
        fileType: downloadResult.fileType,
        expiresAt: downloadResult.expiresAt,
      };
    } catch (error) {
      this.logger.error('Error generating download URL:', error);
      throw error;
    }
  }

  /**
   * Assign module to sections
   */
  async assignModuleToSections(
    moduleId: string,
    sectionIds: string[],
    assignedBy: string,
  ): Promise<void> {
    try {
      // Debug logging
      console.log('[MODULES SERVICE] assignModuleToSections called with:');
      console.log('  moduleId:', moduleId);
      console.log('  sectionIds:', sectionIds);
      console.log('  sectionIds type:', typeof sectionIds);
      console.log('  sectionIds isArray:', Array.isArray(sectionIds));
      console.log('  assignedBy:', assignedBy);

      const assignments = sectionIds.map((sectionId) => ({
        module_id: moduleId,
        section_id: sectionId,
        assigned_by: assignedBy,
        visible: true,
      }));

      console.log('[MODULES SERVICE] Generated assignments:', assignments);

      const { error } = await this.supabaseService
        .getServiceClient() // Use service role to bypass RLS for trusted operations
        .from('section_modules')
        .insert(assignments);

      if (error) {
        this.logger.error('Failed to assign module to sections:', error);
        throw new BadRequestException('Failed to assign module to sections');
      }

      this.logger.log(
        `Module assigned to ${sectionIds.length} sections: ${moduleId}`,
      );

      // 🎯 CREATE ACTIVITIES - Notify students about the module
      try {
        this.logger.log(
          `🎯 Starting activity creation for module assignment: ${moduleId}`,
        );

        // Get module details including file info
        const { data: module } = await this.supabaseService
          .getServiceClient()
          .from('modules')
          .select('title, r2_file_key, file_url, mime_type')
          .eq('id', moduleId)
          .single();

        // Extract filename from r2_file_key (e.g., "modules/.../16c8fb69-...-module-1761632334361.pdf")
        let fileName = module?.title || 'New Module';
        if (module?.r2_file_key) {
          const pathParts = module.r2_file_key.split('/');
          const fullFileName = pathParts[pathParts.length - 1]; // e.g., "16c8fb69-b418-478f-82fb-5853f588e7a8-module-1761632334361.pdf"

          // Remove UUID prefix and timestamp: "16c8fb69-...-module-1761632334361.pdf" -> "module.pdf"
          // Pattern: UUID-originalname-timestamp.ext -> originalname.ext
          const match = fullFileName.match(/^[a-f0-9-]+-(.+?)-\d+(\.[^.]+)$/);
          if (match) {
            fileName = match[1] + match[2]; // originalname + extension
          } else {
            // Fallback: just use the full filename
            fileName = fullFileName;
          }
        }

        this.logger.log(
          `📄 Module file info: ${JSON.stringify({
            title: module?.title,
            r2_file_key: module?.r2_file_key,
            fileName: fileName,
            file_url: module?.file_url,
            mime_type: module?.mime_type,
          })}`,
        );

        // Get teacher info
        const { data: teacher } = await this.supabaseService
          .getServiceClient()
          .from('users')
          .select('full_name')
          .eq('id', assignedBy)
          .single();

        const teacherName = teacher?.full_name || 'Teacher';
        const moduleTitle = module?.title || 'New Module';

        this.logger.log(`Module: "${moduleTitle}", Teacher: ${teacherName}`);
        this.logger.log(
          `Fetching students from sections: ${sectionIds.join(', ')}`,
        );

        // Get all students in the assigned sections
        // Join with users to ensure we only get students with valid auth accounts
        const { data: sectionStudents, error: studentError } =
          await this.supabaseService
            .getServiceClient()
            .from('students')
            .select('user_id, users!inner(id)')
            .in('section_id', sectionIds)
            .not('user_id', 'is', null);

        if (studentError) {
          this.logger.error('Error fetching section students:', studentError);
        }

        const studentIds =
          sectionStudents?.map((s) => s.user_id).filter(Boolean) || [];
        this.logger.log(
          `Filtered to ${studentIds.length} students with valid user accounts`,
        );
        this.logger.log(`Found ${studentIds.length} students in sections`);

        // Create activity for each student (limit to 100)
        const limitedStudentIds = studentIds.slice(0, 100);
        this.logger.log(
          `📝 Creating activities for ${limitedStudentIds.length} students`,
        );

        for (const studentId of limitedStudentIds) {
          try {
            await this.studentActivitiesService.create({
              studentUserId: studentId,
              activityType: ActivityType.MODULE_UPLOADED_BY_TEACHER,
              title: `${teacherName} uploaded ${moduleTitle}`,
              description: 'New learning material available',
              metadata: {
                module_id: moduleId,
                module_title: moduleTitle,
                teacher_name: teacherName,
                teacher_id: assignedBy,
                file_name: fileName,
                file_url: module?.file_url,
                file_type: module?.mime_type,
              },
              relatedEntityId: moduleId,
              relatedEntityType: 'module',
              icon: 'BookOpen',
              color: 'text-purple-500',
            });
          } catch (activityError) {
            this.logger.error(
              `Failed to create activity for student ${studentId}:`,
              activityError,
            );
          }
        }
      } catch (activityError) {
        this.logger.error(
          'Failed to create module assignment activities:',
          activityError,
        );
      }
    } catch (error) {
      this.logger.error('Error assigning module to sections:', error);
      throw error;
    }
  }

  /**
   * Update module assignment visibility
   */
  async updateModuleAssignment(
    moduleId: string,
    sectionId: string,
    updateDto: UpdateModuleAssignmentDto,
    userId: string,
  ): Promise<void> {
    try {
      const { error } = await this.supabaseService
        .getServiceClient() // Use service role to bypass RLS for trusted operations
        .from('section_modules')
        .update({
          visible: updateDto.visible,
        })
        .eq('module_id', moduleId)
        .eq('section_id', sectionId);

      if (error) {
        this.logger.error('Failed to update module assignment:', error);
        throw new BadRequestException('Failed to update module assignment');
      }

      this.logger.log(`Module assignment updated: ${moduleId} -> ${sectionId}`);
    } catch (error) {
      this.logger.error('Error updating module assignment:', error);
      throw error;
    }
  }

  /**
   * Get modules accessible to a user
   */
  async findAccessibleModules(
    userId: string,
    query: ModuleQueryDto,
  ): Promise<ModuleListResult> {
    try {
      // Ensure default values
      const page = query.page || 1;
      const limit = query.limit || 10;

      // Get user role and related data
      const userRole = await this.getUserRole(userId);

      if (userRole === 'Admin') {
        // Admins can see all modules
        return this.findAll(query, userId);
      } else if (userRole === 'Teacher') {
        // Teachers can see global modules for their subject and their own modules
        const teacherSubject =
          await this.moduleAccessService.getTeacherSubjectId(userId);

        let queryBuilder = this.supabaseService
          .getClient()
          .from('modules')
          .select(
            `
            *,
            uploader:users!modules_uploaded_by_fkey(id, full_name, email),
            subject:subjects!modules_subject_id_fkey(id, subject_name, description)
          `,
          );

        // If sectionId is provided, show modules assigned to that section
        if (query.sectionId) {
          console.log(
            '[MODULES SERVICE] Filtering by sectionId:',
            query.sectionId,
          );

          // Get modules assigned to this specific section
          const { data: sectionModules, error: sectionError } =
            await this.supabaseService
              .getClient()
              .from('section_modules')
              .select('module_id')
              .eq('section_id', query.sectionId)
              .eq('visible', true);

          console.log('[MODULES SERVICE] Section modules query result:', {
            sectionModules,
            sectionError,
          });

          if (sectionError) {
            console.error(
              '[MODULES SERVICE] Error fetching section modules:',
              sectionError,
            );
            throw new BadRequestException('Failed to fetch section modules');
          }

          if (sectionModules && sectionModules.length > 0) {
            const moduleIds = sectionModules.map((sm) => sm.module_id);
            console.log('[MODULES SERVICE] Module IDs for section:', moduleIds);
            queryBuilder = queryBuilder.in('id', moduleIds);
          } else {
            console.log(
              '[MODULES SERVICE] No modules found for section, returning empty result',
            );
            // No modules assigned to this section - return empty result
            queryBuilder = queryBuilder.eq(
              'id',
              '00000000-0000-0000-0000-000000000000',
            ); // Non-existent ID
          }
        } else {
          // No sectionId - show teacher's own modules and global modules for their subject
          if (teacherSubject) {
            // Teacher has a subject specialization
            queryBuilder = queryBuilder.or(
              `uploaded_by.eq.${userId},is_global.eq.true.and.subject_id.eq.${teacherSubject}`,
            );
          } else {
            // Teacher has no subject specialization - can only see their own modules
            queryBuilder = queryBuilder.eq('uploaded_by', userId);
          }
        }

        queryBuilder = queryBuilder.eq('is_deleted', false);

        // Apply other filters
        if (query.search) {
          queryBuilder = queryBuilder.or(
            `title.ilike.%${query.search}%,description.ilike.%${query.search}%`,
          );
        }

        const {
          data: modules,
          error,
          count,
        } = await queryBuilder
          .order(query.sortBy || 'created_at', {
            ascending: query.sortOrder === 'asc',
          })
          .range((page - 1) * limit, page * limit - 1);

        if (error) {
          this.logger.error('Failed to fetch accessible modules:', error);
          throw new BadRequestException('Failed to fetch accessible modules');
        }

        const totalPages = Math.ceil((count || 0) / limit);

        return {
          modules: modules || [],
          total: count || 0,
          page,
          limit,
          totalPages,
        };
      } else if (userRole === 'Student') {
        // Students can see modules assigned to their section
        const studentSection =
          await this.moduleAccessService.getStudentSectionId(userId);

        if (!studentSection) {
          return {
            modules: [],
            total: 0,
            page,
            limit,
            totalPages: 0,
          };
        }

        // If subjectId is provided, we need to handle both global modules and section-assigned modules
        if (query.subjectId) {
          console.log(
            '[MODULES SERVICE] Student filtering by subjectId:',
            query.subjectId,
          );

          // Create a query that gets both global modules for the subject AND section-assigned modules for the subject
          // First get global modules for this subject
          const { data: globalModules, error: globalError } =
            await this.supabaseService
              .getClient()
              .from('modules')
              .select(
                `
            *,
            uploader:users!modules_uploaded_by_fkey(id, full_name, email),
            subject:subjects!modules_subject_id_fkey(id, subject_name, description),
            section_modules(visible)
          `,
              )
              .eq('is_deleted', false)
              .eq('subject_id', query.subjectId)
              .eq('is_global', true);

          // Then get section-specific modules for this subject
          const { data: sectionModules, error: sectionError } =
            await this.supabaseService
              .getClient()
              .from('modules')
              .select(
                `
            *,
            uploader:users!modules_uploaded_by_fkey(id, full_name, email),
            subject:subjects!modules_subject_id_fkey(id, subject_name, description),
            section_modules!inner(visible)
          `,
              )
              .eq('is_deleted', false)
              .eq('subject_id', query.subjectId)
              .eq('is_global', false)
              .eq('section_modules.section_id', studentSection)
              .eq('section_modules.visible', true);

          // Combine results
          const modules = [...(globalModules || []), ...(sectionModules || [])];
          const error = globalError || sectionError;
          const count = modules.length;

          if (error) {
            this.logger.error(
              'Failed to fetch student accessible modules:',
              error,
            );
            throw new BadRequestException('Failed to fetch accessible modules');
          }

          const totalPages = Math.ceil((count || 0) / limit);

          return {
            modules: modules || [],
            total: count || 0,
            page,
            limit,
            totalPages,
          };
        } else {
          // No subjectId - show global modules and modules assigned to student's section
          let queryBuilder = this.supabaseService
            .getClient()
            .from('modules')
            .select(
              `
              *,
              uploader:users!modules_uploaded_by_fkey(id, full_name, email),
              subject:subjects!modules_subject_id_fkey(id, subject_name, description),
              section_modules!inner(visible)
            `,
            )
            .eq('section_modules.section_id', studentSection)
            .eq('section_modules.visible', true)
            .eq('is_deleted', false)
            .or('is_global.eq.true');

          // Apply other filters
          if (query.search) {
            queryBuilder = queryBuilder.or(
              `title.ilike.%${query.search}%,description.ilike.%${query.search}%`,
            );
          }

          const {
            data: modules,
            error,
            count,
          } = await queryBuilder
            .order(query.sortBy || 'created_at', {
              ascending: query.sortOrder === 'asc',
            })
            .range((page - 1) * limit, page * limit - 1);

          if (error) {
            this.logger.error(
              'Failed to fetch student accessible modules:',
              error,
            );
            throw new BadRequestException('Failed to fetch accessible modules');
          }

          const totalPages = Math.ceil((count || 0) / limit);

          return {
            modules: modules || [],
            total: count || 0,
            page,
            limit,
            totalPages,
          };
        }
      }

      return {
        modules: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    } catch (error) {
      this.logger.error('Error fetching accessible modules:', error);
      throw error;
    }
  }

  /**
   * Get user role
   */
  private async getUserRole(userId: string): Promise<string> {
    try {
      const { data: user, error } = await this.supabaseService
        .getServiceClient()
        .from('users')
        .select(
          `
          roles!inner(name)
        `,
        )
        .eq('id', userId)
        .single();

      if (error || !user) {
        throw new Error('User not found');
      }

      // Handle both single role and array of roles
      const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
      return roles[0]?.name || 'Student';
    } catch (error) {
      this.logger.error('Error getting user role:', error);
      throw new BadRequestException('Failed to get user role');
    }
  }

  /**
   * Check if user can upload to module
   */
  private async canUserUploadToModule(
    module: Module,
    userId: string,
  ): Promise<boolean> {
    const userRole = await this.getUserRole(userId);

    if (userRole === 'Admin') {
      return true;
    }

    if (userRole === 'Teacher') {
      return module.uploaded_by === userId;
    }

    return false;
  }

  /**
   * Check if user can update module
   */
  private async canUserUpdateModule(
    module: Module,
    userId: string,
  ): Promise<boolean> {
    const userRole = await this.getUserRole(userId);

    if (userRole === 'Admin') {
      return true;
    }

    if (userRole === 'Teacher') {
      return module.uploaded_by === userId;
    }

    return false;
  }

  /**
   * Check if user can delete module
   */
  private async canUserDeleteModule(
    module: Module,
    userId: string,
  ): Promise<boolean> {
    const userRole = await this.getUserRole(userId);

    if (userRole === 'Admin') {
      return true;
    }

    if (userRole === 'Teacher') {
      return module.uploaded_by === userId;
    }

    return false;
  }
}
