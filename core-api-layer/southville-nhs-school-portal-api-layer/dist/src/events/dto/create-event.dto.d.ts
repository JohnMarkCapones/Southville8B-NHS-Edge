export declare enum EventStatus {
    DRAFT = "draft",
    PUBLISHED = "published",
    CANCELLED = "cancelled",
    COMPLETED = "completed"
}
export declare enum EventVisibility {
    PUBLIC = "public",
    PRIVATE = "private"
}
export declare class CreateEventAdditionalInfoDto {
    title: string;
    content: string;
    orderIndex?: number;
}
export declare class CreateEventHighlightDto {
    title: string;
    content: string;
    imageUrl?: string;
    orderIndex?: number;
}
export declare class CreateEventScheduleDto {
    activityTime: string;
    activityDescription: string;
    orderIndex?: number;
}
export declare class CreateEventFaqDto {
    question: string;
    answer: string;
}
export declare class CreateEventDto {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    organizerId: string;
    eventImage?: string;
    status: EventStatus;
    visibility: EventVisibility;
    tagIds?: string[];
    additionalInfo?: CreateEventAdditionalInfoDto[];
    highlights?: CreateEventHighlightDto[];
    schedule?: CreateEventScheduleDto[];
    faq?: CreateEventFaqDto[];
}
