import { ConfigService } from '@nestjs/config';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { MoveRoomDto } from './dto/move-room.dto';
import { BulkCreateRoomsDto } from './dto/bulk-create-rooms.dto';
import { ReorderRoomsDto } from './dto/reorder-rooms.dto';
import { Room } from './entities/room.entity';
export declare class RoomsService {
    private configService;
    private readonly logger;
    private supabase;
    constructor(configService: ConfigService);
    private getSupabaseClient;
    getNextRoomNumber(floorId: string): Promise<string>;
    create(createRoomDto: CreateRoomDto): Promise<Room>;
    createBulk(bulkCreateDto: BulkCreateRoomsDto): Promise<Room[]>;
    findAll(filters?: any): Promise<any>;
    findByFloor(floorId: string): Promise<Room[]>;
    findByBuilding(buildingId: string): Promise<Room[]>;
    findOne(id: string): Promise<Room>;
    update(id: string, updateRoomDto: UpdateRoomDto): Promise<Room>;
    moveRoom(id: string, moveRoomDto: MoveRoomDto): Promise<Room>;
    reorderRooms(floorId: string, reorderDto: ReorderRoomsDto): Promise<void>;
    remove(id: string): Promise<void>;
}
