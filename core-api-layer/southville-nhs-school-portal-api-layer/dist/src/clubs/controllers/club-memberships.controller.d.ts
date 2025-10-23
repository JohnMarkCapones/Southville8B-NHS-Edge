import { ClubMembershipsService } from '../services/club-memberships.service';
import { CreateClubMembershipDto } from '../dto/create-club-membership.dto';
import { UpdateClubMembershipDto } from '../dto/update-club-membership.dto';
import { ClubMembership } from '../models/club-membership.model';
export declare class ClubMembershipsController {
    private readonly service;
    constructor(service: ClubMembershipsService);
    create(createDto: CreateClubMembershipDto, userId: string): Promise<ClubMembership>;
    findAll(clubId?: string): Promise<ClubMembership[]>;
    findByStudent(studentId: string): Promise<ClubMembership[]>;
    findOne(id: string): Promise<ClubMembership>;
    update(id: string, updateDto: UpdateClubMembershipDto, userId: string): Promise<ClubMembership>;
    remove(id: string, userId: string): Promise<void>;
}
