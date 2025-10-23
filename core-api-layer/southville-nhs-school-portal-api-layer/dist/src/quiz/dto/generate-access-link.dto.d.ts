export declare class GenerateAccessLinkDto {
    expiresAt?: string;
    accessCode?: string;
    maxUses?: number;
    requiresAuth?: boolean;
}
export declare class ValidateAccessLinkDto {
    token: string;
    accessCode?: string;
}
