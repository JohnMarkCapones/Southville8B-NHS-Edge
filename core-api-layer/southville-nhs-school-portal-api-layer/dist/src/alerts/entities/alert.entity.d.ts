export declare enum AlertType {
    INFO = "info",
    WARNING = "warning",
    SUCCESS = "success",
    ERROR = "error",
    SYSTEM = "system"
}
export declare class Alert {
    id: string;
    type: AlertType;
    title: string;
    message: string;
    created_by: string;
    recipient_id: string | null;
    is_read: boolean;
    expires_at: Date;
    created_at: Date;
    updated_at: Date;
    created_by_user?: any;
}
