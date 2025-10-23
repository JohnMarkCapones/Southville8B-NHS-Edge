import { ConfigService } from '@nestjs/config';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { Section } from './entities/section.entity';
export declare class SectionsService {
    private configService;
    private readonly logger;
    private supabase;
    constructor(configService: ConfigService);
    private getSupabaseClient;
    create(createSectionDto: CreateSectionDto): Promise<Section>;
    findAll(filters?: any): Promise<any>;
    findOne(id: string): Promise<Section>;
    update(id: string, updateSectionDto: UpdateSectionDto): Promise<Section>;
    remove(id: string): Promise<void>;
    getSectionsByTeacher(teacherId: string): Promise<Section[]>;
    getSectionsByGradeLevel(gradeLevel: string): Promise<Section[]>;
}
