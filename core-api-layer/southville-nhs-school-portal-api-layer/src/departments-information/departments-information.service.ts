import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CreateDepartmentsInformationDto } from './dto/create-departments-information.dto';
import { UpdateDepartmentsInformationDto } from './dto/update-departments-information.dto';
import { DepartmentInformation } from './entities/department-information.entity';

@Injectable()
export class DepartmentsInformationService {
  private readonly logger = new Logger(DepartmentsInformationService.name);
  private supabase: SupabaseClient | null = null;

  constructor(private configService: ConfigService) {}

  private getSupabaseClient(): SupabaseClient {
    if (!this.supabase) {
      const supabaseUrl = this.configService.get<string>('supabase.url');
      const supabaseServiceKey = this.configService.get<string>(
        'supabase.serviceRoleKey',
      );

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new InternalServerErrorException(
          'Database configuration is missing. Please contact administrator.',
        );
      }

      this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    }
    return this.supabase;
  }

  async create(
    createDepartmentsInformationDto: CreateDepartmentsInformationDto,
  ): Promise<DepartmentInformation> {
    const supabase = this.getSupabaseClient();

    const { data, error } = await supabase
      .from('departments_information')
      .insert({
        department_id: createDepartmentsInformationDto.departmentId,
        office_name: createDepartmentsInformationDto.officeName,
        contact_person: createDepartmentsInformationDto.contactPerson,
        description: createDepartmentsInformationDto.description,
        email: createDepartmentsInformationDto.email,
        contact_number: createDepartmentsInformationDto.contactNumber,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Error creating department information:', error);
      throw new InternalServerErrorException(
        'Failed to create department information',
      );
    }

    this.logger.log(`Created department information: ${data.office_name}`);
    return data;
  }

  async findAll(
    filters: {
      page?: number;
      limit?: number;
      departmentId?: string;
    } = {},
  ): Promise<{
    data: DepartmentInformation[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const supabase = this.getSupabaseClient();
    const { page = 1, limit = 10, departmentId } = filters;

    let query = supabase
      .from('departments_information')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: true });

    // Apply department filter if provided
    if (departmentId) {
      query = query.eq('department_id', departmentId);
    }

    // Apply pagination
    query = query.range((page - 1) * limit, page * limit - 1);

    const { data, error, count } = await query;

    if (error) {
      this.logger.error('Error fetching departments information:', error);
      throw new InternalServerErrorException(
        'Failed to fetch departments information',
      );
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages,
    };
  }

  async findByDepartment(
    departmentId: string,
  ): Promise<DepartmentInformation[]> {
    const supabase = this.getSupabaseClient();

    const { data, error } = await supabase
      .from('departments_information')
      .select('*')
      .eq('department_id', departmentId)
      .order('created_at', { ascending: true });

    if (error) {
      this.logger.error(
        'Error fetching department information by department:',
        error,
      );
      throw new InternalServerErrorException(
        'Failed to fetch department information',
      );
    }

    return data || [];
  }

  async findOne(id: string): Promise<DepartmentInformation> {
    const supabase = this.getSupabaseClient();

    const { data, error } = await supabase
      .from('departments_information')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Department information not found');
    }

    return data;
  }

  async update(
    id: string,
    updateDepartmentsInformationDto: UpdateDepartmentsInformationDto,
  ): Promise<DepartmentInformation> {
    const supabase = this.getSupabaseClient();

    // Check if department information exists
    await this.findOne(id);

    const updateData: any = {};
    if (updateDepartmentsInformationDto.departmentId !== undefined)
      updateData.department_id = updateDepartmentsInformationDto.departmentId;
    if (updateDepartmentsInformationDto.officeName !== undefined)
      updateData.office_name = updateDepartmentsInformationDto.officeName;
    if (updateDepartmentsInformationDto.contactPerson !== undefined)
      updateData.contact_person = updateDepartmentsInformationDto.contactPerson;
    if (updateDepartmentsInformationDto.description !== undefined)
      updateData.description = updateDepartmentsInformationDto.description;
    if (updateDepartmentsInformationDto.email !== undefined)
      updateData.email = updateDepartmentsInformationDto.email;
    if (updateDepartmentsInformationDto.contactNumber !== undefined)
      updateData.contact_number = updateDepartmentsInformationDto.contactNumber;

    const { data, error } = await supabase
      .from('departments_information')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error('Error updating department information:', error);
      throw new InternalServerErrorException(
        'Failed to update department information',
      );
    }

    this.logger.log(`Updated department information: ${data.office_name}`);
    return data;
  }

  async remove(id: string): Promise<void> {
    const supabase = this.getSupabaseClient();

    // Check if department information exists
    await this.findOne(id);

    const { error } = await supabase
      .from('departments_information')
      .delete()
      .eq('id', id);

    if (error) {
      this.logger.error('Error deleting department information:', error);
      throw new InternalServerErrorException(
        'Failed to delete department information',
      );
    }

    this.logger.log(`Deleted department information with ID: ${id}`);
  }
}
