import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ImportUsersDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'CSV file content as base64 string',
    example:
      'data:text/csv;base64,Zmlyc3ROYW1lLGxhc3ROYW1lLGVtYWlsLGJpcnRoZGF5CkpvaG4sRG9lLGpvaG4uZG9lQHNjaG9vbC5lZHUsMTk4NS0wNS0xNQ==',
  })
  file: string;
}
