import { CreateUserDto } from './create-user.dto';
export declare class CreateTeacherDto extends CreateUserDto {
    firstName: string;
    lastName: string;
    middleName?: string;
    birthday: string;
    age?: number;
    subjectSpecializationId?: string;
    departmentId?: string;
    phoneNumber?: string;
    constructor();
}
