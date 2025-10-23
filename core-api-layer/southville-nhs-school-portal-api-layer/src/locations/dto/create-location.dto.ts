import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsSafeUrl } from '../../common';

export enum ImageType {
  PANORAMIC = 'panoramic',
  REGULAR = 'regular',
}

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(255)
  @ApiProperty({
    description: 'Location name',
    example: 'Main Library',
    minLength: 3,
    maxLength: 255,
  })
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @ApiProperty({
    description: 'Location description',
    example: 'The main library building with study areas and computer labs',
    required: false,
    maxLength: 2000,
  })
  description?: string;

  @IsEnum(ImageType)
  @ApiProperty({
    description: 'Type of image for the location',
    enum: ImageType,
    example: ImageType.PANORAMIC,
  })
  imageType: ImageType;

  @IsOptional()
  @IsSafeUrl()
  @ApiProperty({
    description: 'URL to the main location image',
    example:
      'https://project.supabase.co/storage/v1/object/public/locations/library-main.jpg',
    required: false,
  })
  imageUrl?: string;

  @IsOptional()
  @IsSafeUrl()
  @ApiProperty({
    description: 'URL to the preview thumbnail image',
    example:
      'https://project.supabase.co/storage/v1/object/public/locations/library-preview.jpg',
    required: false,
  })
  previewImageUrl?: string;
}
