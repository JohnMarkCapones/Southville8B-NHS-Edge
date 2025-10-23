import { ConfigService } from '@nestjs/config';
import { CreateCampusFacilityDto } from './dto/create-campus-facility.dto';
import { UpdateCampusFacilityDto } from './dto/update-campus-facility.dto';
import { CampusFacility } from './entities/campus-facility.entity';
export declare class CampusFacilitiesService {
    private configService;
    private readonly logger;
    private supabase;
    constructor(configService: ConfigService);
    private getSupabaseClient;
    create(createCampusFacilityDto: CreateCampusFacilityDto, imageFile?: any): Promise<CampusFacility>;
    findAll(filters?: any): Promise<any>;
    findOne(id: string): Promise<CampusFacility>;
    update(id: string, updateCampusFacilityDto: UpdateCampusFacilityDto, imageFile?: any): Promise<CampusFacility>;
    remove(id: string): Promise<void>;
    private uploadImage;
    private mapDbToDto;
    private deleteImage;
}
