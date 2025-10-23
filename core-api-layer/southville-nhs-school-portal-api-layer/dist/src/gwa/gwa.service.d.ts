import { ConfigService } from '@nestjs/config';
import { CreateGwaDto } from './dto/create-gwa.dto';
import { UpdateGwaDto } from './dto/update-gwa.dto';
export interface StudentGwaDto {
    id?: string;
    student_id: string;
    student_name: string;
    student_number: string;
    gwa?: number;
    remarks?: string;
    honor_status: string;
    gwa_id?: string;
}
export interface StudentGwaListResponse {
    students: StudentGwaDto[];
    section_name: string;
    grade_level: string;
}
export declare class GwaService {
    private configService;
    private readonly logger;
    private supabase;
    constructor(configService: ConfigService);
    getAdvisoryStudentsWithGwa(teacherId: string, gradingPeriod: string, schoolYear: string): Promise<StudentGwaListResponse>;
    createGwaEntry(dto: CreateGwaDto, recordedBy: string): Promise<any>;
    updateGwaEntry(id: string, dto: UpdateGwaDto, teacherUserId: string): Promise<any>;
    deleteGwaEntry(id: string, teacherUserId: string): Promise<void>;
    private validateTeacherPermission;
}
