import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreateEmergencyContactDto } from './dto/create-emergency-contact.dto';
import { UpdateEmergencyContactDto } from './dto/update-emergency-contact.dto';
import { EmergencyContact } from './entities/emergency-contact.entity';
import { CreateStudentRankingDto } from './dto/create-student-ranking.dto';
import { UpdateStudentRankingDto } from './dto/update-student-ranking.dto';
import { StudentRanking } from './entities/student-ranking.entity';
import { SupabaseUser } from '../auth/interfaces/supabase-user.interface';
export declare class StudentsController {
    private readonly studentsService;
    private readonly logger;
    constructor(studentsService: StudentsService);
    create(createStudentDto: CreateStudentDto, user: SupabaseUser): Promise<any>;
    findAll(user: SupabaseUser, page?: number, limit?: number, search?: string, gradeLevel?: string, sectionId?: string, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<any>;
    findOne(id: string, user: SupabaseUser): Promise<import("./entities/student.entity").Student>;
    update(id: string, updateStudentDto: UpdateStudentDto, user: SupabaseUser): Promise<import("./entities/student.entity").Student>;
    remove(id: string, user: SupabaseUser): Promise<void>;
    getPublicInfo(): {
        message: string;
        timestamp: string;
    };
    getEmergencyContacts(studentUserId: string, user: SupabaseUser): Promise<EmergencyContact[]>;
    addEmergencyContact(studentUserId: string, createDto: CreateEmergencyContactDto): Promise<EmergencyContact>;
    updateEmergencyContact(contactId: string, updateDto: UpdateEmergencyContactDto): Promise<EmergencyContact>;
    deleteEmergencyContact(contactId: string): Promise<{
        message: string;
    }>;
    createRanking(createDto: CreateStudentRankingDto, user: SupabaseUser): Promise<StudentRanking>;
    findAllRankings(user: SupabaseUser, page?: number, limit?: number, gradeLevel?: string, quarter?: string, schoolYear?: string, topN?: number): Promise<{
        data: StudentRanking[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findRankingById(id: string, user: SupabaseUser): Promise<StudentRanking>;
    findRankingsByStudent(studentId: string, user: SupabaseUser): Promise<StudentRanking[]>;
    updateRanking(id: string, updateDto: UpdateStudentRankingDto, user: SupabaseUser): Promise<StudentRanking>;
    deleteRanking(id: string, user: SupabaseUser): Promise<{
        message: string;
    }>;
}
