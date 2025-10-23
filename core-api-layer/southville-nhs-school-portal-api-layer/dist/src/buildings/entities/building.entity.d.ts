export declare class Building {
    id: string;
    buildingName: string;
    code: string;
    capacity?: number;
    createdAt: string;
    updatedAt: string;
    floors?: Array<{
        id: string;
        name: string;
        number: number;
        roomsCount?: number;
    }>;
    stats?: {
        totalFloors: number;
        totalRooms: number;
        totalCapacity: number;
        utilizationRate: number;
    };
}
