export declare class Teacher {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    age?: number;
    birthday?: string;
    subject_specialization_id?: string;
    department_id?: string;
    advisory_section_id?: string;
    created_at: string;
    updated_at: string;
    subject_specialization?: {
        id: string;
        subject_name: string;
    };
    department?: {
        id: string;
        department_name: string;
    };
    advisory_section?: {
        id: string;
        name: string;
        grade_level: string;
    };
}
