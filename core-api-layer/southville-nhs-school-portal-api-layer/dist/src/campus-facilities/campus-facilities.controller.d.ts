import { CampusFacilitiesService } from './campus-facilities.service';
import { CreateCampusFacilityDto, FacilityType, FacilityStatus } from './dto/create-campus-facility.dto';
import { UpdateCampusFacilityDto } from './dto/update-campus-facility.dto';
import { CampusFacility } from './entities/campus-facility.entity';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';
export declare class CampusFacilitiesController {
    private readonly campusFacilitiesService;
    private readonly logger;
    constructor(campusFacilitiesService: CampusFacilitiesService);
    create(createCampusFacilityDto: CreateCampusFacilityDto, imageFile?: any, user?: SupabaseUser): Promise<CampusFacility>;
    findAll(user: SupabaseUser, page?: number, limit?: number, search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc', buildingId?: string, floorId?: string, type?: FacilityType, status?: FacilityStatus, domainId?: string): Promise<any>;
    findOne(id: string, user: SupabaseUser): Promise<CampusFacility>;
    update(id: string, updateCampusFacilityDto: UpdateCampusFacilityDto, imageFile?: any, user?: SupabaseUser): Promise<CampusFacility>;
    remove(id: string, user: SupabaseUser): Promise<{
        message: string;
    }>;
}
