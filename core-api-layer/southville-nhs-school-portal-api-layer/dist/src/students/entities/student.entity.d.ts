import { EmergencyContact } from './emergency-contact.entity';
export declare class Student {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    student_id: string;
    lrn_id: string;
    grade_level?: string;
    enrollment_year?: number;
    honor_status?: string;
    rank?: number;
    section_id?: string;
    age?: number;
    birthday?: string;
    section?: {
        id: string;
        name: string;
        grade_level: string;
    };
    user?: {
        id: string;
        email: string;
        full_name: string;
        status: string;
    };
    emergencyContacts?: EmergencyContact[];
}
