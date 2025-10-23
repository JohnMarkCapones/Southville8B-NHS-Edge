import { PartialType } from '@nestjs/swagger';
import { CreateFormQuestionDto } from './create-form-question.dto';

export class UpdateFormQuestionDto extends PartialType(CreateFormQuestionDto) {}
