import { SupabaseService } from '../supabase/supabase.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentQueryDto } from './dto/department-query.dto';
import { Department } from './entities/department.entity';
export interface PaginatedResult {
    data: Department[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class DepartmentsService {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    create(createDto: CreateDepartmentDto, userId: string): Promise<Department>;
    findAll(query: DepartmentQueryDto): Promise<PaginatedResult>;
    findOne(id: string): Promise<Department>;
    findByName(name: string): Promise<Department | null>;
    update(id: string, updateDto: UpdateDepartmentDto, userId: string): Promise<Department>;
    remove(id: string, userId: string): Promise<void>;
    activate(id: string, userId: string): Promise<Department>;
    deactivate(id: string, userId: string): Promise<Department>;
    assignHead(deptId: string, teacherId: string, userId: string): Promise<Department>;
    private validateTeacherExists;
}
