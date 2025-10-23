import { ConfigService } from '@nestjs/config';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location } from './entities/location.entity';
export declare class LocationsService {
    private configService;
    private readonly logger;
    private supabase;
    constructor(configService: ConfigService);
    private getSupabaseClient;
    create(createLocationDto: CreateLocationDto): Promise<Location>;
    findAll(filters?: {
        page?: number;
        limit?: number;
        imageType?: string;
    }): Promise<{
        data: Location[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<Location>;
    findWithHotspots(id: string): Promise<Location>;
    update(id: string, updateLocationDto: UpdateLocationDto): Promise<Location>;
    remove(id: string): Promise<void>;
    uploadImage(file: Express.Multer.File, locationId: string, imageType: 'main' | 'preview'): Promise<{
        url: string;
        path: string;
    }>;
    deleteImage(imagePath: string, locationId: string): Promise<void>;
    updateLocationWithImage(id: string, updateLocationDto: UpdateLocationDto, mainImage?: Express.Multer.File, previewImage?: Express.Multer.File): Promise<Location>;
}
