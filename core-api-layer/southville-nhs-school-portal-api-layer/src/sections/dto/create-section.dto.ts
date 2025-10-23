import { IsString, IsOptional, IsUUID, IsEnum, IsInt, Min, Max } from 'class-validator';

export class CreateSectionDto {
  @IsString()
  name: string;

  @IsString()
  grade_level: string;

  @IsOptional()
  @IsUUID()
  teacher_id?: string;

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