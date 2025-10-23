import { JournalismMembershipService } from '../services/journalism-membership.service';
import { AddMemberDto, UpdateMemberPositionDto } from '../dto';
export declare class JournalismMembershipController {
    private readonly membershipService;
    constructor(membershipService: JournalismMembershipService);
    getAllMembers(): Promise<any[]>;
    getMember(userId: string): Promise<any>;
    addMember(addMemberDto: AddMemberDto, user: any): Promise<any>;
    updatePosition(userId: string, updateDto: UpdateMemberPositionDto, user: any): Promise<any>;
    removeMember(userId: string, user: any): Promise<void>;
}
