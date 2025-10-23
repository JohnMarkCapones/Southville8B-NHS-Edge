import { ConfigService } from '@nestjs/config';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { QueryAlertDto } from './dto/query-alert.dto';
import { Alert } from './entities/alert.entity';
import { UserRole } from '../auth/decorators/roles.decorator';
export declare class AlertsService {
    private configService;
    private readonly logger;
    private supabase;
    constructor(configService: ConfigService);
    private getSupabaseClient;
    create(createAlertDto: CreateAlertDto, userId: string): Promise<Alert>;
    findAll(queryDto: QueryAlertDto, userId?: string, userRole?: UserRole): Promise<{
        data: Alert[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string, userId?: string, userRole?: UserRole): Promise<Alert>;
    update(id: string, updateAlertDto: UpdateAlertDto, userId: string): Promise<Alert>;
    remove(id: string, userId: string): Promise<void>;
}
