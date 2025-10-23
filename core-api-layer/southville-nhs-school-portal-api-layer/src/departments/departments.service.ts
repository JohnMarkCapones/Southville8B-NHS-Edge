import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentQueryDto } from './dto/department-query.dto';
import { AssignHeadDto } from './dto/assign-head.dto';
import { Department } from './entities/department.entity';

export interface PaginatedResult {
  data: Department[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class DepartmentsService {
  private readonly logger = new Logger(DepartmentsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async create(
    createDto: CreateDepartmentDto,
    userId: string,
  ): Promise<Department> {
    try {
      // Check for duplicate department name
      const existingDept = await this.findByName(createDto.departmentName);
      if (existingDept) {
        throw new ConflictException('Department with this name already exists');
      }

      // Validate head_id if provided
      if (createDto.headId) {
        await this.validateTeacherExists(createDto.headId);
      }

      const { data, error } = await this.supabaseService
        .getServiceClient()
        .from('departments')
        .insert({
          department_name: createDto.departmentName,
          description: createDto.description,
          head_id: createDto.headId,
          is_active: createDto.isActive ?? true,
        })
        .select(
          `
          *,
          head:head_id(id, full_name, email)
        `,
        )
        .single();

      if (error) {
        this.logger.error('Error creating department:', error);
        throw new InternalServerErrorException('Failed to create department');
      }

      this.logger.log(
        `Department created: ${data.department_name} by user ${userId}`,
      );
      return data;
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error('Error creating department:', error);
      throw new InternalServerErrorException('Failed to create department');
    }
  }

  async findAll(query: DepartmentQueryDto): Promise<PaginatedResult> {
    try {
      const { page = 1, limit = 10, isActive, search } = query;
      const offset = (page - 1) * limit;

      let supabaseQuery = this.supabaseService
        .getServiceClient()
        .from('departments')
        .select(
          `
          *,
          head:head_id(id, full_name, email)
        `,
          { count: 'exact' },
        )
        .order('created_at', { ascending: false });

      // Apply filters
      if (isActive !== undefined) {
        supabaseQuery = supabaseQuery.eq('is_active', isActive);
      }

      if (search) {
        supabaseQuery = supabaseQuery.ilike('department_name', `%${search}%`);
      }

      // Apply pagination
      supabaseQuery = supabaseQuery.range(offset, offset + limit - 1);

      const { data, error, count } = await supabaseQuery;

      if (error) {
        this.logger.error('Error fetching departments:', error);
        throw new InternalServerErrorException('Failed to fetch departments');
      }

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        data: data || [],
        total: count || 0,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      this.logger.error('Error fetching departments:', error);
      throw new InternalServerErrorException('Failed to fetch departments');
    }
  }

  async findOne(id: string): Promise<Department> {
    try {
      const { data, error } = await this.supabaseService
        .getServiceClient()
        .from('departments')
        .select(
          `
          *,
          head:head_id(id, full_name, email)
        `,
        )
        .eq('id', id)
        .single();

      if (error || !data) {
        throw new NotFoundException('Department not found');
      }

      return data;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error fetching department:', error);
      throw new InternalServerErrorException('Failed to fetch department');
    }
  }

  async findByName(name: string): Promise<Department | null> {
    try {
      const { data, error } = await this.supabaseService
        .getServiceClient()
        .from('departments')
        .select('*')
        .eq('department_name', name)
        .single();

      if (error) {
        return null;
      }

      return data;
    } catch (error) {
      this.logger.error('Error finding department by name:', error);
      return null;
    }
  }

  async update(
    id: string,
    updateDto: UpdateDepartmentDto,
    userId: string,
  ): Promise<Department> {
    try {
      // Check if department exists
      await this.findOne(id);

      // Check for duplicate name if updating name
      if (updateDto.departmentName) {
        const existingDept = await this.findByName(updateDto.departmentName);
        if (existingDept && existingDept.id !== id) {
          throw new ConflictException(
            'Department with this name already exists',
          );
        }
      }

      // Validate head_id if provided
      if (updateDto.headId) {
        await this.validateTeacherExists(updateDto.headId);
      }

      const updateData: any = {};
      if (updateDto.departmentName !== undefined) {
        updateData.department_name = updateDto.departmentName;
      }
      if (updateDto.description !== undefined) {
        updateData.description = updateDto.description;
      }
      if (updateDto.headId !== undefined) {
        updateData.head_id = updateDto.headId;
      }
      if (updateDto.isActive !== undefined) {
        updateData.is_active = updateDto.isActive;
      }

      const { data, error } = await this.supabaseService
        .getServiceClient()
        .from('departments')
        .update(updateData)
        .eq('id', id)
        .select(
          `
          *,
          head:head_id(id, full_name, email)
        `,
        )
        .single();

      if (error) {
        this.logger.error('Error updating department:', error);
        throw new InternalServerErrorException('Failed to update department');
      }

      this.logger.log(
        `Department updated: ${data.department_name} by user ${userId}`,
      );
      return data;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error('Error updating department:', error);
      throw new InternalServerErrorException('Failed to update department');
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    try {
      const department = await this.findOne(id);

      // Soft delete by setting is_active to false
      const { error } = await this.supabaseService
        .getServiceClient()
        .from('departments')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        this.logger.error('Error soft deleting department:', error);
        throw new InternalServerErrorException('Failed to delete department');
      }

      this.logger.log(
        `Department soft deleted: ${department.department_name} by user ${userId}`,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error deleting department:', error);
      throw new InternalServerErrorException('Failed to delete department');
    }
  }

  async activate(id: string, userId: string): Promise<Department> {
    try {
      const { data, error } = await this.supabaseService
        .getServiceClient()
        .from('departments')
        .update({ is_active: true })
        .eq('id', id)
        .select(
          `
          *,
          head:head_id(id, full_name, email)
        `,
        )
        .single();

      if (error || !data) {
        throw new NotFoundException('Department not found');
      }

      this.logger.log(
        `Department activated: ${data.department_name} by user ${userId}`,
      );
      return data;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error activating department:', error);
      throw new InternalServerErrorException('Failed to activate department');
    }
  }

  async deactivate(id: string, userId: string): Promise<Department> {
    try {
      const { data, error } = await this.supabaseService
        .getServiceClient()
        .from('departments')
        .update({ is_active: false })
        .eq('id', id)
        .select(
          `
          *,
          head:head_id(id, full_name, email)
        `,
        )
        .single();

      if (error || !data) {
        throw new NotFoundException('Department not found');
      }

      this.logger.log(
        `Department deactivated: ${data.department_name} by user ${userId}`,
      );
      return data;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error deactivating department:', error);
      throw new InternalServerErrorException('Failed to deactivate department');
    }
  }

  async assignHead(
    deptId: string,
    teacherId: string,
    userId: string,
  ): Promise<Department> {
    try {
      // Validate teacher exists
      await this.validateTeacherExists(teacherId);

      const { data, error } = await this.supabaseService
        .getServiceClient()
        .from('departments')
        .update({ head_id: teacherId })
        .eq('id', deptId)
        .select(
          `
          *,
          head:head_id(id, full_name, email)
        `,
        )
        .single();

      if (error || !data) {
        throw new NotFoundException('Department not found');
      }

      this.logger.log(
        `Department head assigned: ${data.department_name} to teacher ${teacherId} by user ${userId}`,
      );
      return data;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error('Error assigning department head:', error);
      throw new InternalServerErrorException(
        'Failed to assign department head',
      );
    }
  }

  private async validateTeacherExists(teacherId: string): Promise<void> {
    try {
      const { data, error } = await this.supabaseService
        .getServiceClient()
        .from('teachers')
        .select('id')
        .eq('id', teacherId)
        .single();

      if (error || !data) {
        throw new BadRequestException('Teacher not found');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Error validating teacher:', error);
      throw new BadRequestException('Failed to validate teacher');
    }
  }
}
