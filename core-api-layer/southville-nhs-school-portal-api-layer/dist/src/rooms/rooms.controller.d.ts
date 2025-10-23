import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { MoveRoomDto } from './dto/move-room.dto';
import { BulkCreateRoomsDto } from './dto/bulk-create-rooms.dto';
import { ReorderRoomsDto } from './dto/reorder-rooms.dto';
import { Room } from './entities/room.entity';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';
export declare class RoomsController {
    private readonly roomsService;
    constructor(roomsService: RoomsService);
    create(createRoomDto: CreateRoomDto, user: SupabaseUser): Promise<Room>;
    createBulk(bulkCreateDto: BulkCreateRoomsDto, user: SupabaseUser): Promise<Room[]>;
    findAll(user: SupabaseUser, page?: number, limit?: number, search?: string, status?: string, floorId?: string, buildingId?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<any>;
    findByFloor(floorId: string, user: SupabaseUser): Promise<Room[]>;
    findByBuilding(buildingId: string, user: SupabaseUser): Promise<Room[]>;
    findOne(id: string, user: SupabaseUser): Promise<Room>;
    update(id: string, updateRoomDto: UpdateRoomDto, user: SupabaseUser): Promise<Room>;
    moveRoom(id: string, moveRoomDto: MoveRoomDto, user: SupabaseUser): Promise<Room>;
    reorderRooms(floorId: string, reorderDto: ReorderRoomsDto, user: SupabaseUser): Promise<{
        message: string;
    }>;
    remove(id: string, user: SupabaseUser): Promise<{
        message: string;
    }>;
}
