import { ConfigService } from '@nestjs/config';
import { CreateHotspotDto } from './dto/create-hotspot.dto';
import { UpdateHotspotDto } from './dto/update-hotspot.dto';
import { Hotspot } from './entities/hotspot.entity';
export declare class HotspotsService {
    private configService;
    private readonly logger;
    private supabase;
    constructor(configService: ConfigService);
    private getSupabaseClient;
    create(createHotspotDto: CreateHotspotDto): Promise<Hotspot>;
    findAll(filters?: {
        page?: number;
        limit?: number;
        locationId?: string;
    }): Promise<{
        data: Hotspot[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findByLocation(locationId: string): Promise<Hotspot[]>;
    findOne(id: string): Promise<Hotspot>;
    update(id: string, updateHotspotDto: UpdateHotspotDto): Promise<Hotspot>;
    remove(id: string): Promise<void>;
    private validateNoCircularReference;
}
