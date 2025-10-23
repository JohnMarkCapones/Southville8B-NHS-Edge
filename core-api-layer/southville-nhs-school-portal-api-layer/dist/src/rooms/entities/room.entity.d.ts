export declare class Room {
    id: string;
    floorId: string;
    name?: string;
    roomNumber: string;
    capacity?: number;
    status: string;
    displayOrder?: number;
    createdAt: string;
    updatedAt: string;
    floor?: {
        id: string;
        name: string;
        number: number;
        building: {
            id: string;
            buildingName: string;
            code: string;
        };
    };
    building?: {
        id: string;
        buildingName: string;
        code: string;
    };
}
