import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateSectionDto {
  @IsString()
  name: string; // Maps to database column 'name'

  @IsString()
  grade_level: string; // Database uses VARCHAR

  @IsOptional()
  @IsUUID()
  teacher_id?: string; // Maps to database column 'teacher_id'

  @IsOptional()
  @IsUUID()
  building_id?: string;

  @IsOptional()
  @IsUUID()
  floor_id?: string;

  @IsOptional()
  @IsUUID()
  room_id?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive', 'archived'])
  status?: 'active' | 'inactive' | 'archived';
}
