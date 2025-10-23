import { HotspotsService } from './hotspots.service';
import { CreateHotspotDto } from './dto/create-hotspot.dto';
import { UpdateHotspotDto } from './dto/update-hotspot.dto';
import { Hotspot } from './entities/hotspot.entity';
export declare class HotspotsController {
    private readonly hotspotsService;
    constructor(hotspotsService: HotspotsService);
    create(createHotspotDto: CreateHotspotDto): Promise<Hotspot>;
    findAll(page?: number, limit?: number, locationId?: string): Promise<{
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
}
