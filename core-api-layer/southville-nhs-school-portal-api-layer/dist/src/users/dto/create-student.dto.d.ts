import { CreateEmergencyContactDto } from '../../students/dto/create-emergency-contact.dto';
export declare class CreateStudentRequestDto {
    firstName: string;
    lastName: string;
    middleName?: string;
    studentId: string;
    lrnId: string;
    birthday: string;
    gradeLevel: string;
    enrollmentYear: number;
    honorStatus?: string;
    age?: number;
    sectionId?: string;
    emergencyContacts?: CreateEmergencyContactDto[];
}
