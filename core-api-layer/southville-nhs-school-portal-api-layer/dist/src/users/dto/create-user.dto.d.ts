export declare enum UserRole {
    ADMIN = "Admin",
    TEACHER = "Teacher",
    STUDENT = "Student"
}
export declare enum UserType {
    TEACHER = "teacher",
    ADMIN = "admin",
    STUDENT = "student"
}
export declare class CreateUserDto {
    email: string;
    fullName: string;
    role: UserRole;
    userType: UserType;
}
