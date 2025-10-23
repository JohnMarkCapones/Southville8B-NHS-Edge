export declare enum UserType {
    TEACHER = "teacher",
    ADMIN = "admin",
    STUDENT = "student"
}
export declare class BulkUserDto {
    userType: UserType;
    data: any;
}
export declare class BulkCreateUsersDto {
    users: BulkUserDto[];
}
