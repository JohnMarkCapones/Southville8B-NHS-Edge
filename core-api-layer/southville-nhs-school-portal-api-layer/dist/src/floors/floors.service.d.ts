import { ConfigService } from '@nestjs/config';
import { CreateFloorDto } from './dto/create-floor.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';
import { Floor } from './entities/floor.entity';
export declare class FloorsService {
    private configService;
    private readonly logger;
    private supabase;
    constructor(configService: ConfigService);
    private getSupabaseClient;
    create(createFloorDto: CreateFloorDto): Promise<Floor>;
    findAll(filters?: any): Promise<any>;
    findByBuilding(buildingId: string): Promise<Floor[]>;
    findOne(id: string): Promise<Floor>;
    update(id: string, updateFloorDto: UpdateFloorDto): Promise<Floor>;
    remove(id: string): Promise<void>;
}
