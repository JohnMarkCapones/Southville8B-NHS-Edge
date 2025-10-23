import { Teacher } from './teacher.entity';
import { Admin } from './admin.entity';
import { Student } from '../../students/entities/student.entity';
export declare class User {
    id: string;
    full_name: string;
    email: string;
    role_id: string;
    status: string;
    created_at: string;
    updated_at: string;
    role?: {
        id: string;
        name: string;
    };
    teacher?: Teacher;
    admin?: Admin;
    student?: Student;
}
