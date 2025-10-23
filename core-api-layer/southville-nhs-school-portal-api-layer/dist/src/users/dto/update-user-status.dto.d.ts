export declare enum UserStatus {
    ACTIVE = "Active",
    INACTIVE = "Inactive",
    SUSPENDED = "Suspended"
}
export declare class UpdateUserStatusDto {
    status: UserStatus;
    reason?: string;
}
export declare class SuspendUserDto {
    reason: string;
    duration?: number;
    suspendedUntil?: string;
    _validateSuspensionFields?: any;
}
