import { ConfigService } from '@nestjs/config';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { Building } from './entities/building.entity';
export declare class BuildingsService {
    private configService;
    private readonly logger;
    private supabase;
    constructor(configService: ConfigService);
    private getSupabaseClient;
    create(createBuildingDto: CreateBuildingDto): Promise<Building>;
    findAll(filters?: any): Promise<any>;
    findOne(id: string): Promise<Building>;
    update(id: string, updateBuildingDto: UpdateBuildingDto): Promise<Building>;
    remove(id: string): Promise<void>;
    getBuildingStats(id: string): Promise<any>;
}
