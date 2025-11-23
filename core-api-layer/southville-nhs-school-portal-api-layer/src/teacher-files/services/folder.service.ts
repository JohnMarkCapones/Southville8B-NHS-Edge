import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import {
  TeacherFolder,
  TeacherFolderWithChildren,
} from '../entities/teacher-folder.entity';
import { CreateFolderDto } from '../dto/create-folder.dto';
import { UpdateFolderDto } from '../dto/update-folder.dto';

@Injectable()
export class FolderService {
  private readonly logger = new Logger(FolderService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Get all folders (optionally including deleted)
   */
  async findAll(
    includeDeleted = false,
    accessToken?: string,
  ): Promise<TeacherFolder[]> {
    try {
      // Use service client to bypass RLS and get ALL folders (including nested ones)
      const client = this.supabaseService.getServiceClient();

      let query = client
        .from('teacher_folders')
        .select('*')
        .order('name', { ascending: true });

      if (!includeDeleted) {
        query = query.eq('is_deleted', false);
      }

      const { data, error } = await query;

      if (error) {
        this.logger.error('Error fetching folders:', error);
        throw new InternalServerErrorException(
          'Failed to fetch folders: ' + error.message,
        );
      }

      return data as TeacherFolder[];
    } catch (error) {
      this.logger.error('Error in findAll:', error);
      throw error;
    }
  }

  /**
   * Get folder tree structure
   */
  async getFolderTree(
    includeDeleted = false,
    accessToken?: string,
  ): Promise<TeacherFolderWithChildren[]> {
    const folders = await this.findAll(includeDeleted, accessToken);
    return this.buildTree(folders);
  }

  /**
   * Build hierarchical tree from flat folder list
   */
  private buildTree(
    folders: TeacherFolder[],
    parentId: string | null = null,
  ): TeacherFolderWithChildren[] {
    const tree: TeacherFolderWithChildren[] = [];

    for (const folder of folders) {
      if (folder.parent_id === parentId) {
        const folderWithChildren: TeacherFolderWithChildren = {
          ...folder,
          children: this.buildTree(folders, folder.id),
        };
        tree.push(folderWithChildren);
      }
    }

    return tree;
  }

  /**
   * Get folder by ID
   */
  async findOne(id: string): Promise<TeacherFolder> {
    try {
      const { data, error } = await this.supabaseService
        .getClient()
        .from('teacher_folders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundException(`Folder with ID ${id} not found`);
        }
        this.logger.error('Error fetching folder:', error);
        throw new InternalServerErrorException(
          'Failed to fetch folder: ' + error.message,
        );
      }

      return data as TeacherFolder;
    } catch (error) {
      this.logger.error('Error in findOne:', error);
      throw error;
    }
  }

  /**
   * Get folder with file count
   */
  async findOneWithFileCount(id: string): Promise<TeacherFolderWithChildren> {
    const folder = await this.findOne(id);

    // Get file count
    const { count, error } = await this.supabaseService
      .getClient()
      .from('teacher_files')
      .select('*', { count: 'exact', head: true })
      .eq('folder_id', id)
      .eq('is_deleted', false);

    if (error) {
      this.logger.warn('Error counting files:', error);
    }

    return {
      ...folder,
      file_count: count || 0,
    };
  }

  /**
   * Create new folder
   */
  async create(
    createFolderDto: CreateFolderDto,
    userId: string,
  ): Promise<TeacherFolder> {
    try {
      // Validate parent folder exists if provided
      if (createFolderDto.parent_id) {
        await this.findOne(createFolderDto.parent_id);
      }

      const { data, error } = await this.supabaseService
        .getServiceClient()
        .from('teacher_folders')
        .insert({
          name: createFolderDto.name,
          description: createFolderDto.description,
          parent_id: createFolderDto.parent_id || null,
          created_by: userId,
          updated_by: userId,
        })
        .select()
        .single();

      if (error) {
        this.logger.error('Error creating folder:', error);
        throw new InternalServerErrorException(
          'Failed to create folder: ' + error.message,
        );
      }

      return data as TeacherFolder;
    } catch (error) {
      this.logger.error('Error in create:', error);
      throw error;
    }
  }

  /**
   * Update folder
   */
  async update(
    id: string,
    updateFolderDto: UpdateFolderDto,
    userId: string,
  ): Promise<TeacherFolder> {
    try {
      // Check folder exists
      await this.findOne(id);

      // Validate parent folder if being changed
      if (updateFolderDto.parent_id) {
        // Prevent circular references
        if (updateFolderDto.parent_id === id) {
          throw new BadRequestException('Folder cannot be its own parent');
        }

        // Check if new parent exists
        await this.findOne(updateFolderDto.parent_id);

        // Check if new parent is not a descendant of current folder
        const isDescendant = await this.isDescendantOf(
          updateFolderDto.parent_id,
          id,
        );
        if (isDescendant) {
          throw new BadRequestException(
            'Cannot move folder to its own descendant',
          );
        }
      }

      const updateData: any = {
        updated_by: userId,
      };

      if (updateFolderDto.name !== undefined) {
        updateData.name = updateFolderDto.name;
      }
      if (updateFolderDto.description !== undefined) {
        updateData.description = updateFolderDto.description;
      }
      if (updateFolderDto.parent_id !== undefined) {
        updateData.parent_id = updateFolderDto.parent_id;
      }

      const { data, error } = await this.supabaseService
        .getServiceClient()
        .from('teacher_folders')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        this.logger.error('Error updating folder:', error);
        throw new InternalServerErrorException(
          'Failed to update folder: ' + error.message,
        );
      }

      return data as TeacherFolder;
    } catch (error) {
      this.logger.error('Error in update:', error);
      throw error;
    }
  }

  /**
   * Soft delete folder
   * @returns The deleted folder (for audit logging)
   */
  async softDelete(id: string, userId: string): Promise<TeacherFolder> {
    try {
      // Check folder exists and get details for audit log
      const folder = await this.findOne(id);

      // Check if folder has children
      const { data: children } = await this.supabaseService
        .getClient()
        .from('teacher_folders')
        .select('id')
        .eq('parent_id', id)
        .eq('is_deleted', false);

      if (children && children.length > 0) {
        throw new BadRequestException(
          'Cannot delete folder with child folders. Delete children first.',
        );
      }

      const { error } = await this.supabaseService
        .getServiceClient()
        .from('teacher_folders')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: userId,
        })
        .eq('id', id);

      if (error) {
        this.logger.error('Error soft deleting folder:', error);
        throw new InternalServerErrorException(
          'Failed to delete folder: ' + error.message,
        );
      }

      // Return the folder for audit logging
      return folder;
    } catch (error) {
      this.logger.error('Error in softDelete:', error);
      throw error;
    }
  }

  /**
   * Restore soft-deleted folder
   */
  async restore(id: string): Promise<TeacherFolder> {
    try {
      const { data, error } = await this.supabaseService
        .getServiceClient()
        .from('teacher_folders')
        .update({
          is_deleted: false,
          deleted_at: null,
          deleted_by: null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new NotFoundException(`Folder with ID ${id} not found`);
        }
        this.logger.error('Error restoring folder:', error);
        throw new InternalServerErrorException(
          'Failed to restore folder: ' + error.message,
        );
      }

      return data as TeacherFolder;
    } catch (error) {
      this.logger.error('Error in restore:', error);
      throw error;
    }
  }

  /**
   * Check if folder is descendant of another folder
   */
  private async isDescendantOf(
    folderId: string,
    ancestorId: string,
  ): Promise<boolean> {
    let currentFolder = await this.findOne(folderId);

    while (currentFolder.parent_id) {
      if (currentFolder.parent_id === ancestorId) {
        return true;
      }
      currentFolder = await this.findOne(currentFolder.parent_id);
    }

    return false;
  }
}
