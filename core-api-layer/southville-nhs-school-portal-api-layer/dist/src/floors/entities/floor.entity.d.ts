export declare class Floor {
    id: string;
    buildingId: string;
    name: string;
    number: number;
    createdAt: string;
    updatedAt: string;
    building?: {
        id: string;
        buildingName: string;
        code: string;
    };
    rooms?: Array<{
        id: string;
        roomNumber: string;
        name: string;
        capacity: number;
        status: string;
    }>;
}
