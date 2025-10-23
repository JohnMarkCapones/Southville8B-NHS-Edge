import { SupabaseService } from '../supabase/supabase.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
export declare class ClubsService {
    private readonly supabaseService;
    private readonly logger;
    constructor(supabaseService: SupabaseService);
    create(createClubDto: CreateClubDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateClubDto: UpdateClubDto): Promise<any>;
    remove(id: string): Promise<void>;
    getMembers(clubId: string): Promise<any[]>;
    addMember(clubId: string, memberData: any): Promise<any>;
    updateFinances(clubId: string, financesData: any): Promise<any>;
}
