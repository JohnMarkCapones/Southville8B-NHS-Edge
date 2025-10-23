import { ConfigService } from '@nestjs/config';
import { CreateDepartmentsInformationDto } from './dto/create-departments-information.dto';
import { UpdateDepartmentsInformationDto } from './dto/update-departments-information.dto';
import { DepartmentInformation } from './entities/department-information.entity';
export declare class DepartmentsInformationService {
    private configService;
    private readonly logger;
    private supabase;
    constructor(configService: ConfigService);
    private getSupabaseClient;
    create(createDepartmentsInformationDto: CreateDepartmentsInformationDto): Promise<DepartmentInformation>;
    findAll(filters?: {
        page?: number;
        limit?: number;
        departmentId?: string;
    }): Promise<{
        data: DepartmentInformation[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findByDepartment(departmentId: string): Promise<DepartmentInformation[]>;
    findOne(id: string): Promise<DepartmentInformation>;
    update(id: string, updateDepartmentsInformationDto: UpdateDepartmentsInformationDto): Promise<DepartmentInformation>;
    remove(id: string): Promise<void>;
}
