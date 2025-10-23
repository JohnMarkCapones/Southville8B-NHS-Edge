import { AlertType } from '../entities/alert.entity';
export declare class QueryAlertDto {
    type?: AlertType;
    includeExpired?: boolean;
    page?: number;
    limit?: number;
    sortBy?: 'created_at' | 'expires_at' | 'title';
    sortOrder?: 'ASC' | 'DESC';
}
