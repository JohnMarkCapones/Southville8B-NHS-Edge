export declare enum UserRole {
    ADMIN = "Admin",
    TEACHER = "Teacher",
    STUDENT = "Student"
}
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: UserRole[]) => import("@nestjs/common").CustomDecorator<string>;
