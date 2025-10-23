import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { QueryAlertDto } from './dto/query-alert.dto';
import { Alert } from './entities/alert.entity';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';
export declare class AlertsController {
    private readonly alertsService;
    private readonly logger;
    constructor(alertsService: AlertsService);
    create(createAlertDto: CreateAlertDto, user: SupabaseUser): Promise<Alert>;
    findAll(queryDto: QueryAlertDto): Promise<{
        data: Alert[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<Alert>;
    update(id: string, updateAlertDto: UpdateAlertDto, user: SupabaseUser): Promise<Alert>;
    remove(id: string, user: SupabaseUser): Promise<{
        message: string;
    }>;
}
