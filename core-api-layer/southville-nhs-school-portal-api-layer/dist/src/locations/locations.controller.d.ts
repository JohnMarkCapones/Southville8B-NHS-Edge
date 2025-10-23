import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location } from './entities/location.entity';
export declare class LocationsController {
    private readonly locationsService;
    constructor(locationsService: LocationsService);
    create(createLocationDto: CreateLocationDto): Promise<Location>;
    findAll(page?: number, limit?: number, imageType?: string): Promise<{
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
    uploadMainImage(id: string, file: Express.Multer.File): Promise<{
        url: string;
        path: string;
    }>;
    uploadPreviewImage(id: string, file: Express.Multer.File): Promise<{
        url: string;
        path: string;
    }>;
    uploadImages(id: string, updateLocationDto: UpdateLocationDto, files: Express.Multer.File[]): Promise<Location>;
    deleteImage(id: string, imagePath: string): Promise<void>;
}
