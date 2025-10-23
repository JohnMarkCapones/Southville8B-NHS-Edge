import { FloorsService } from './floors.service';
import { CreateFloorDto } from './dto/create-floor.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';
import { Floor } from './entities/floor.entity';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';
export declare class FloorsController {
    private readonly floorsService;
    constructor(floorsService: FloorsService);
    create(createFloorDto: CreateFloorDto, user: SupabaseUser): Promise<Floor>;
    findAll(user: SupabaseUser, page?: number, limit?: number, search?: string, buildingId?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<any>;
    findByBuilding(buildingId: string, user: SupabaseUser): Promise<Floor[]>;
    findOne(id: string, user: SupabaseUser): Promise<Floor>;
    update(id: string, updateFloorDto: UpdateFloorDto, user: SupabaseUser): Promise<Floor>;
    remove(id: string, user: SupabaseUser): Promise<{
        message: string;
    }>;
}
