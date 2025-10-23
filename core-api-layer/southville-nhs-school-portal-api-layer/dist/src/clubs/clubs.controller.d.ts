import { ClubsService } from './clubs.service';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';
export declare class ClubsController {
    private readonly clubsService;
    constructor(clubsService: ClubsService);
    create(createClubDto: CreateClubDto): Promise<any>;
    findAll(): Promise<any[]>;
    findOne(clubId: string): Promise<any>;
    update(clubId: string, updateClubDto: UpdateClubDto): Promise<any>;
    remove(clubId: string): Promise<void>;
    getMembers(clubId: string): Promise<any[]>;
    addMember(clubId: string, memberData: any): Promise<any>;
    updateFinances(clubId: string, financesData: any): Promise<any>;
}
