import { BuildingsService } from './buildings.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { Building } from './entities/building.entity';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';
export declare class BuildingsController {
    private readonly buildingsService;
    private readonly logger;
    constructor(buildingsService: BuildingsService);
    create(createBuildingDto: CreateBuildingDto, user: SupabaseUser): Promise<Building>;
    findAll(user: SupabaseUser, page?: number, limit?: number, search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<any>;
    findOne(id: string, user: SupabaseUser): Promise<Building>;
    getStats(id: string, user: SupabaseUser): Promise<any>;
    update(id: string, updateBuildingDto: UpdateBuildingDto, user: SupabaseUser): Promise<Building>;
    remove(id: string, user: SupabaseUser): Promise<{
        message: string;
    }>;
}
