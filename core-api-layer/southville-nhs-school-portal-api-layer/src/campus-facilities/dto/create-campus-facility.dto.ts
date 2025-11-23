import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsUUID,
  IsInt,
  Min,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum FacilityType {
  LIBRARY = 'Library',
  LABORATORY = 'Laboratory',
  AUDITORIUM = 'Auditorium',
  GYMNASIUM = 'Gymnasium',
  CAFETERIA = 'Cafeteria',
  CLINIC = 'Clinic',
  OFFICE = 'Office',
  OUTDOOR = 'Outdoor',
  OTHER = 'Other',
}

export enum FacilityStatus {
  AVAILABLE = 'Available',
  OCCUPIED = 'Occupied',
  MAINTENANCE = 'Maintenance',
  CLOSED = 'Closed',
}

export class CreateCampusFacilityDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  @ApiProperty({
    example: 'Library',
    description: 'Campus facility name',
    minLength: 2,
    maxLength: 255,
  })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @ApiProperty({
    example:
      'A modern library with extensive collection of books and digital resources',
    description: 'Description of the campus facility',
    required: false,
    maxLength: 2000,
  })
  description?: string;

  @IsUUID()
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Building ID where the facility is located',
  })
  buildingId: string;

  @IsUUID()
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Floor ID where the facility is located',
  })
  floorId: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiProperty({
    example: 50,
    description: 'Facility capacity (number of people)',
    required: false,
    minimum: 0,
  })
  capacity?: number;

  @IsEnum(FacilityType)
  @ApiProperty({
    enum: FacilityType,
    example: FacilityType.LIBRARY,
    description: 'Type of campus facility',
  })
  type: FacilityType;

  @IsOptional()
  @IsEnum(FacilityStatus)
  @ApiProperty({
    enum: FacilityStatus,
    example: FacilityStatus.AVAILABLE,
    description: 'Current status of the facility',
    required: false,
  })
  status?: FacilityStatus;

  @IsUUID()
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Domain ID for scoping the facility',
  })
  domainId: string;

  @IsUUID()
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User ID of the creator',
  })
  createdBy: string;
}
