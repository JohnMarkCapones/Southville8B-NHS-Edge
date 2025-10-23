export declare enum FacilityType {
    LIBRARY = "Library",
    LABORATORY = "Laboratory",
    AUDITORIUM = "Auditorium",
    GYMNASIUM = "Gymnasium",
    CAFETERIA = "Cafeteria",
    CLINIC = "Clinic",
    OFFICE = "Office",
    OUTDOOR = "Outdoor",
    OTHER = "Other"
}
export declare enum FacilityStatus {
    AVAILABLE = "Available",
    OCCUPIED = "Occupied",
    MAINTENANCE = "Maintenance",
    CLOSED = "Closed"
}
export declare class CreateCampusFacilityDto {
    name: string;
    description?: string;
    buildingId: string;
    floorId: string;
    capacity?: number;
    type: FacilityType;
    status?: FacilityStatus;
    domainId: string;
    createdBy: string;
}
