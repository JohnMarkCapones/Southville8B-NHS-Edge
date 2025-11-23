import {
  IsString,
  IsNotEmpty,
  Matches,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

@ValidatorConstraint({ name: 'validDataUri', async: false })
class ValidDataUriConstraint implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    if (!value) return false;

    // Check data URI pattern
    const dataUriPattern = /^data:([^;]+);base64,([A-Za-z0-9+/]+=*)$/;
    const match = value.match(dataUriPattern);

    if (!match) return false;

    const [, mimeType, base64Data] = match;

    // Check MIME type
    const allowedMimeTypes = ['text/csv', 'application/csv', 'text/plain'];
    if (!allowedMimeTypes.includes(mimeType)) return false;

    // Check file size (max 5MB)
    const decodedSize = Buffer.byteLength(base64Data, 'base64');
    const maxSize = 5 * 1024 * 1024; // 5MB

    return decodedSize <= maxSize;
  }

  defaultMessage(args: ValidationArguments) {
    return 'File must be a valid CSV data URI (text/csv, application/csv, or text/plain) with base64 encoding and maximum size of 5MB';
  }
}

export class ImportUsersDto {
  @IsString()
  @IsNotEmpty()
  @Validate(ValidDataUriConstraint)
  @ApiProperty({
    description: 'CSV file content as base64 data URI',
    example:
      'data:text/csv;base64,Zmlyc3ROYW1lLGxhc3ROYW1lLGVtYWlsLGJpcnRoZGF5CkpvaG4sRG9lLGpvaG4uZG9lQHNjaG9vbC5lZHUsMTk4NS0wNS0xNQ==',
  })
  file: string;
}
