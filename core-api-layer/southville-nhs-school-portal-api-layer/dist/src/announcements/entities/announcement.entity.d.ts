export declare class Announcement {
    id: string;
    userId: string;
    title: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    expiresAt?: string;
    type?: string;
    visibility: string;
    user?: {
        id: string;
        fullName: string;
        email: string;
    };
    tags?: Array<{
        id: string;
        name: string;
        color?: string;
    }>;
    targetRoles?: Array<{
        id: string;
        name: string;
    }>;
}
