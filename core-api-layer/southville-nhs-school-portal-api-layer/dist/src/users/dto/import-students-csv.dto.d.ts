export declare class CsvStudentRowDto {
    full_name: string;
    role: string;
    status: string;
    first_name: string;
    last_name: string;
    middle_name?: string;
    student_id: string;
    lrn_id: string;
    grade_level: string;
    enrollment: number;
    section: string;
    age?: number;
    birthday: string;
    guardian_name: string;
    relationship: string;
    phone_number: string;
    email?: string;
    address?: string;
    is_primary?: boolean;
}
export declare class ImportStudentsCsvDto {
    students: CsvStudentRowDto[];
}
export declare class BulkImportResultDto {
    success: number;
    failed: number;
    results: any[];
    errors: any[];
}
