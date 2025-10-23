import { SupabaseService } from '../../supabase/supabase.service';
import { AddMemberDto, UpdateMemberPositionDto } from '../dto';
export declare class JournalismMembershipService {
    private readonly supabaseService;
    private readonly logger;
    private readonly STUDENT_POSITIONS;
    private readonly TEACHER_POSITIONS;
    private readonly UNIQUE_POSITIONS;
    constructor(supabaseService: SupabaseService);
    private getJournalismDomainId;
    private getDomainRoleId;
    private isAdmin;
    private isAdviser;
    private canAssignPosition;
    private checkUniquePosition;
    addMember(addMemberDto: AddMemberDto, requesterId: string): Promise<any>;
    updateMemberPosition(userId: string, updateDto: UpdateMemberPositionDto, requesterId: string): Promise<any>;
    removeMember(userId: string, requesterId: string): Promise<void>;
    getAllMembers(): Promise<any[]>;
    getMember(userId: string): Promise<any>;
}
