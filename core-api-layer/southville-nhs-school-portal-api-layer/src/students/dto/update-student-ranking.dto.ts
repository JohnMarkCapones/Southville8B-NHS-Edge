import { PartialType } from '@nestjs/swagger';
import { CreateStudentRankingDto } from './create-student-ranking.dto';

export class UpdateStudentRankingDto extends PartialType(
  CreateStudentRankingDto,
) {}
