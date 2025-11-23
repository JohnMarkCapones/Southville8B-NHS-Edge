export type AlertType = "info" | "warning" | "success" | "error" | "system";

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  recipient_id: string | null;
  expires_at: string;
  created_at: string;
  updated_at: string;
  is_read: boolean;
  created_by?: string | null;
}

export interface AlertsResponse {
  data: Alert[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AlertsParams {
  page?: number;
  limit?: number;
  includeExpired?: boolean;
  type?: AlertType;
  sortBy?: "created_at" | "expires_at" | "title";
  sortOrder?: "ASC" | "DESC";
  // Client-side filters (not sent to API, applied after fetching)
  recipient_id?: string | null;
  is_read?: boolean;
}
