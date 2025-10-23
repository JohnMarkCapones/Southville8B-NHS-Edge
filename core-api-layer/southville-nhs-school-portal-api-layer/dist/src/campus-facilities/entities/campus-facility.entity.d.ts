import { FacilityType, FacilityStatus } from '../dto/create-campus-facility.dto';
export declare class CampusFacility {
    id: string;
    name: string;
    imageUrl?: string;
    description?: string;
    buildingId: string;
    floorId: string;
    capacity?: number;
    type: FacilityType;
    status?: FacilityStatus;
    domainId: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}
