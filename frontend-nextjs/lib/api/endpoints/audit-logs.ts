import { apiClient } from "../client";

export interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  entity_description: string | null;
  actor_name: string | null;
  actor_role: string | null;
  changed_fields: string[] | null;
  ip_address: string | null;
  created_at: string;
  is_deleted: boolean;
}

export interface AuditLogSearchParams {
  entityType?: string;
  action?: string;
  actorUserId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface AuditLogSearchResponse {
  data: AuditLog[];
  total: number;
  limit: number;
  offset: number;
}

export interface AuditStatistics {
  total: number;
  byAction: Record<string, number>;
  byEntity: Record<string, number>;
  uniqueActors: number;
  period: string;
}

export const auditLogsApi = {
  /**
   * Search audit logs with filters
   */
  search: async (params: AuditLogSearchParams): Promise<AuditLogSearchResponse> => {
    return apiClient.get("/audit-logs", { params });
  },

  /**
   * Get audit statistics
   */
  getStatistics: async (days = 30): Promise<AuditStatistics> => {
    return apiClient.get(`/audit-logs/statistics`, { params: { days } });
  },

  /**
   * Get audit trail for specific entity
   */
  getEntityAuditTrail: async (
    entityType: string,
    entityId: string,
    limit = 50
  ): Promise<{ entityType: string; entityId: string; auditTrail: AuditLog[]; count: number }> => {
    return apiClient.get(`/audit-logs/entity/${entityType}/${entityId}`, { params: { limit } });
  },

  /**
   * Export audit logs as CSV
   */
  export: async (params: AuditLogSearchParams): Promise<{ format: string; data: string; count: number; filename: string }> => {
    return apiClient.get("/audit-logs/export", { params });
  },
};
