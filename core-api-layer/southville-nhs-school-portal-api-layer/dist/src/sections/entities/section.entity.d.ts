export declare class Section {
    id: string;
    name: string;
    gradeLevel?: string;
    teacherId?: string;
    createdAt: string;
    updatedAt: string;
    roomId?: string;
    buildingId?: string;
    teacher?: {
        id: string;
        fullName: string;
        email: string;
    };
    students?: Array<{
        id: string;
        firstName: string;
        lastName: string;
        studentId: string;
    }>;
}
