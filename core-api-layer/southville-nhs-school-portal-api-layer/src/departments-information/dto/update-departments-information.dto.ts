import { PartialType } from '@nestjs/swagger';
import { CreateDepartmentsInformationDto } from './create-departments-information.dto';

export class UpdateDepartmentsInformationDto extends PartialType(CreateDepartmentsInformationDto) {}
