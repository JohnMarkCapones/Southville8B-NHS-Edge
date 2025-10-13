import {
  IsString,
  IsUUID,
  IsNumber,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum RoomStatus {
  AVAILABLE = 'Available',
  OCCUPIED = 'Occupied',
  MAINTENANCE = 'Maintenance',
}

export class CreateRoomDto {
  @IsUUID()
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Floor ID',
  })
  floorId: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  @ApiProperty({
    example: 'Room 101',
    description: 'Room name',
    required: false,
    minLength: 2,
    maxLength: 255,
  })
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @ApiProperty({
    example: 30,
    description: 'Room capacity',
    required: false,
    minimum: 0,
  })
  capacity?: number;

  @IsOptional()
  @IsEnum(RoomStatus)
  @ApiProperty({
    enum: RoomStatus,
    example: RoomStatus.AVAILABLE,
    description: 'Room status',
    required: false,
  })
  status?: RoomStatus;
}
