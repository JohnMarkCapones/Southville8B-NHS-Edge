export declare enum RoomStatus {
    AVAILABLE = "Available",
    OCCUPIED = "Occupied",
    MAINTENANCE = "Maintenance"
}
export declare class CreateRoomDto {
    floorId: string;
    name?: string;
    capacity?: number;
    status?: RoomStatus;
}
