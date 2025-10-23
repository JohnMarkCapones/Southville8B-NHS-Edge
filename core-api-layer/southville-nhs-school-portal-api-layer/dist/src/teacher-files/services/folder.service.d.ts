import { SupabaseService } from '../../supabase/supabase.service';
import { TeacherFolder, TeacherFolderWithChildren } from '../entities/teacher-folder.entity';
import { CreateFolderDto } from '../dto/create-folder.dto';
import { UpdateFolderDto } from '../dto/update-folder.dto';
export declare class FolderService {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    findAll(includeDeleted?: boolean, accessToken?: string): Promise<TeacherFolder[]>;
    getFolderTree(includeDeleted?: boolean, accessToken?: string): Promise<TeacherFolderWithChildren[]>;
    private buildTree;
    findOne(id: string): Promise<TeacherFolder>;
    findOneWithFileCount(id: string): Promise<TeacherFolderWithChildren>;
    create(createFolderDto: CreateFolderDto, userId: string): Promise<TeacherFolder>;
    update(id: string, updateFolderDto: UpdateFolderDto, userId: string): Promise<TeacherFolder>;
    softDelete(id: string, userId: string): Promise<void>;
    restore(id: string): Promise<TeacherFolder>;
    private isDescendantOf;
}
