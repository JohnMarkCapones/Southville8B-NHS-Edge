import { StudentAssistantQueryType } from './student-assistant-query.dto';

export interface StudentAssistantResponseMetadata {
  [key: string]: unknown;
}

export class StudentAssistantResponseDto<T = unknown> {
  type: StudentAssistantQueryType;
  data: T;
  metadata?: StudentAssistantResponseMetadata;
}



