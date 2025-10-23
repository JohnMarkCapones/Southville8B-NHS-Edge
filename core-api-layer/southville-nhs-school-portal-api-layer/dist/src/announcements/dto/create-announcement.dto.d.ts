export declare enum AnnouncementVisibility {
    PUBLIC = "public",
    PRIVATE = "private"
}
export declare class CreateAnnouncementDto {
    title: string;
    content: string;
    expiresAt?: string;
    type?: string;
    visibility: AnnouncementVisibility;
    targetRoleIds: string[];
    tagIds?: string[];
}
