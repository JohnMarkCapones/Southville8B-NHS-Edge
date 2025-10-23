export declare enum DayOfWeek {
    MONDAY = "Monday",
    TUESDAY = "Tuesday",
    WEDNESDAY = "Wednesday",
    THURSDAY = "Thursday",
    FRIDAY = "Friday",
    SATURDAY = "Saturday",
    SUNDAY = "Sunday"
}
export declare enum Semester {
    FIRST = "1st",
    SECOND = "2nd"
}
export declare class Schedule {
    id: string;
    subjectId: string;
    teacherId: string;
    sectionId: string;
    roomId: string;
    buildingId: string;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    schoolYear: string;
    semester: Semester;
    createdAt: string;
    updatedAt: string;
    subject?: {
        id: string;
        subjectName: string;
        description?: string;
        gradeLevel?: number;
        colorHex?: string;
    };
    teacher?: {
        id: string;
        firstName: string;
        lastName: string;
        middleName?: string;
        user?: {
            id: string;
            fullName: string;
            email: string;
        };
    };
    section?: {
        id: string;
        name: string;
        gradeLevel?: string;
        teacherId?: string;
    };
    room?: {
        id: string;
        roomNumber: string;
        capacity?: number;
        floorId: string;
    };
    building?: {
        id: string;
        buildingName: string;
    };
    students?: Array<{
        id: string;
        firstName: string;
        lastName: string;
        middleName?: string;
        studentId: string;
        lrnId: string;
        gradeLevel?: string;
    }>;
}
