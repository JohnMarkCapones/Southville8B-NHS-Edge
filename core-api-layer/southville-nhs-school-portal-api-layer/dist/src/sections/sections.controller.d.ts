import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { Section } from './entities/section.entity';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';
export declare class SectionsController {
    private readonly sectionsService;
    private readonly logger;
    constructor(sectionsService: SectionsService);
    create(createSectionDto: CreateSectionDto, user: SupabaseUser): Promise<Section>;
    findAll(user: SupabaseUser, page?: number, limit?: number, search?: string, gradeLevel?: string, teacherId?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<any>;
    getSectionsByTeacher(teacherId: string, user: SupabaseUser): Promise<Section[]>;
    getSectionsByGradeLevel(gradeLevel: string, user: SupabaseUser): Promise<Section[]>;
    findOne(id: string, user: SupabaseUser): Promise<Section>;
    update(id: string, updateSectionDto: UpdateSectionDto, user: SupabaseUser): Promise<Section>;
    remove(id: string, user: SupabaseUser): Promise<{
        message: string;
    }>;
}
