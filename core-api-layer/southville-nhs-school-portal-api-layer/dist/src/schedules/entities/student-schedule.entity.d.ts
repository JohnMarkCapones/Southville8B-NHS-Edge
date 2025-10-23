export declare class StudentSchedule {
    id: string;
    scheduleId: string;
    studentId: string;
    createdAt: string;
    schedule?: {
        id: string;
        subjectId: string;
        teacherId: string;
        sectionId: string;
        roomId: string;
        buildingId: string;
        dayOfWeek: string;
        startTime: string;
        endTime: string;
        schoolYear: string;
        semester: string;
    };
    student?: {
        id: string;
        firstName: string;
        lastName: string;
        middleName?: string;
        studentId: string;
        lrnId: string;
        gradeLevel?: string;
        sectionId?: string;
    };
}
