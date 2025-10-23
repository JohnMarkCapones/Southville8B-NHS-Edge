import { AlertType } from '../entities/alert.entity';
export declare class CreateAlertDto {
    type: AlertType;
    title: string;
    message: string;
    expires_at?: string;
    recipient_id?: string;
}
