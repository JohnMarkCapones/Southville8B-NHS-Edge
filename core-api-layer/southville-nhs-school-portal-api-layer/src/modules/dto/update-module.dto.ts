import { PartialType } from '@nestjs/mapped-types';
import { CreateModuleDto } from './create-module.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateModuleDto extends PartialType(CreateModuleDto) {
  @ApiPropertyOptional({
    description: 'Whether to replace the existing file',
    default: false,
  })
  replaceFile?: boolean = false;
}
