export declare class Event {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    organizerId: string;
    eventImage?: string;
    status: string;
    visibility: string;
    createdAt: string;
    updatedAt: string;
    organizer?: {
        id: string;
        fullName: string;
        email: string;
    };
    tags?: Array<{
        id: string;
        name: string;
        color?: string;
    }>;
    additionalInfo?: Array<{
        id: string;
        title: string;
        content: string;
        orderIndex: number;
    }>;
    highlights?: Array<{
        id: string;
        title: string;
        content: string;
        imageUrl?: string;
        orderIndex: number;
    }>;
    schedule?: Array<{
        id: string;
        activityTime: string;
        activityDescription: string;
        orderIndex: number;
    }>;
    faq?: Array<{
        id: string;
        question: string;
        answer: string;
    }>;
}
