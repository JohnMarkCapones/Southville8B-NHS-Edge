import { DepartmentsService, PaginatedResult } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentQueryDto } from './dto/department-query.dto';
import { AssignHeadDto } from './dto/assign-head.dto';
import { Department } from './entities/department.entity';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';
export declare class DepartmentsController {
    private readonly departmentsService;
    constructor(departmentsService: DepartmentsService);
    create(createDto: CreateDepartmentDto, user: SupabaseUser): Promise<Department>;
    findAll(query: DepartmentQueryDto): Promise<PaginatedResult>;
    findOne(id: string): Promise<Department>;
    update(id: string, updateDto: UpdateDepartmentDto, user: SupabaseUser): Promise<Department>;
    remove(id: string, user: SupabaseUser): Promise<void>;
    activate(id: string, user: SupabaseUser): Promise<Department>;
    deactivate(id: string, user: SupabaseUser): Promise<Department>;
    assignHead(id: string, dto: AssignHeadDto, user: SupabaseUser): Promise<Department>;
}
