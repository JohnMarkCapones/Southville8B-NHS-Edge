export declare enum FormType {
    MEMBER_REGISTRATION = "member_registration",
    TEACHER_APPLICATION = "teacher_application",
    EVENT_SIGNUP = "event_signup",
    SURVEY = "survey",
    FEEDBACK = "feedback"
}
export declare class CreateClubFormDto {
    name: string;
    description?: string;
    is_active?: boolean;
    auto_approve?: boolean;
    form_type?: FormType;
}
