"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auditLogsApi } from "@/lib/api/endpoints/audit-logs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  User,
  FileText,
  Activity,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

// Types
type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "RESTORE" | "PUBLISH" | "UNPUBLISH" | "APPROVE" | "REJECT" | "ASSIGN" | "UNASSIGN";

type AuditEntityType =
  | "USER" | "STUDENT" | "TEACHER" | "ADMIN"
  | "SCHEDULE" | "SECTION" | "SUBJECT"
  | "NEWS" | "ANNOUNCEMENT" | "EVENT"
  | "GALLERY_ALBUM" | "GALLERY_ITEM" | "MODULE"
  | "QUIZ" | "QUIZ_ATTEMPT" | "QUIZ_STUDENT_ANSWER"
  | "CLUB" | "CLUB_MEMBERSHIP"
  | "DOMAIN_ROLE" | "USER_DOMAIN_ROLE"
  | "GWA" | "STUDENT_RANKING";

interface AuditLog {
  id: string;
  action: AuditAction;
  entity_type: AuditEntityType;
  entity_id: string;
  entity_description: string | null;
  actor_name: string | null;
  actor_role: string | null;
  changed_fields: string[] | null;
  ip_address: string | null;
  created_at: string;
}

interface AuditLogDetail extends AuditLog {
  actor_user_id: string | null;
  before_state: Record<string, any> | null;
  after_state: Record<string, any> | null;
  user_agent: string | null;
  request_id: string | null;
  note: string | null;
  metadata: Record<string, any> | null;
}

interface Statistics {
  total: number;
  byAction: Record<string, number>;
  byEntity: Record<string, number>;
  uniqueActors: number;
  period: string;
}

export default function AuditLogsPage() {
  // State
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLogDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Filters
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [limit] = useState(50);

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const params: any = {
        limit,
        offset: (currentPage - 1) * limit,
      };

      if (entityTypeFilter !== "all") {
        params.entityType = entityTypeFilter;
      }
      if (actionFilter !== "all") {
        params.action = actionFilter;
      }
      if (startDate) {
        params.startDate = new Date(startDate).toISOString();
      }
      if (endDate) {
        params.endDate = new Date(endDate).toISOString();
      }

      const data = await auditLogsApi.search(params);
      setLogs(data.data);
      setTotalRecords(data.total);
    } catch (error: any) {
      console.error("Error fetching audit logs:", error);
      if (error?.status === 401) {
        alert("⚠️ Authentication Error\n\nYour session has expired. Please log in again.");
      } else if (error?.status === 403) {
        alert("⚠️ Access Denied\n\nOnly Admin users can view audit logs.");
      } else {
        alert(`Error: ${error?.message || "Failed to fetch audit logs"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const data = await auditLogsApi.getStatistics(30);
      setStatistics(data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  // Fetch log details
  const fetchLogDetails = async (logId: string) => {
    try {
      // For now, we'll use the search endpoint with a specific filter
      // In a real implementation, you'd have a dedicated endpoint
      const log = logs.find(l => l.id === logId);
      if (log) {
        setSelectedLog(log as AuditLogDetail);
        setDetailModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching log details:", error);
    }
  };

  // Export to CSV
  const handleExport = async () => {
    setExporting(true);
    try {
      const params: any = {};

      if (entityTypeFilter !== "all") {
        params.entityType = entityTypeFilter;
      }
      if (actionFilter !== "all") {
        params.action = actionFilter;
      }
      if (startDate) {
        params.startDate = new Date(startDate).toISOString();
      }
      if (endDate) {
        params.endDate = new Date(endDate).toISOString();
      }

      const result = await auditLogsApi.export(params);

      // Create blob and download
      const blob = new Blob([result.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename || "audit-logs.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error exporting audit logs:", error);
      alert("Failed to export audit logs");
    } finally {
      setExporting(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAuditLogs();
    fetchStatistics();
  }, [currentPage, entityTypeFilter, actionFilter, startDate, endDate]);

  // Utility functions
  const formatEntityType = (entityType: string): string => {
    // Convert GALLERY_ITEM to Gallery Item
    // Convert TEACHER_FILE to Teacher File
    // Convert USER to User
    return entityType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getActionColor = (action: AuditAction) => {
    const colors: Record<AuditAction, string> = {
      CREATE: "bg-green-100 text-green-800 border-green-200",
      UPDATE: "bg-blue-100 text-blue-800 border-blue-200",
      DELETE: "bg-red-100 text-red-800 border-red-200",
      RESTORE: "bg-purple-100 text-purple-800 border-purple-200",
      PUBLISH: "bg-indigo-100 text-indigo-800 border-indigo-200",
      UNPUBLISH: "bg-gray-100 text-gray-800 border-gray-200",
      APPROVE: "bg-emerald-100 text-emerald-800 border-emerald-200",
      REJECT: "bg-orange-100 text-orange-800 border-orange-200",
      ASSIGN: "bg-cyan-100 text-cyan-800 border-cyan-200",
      UNASSIGN: "bg-slate-100 text-slate-800 border-slate-200",
    };
    return colors[action] || "bg-gray-100 text-gray-800";
  };

  const getActionIcon = (action: AuditAction) => {
    const icons: Record<AuditAction, any> = {
      CREATE: CheckCircle,
      UPDATE: RefreshCw,
      DELETE: XCircle,
      RESTORE: RefreshCw,
      PUBLISH: Eye,
      UNPUBLISH: Eye,
      APPROVE: CheckCircle,
      REJECT: XCircle,
      ASSIGN: User,
      UNASSIGN: User,
    };
    const Icon = icons[action] || Activity;
    return <Icon className="w-3 h-3" />;
  };

  const totalPages = Math.ceil(totalRecords / limit);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-600 mt-2">
          System-wide audit trail for all critical operations
        </p>
      </div>

      {/* Statistics Cards */}
      {statistics ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-2xl font-bold">{statistics.total?.toLocaleString() || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Unique Actors</p>
                <p className="text-2xl font-bold">{statistics.uniqueActors || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Entity Types</p>
                <p className="text-2xl font-bold">
                  {statistics.byEntity ? Object.keys(statistics.byEntity).length : 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Period</p>
                <p className="text-lg font-bold">{statistics.period || "N/A"}</p>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-100 rounded-lg animate-pulse">
                <Activity className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Loading statistics...</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Entity Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entity Type
            </label>
            <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All entities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                <SelectItem value="NEWS">News</SelectItem>
                <SelectItem value="USER">Users</SelectItem>
                <SelectItem value="STUDENT">Students</SelectItem>
                <SelectItem value="TEACHER">Teachers</SelectItem>
                <SelectItem value="QUIZ">Quizzes</SelectItem>
                <SelectItem value="CLUB">Clubs</SelectItem>
                <SelectItem value="ANNOUNCEMENT">Announcements</SelectItem>
                <SelectItem value="EVENT">Events</SelectItem>
                <SelectItem value="SCHEDULE">Schedules</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action
            </label>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="CREATE">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
                <SelectItem value="PUBLISH">Publish</SelectItem>
                <SelectItem value="APPROVE">Approve</SelectItem>
                <SelectItem value="REJECT">Reject</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-end gap-2">
            <Button
              onClick={fetchAuditLogs}
              className="flex-1"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={handleExport}
              disabled={exporting}
              variant="default"
            >
              <Download className="w-4 h-4 mr-2" />
              {exporting ? "Exporting..." : "Export"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity Type</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Changes</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Loading audit logs...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No audit logs found
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(log.created_at), "MMM dd, yyyy HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${getActionColor(log.action)} flex items-center gap-1 w-fit`}
                      >
                        {getActionIcon(log.action)}
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {formatEntityType(log.entity_type)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {log.entity_description || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">
                          ID: {log.entity_id.substring(0, 8)}...
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {log.actor_name || "System"}
                        </p>
                        {log.actor_role && (
                          <p className="text-xs text-gray-500">{log.actor_role}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.changed_fields && log.changed_fields.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {log.changed_fields.slice(0, 2).map((field) => (
                            <Badge key={field} variant="secondary" className="text-xs">
                              {field}
                            </Badge>
                          ))}
                          {log.changed_fields.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{log.changed_fields.length - 2} more
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.ip_address || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => fetchLogDetails(log.id)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * limit) + 1} to{" "}
            {Math.min(currentPage * limit, totalRecords)} of {totalRecords} entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Complete audit trail information for this operation
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Action</label>
                  <Badge
                    variant="outline"
                    className={`${getActionColor(selectedLog.action)} mt-1`}
                  >
                    {selectedLog.action}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Entity Type</label>
                  <p className="mt-1 font-medium">{formatEntityType(selectedLog.entity_type)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Entity ID</label>
                  <p className="font-mono text-sm mt-1">{selectedLog.entity_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Timestamp</label>
                  <p className="mt-1">
                    {format(new Date(selectedLog.created_at), "PPpp")}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Actor</label>
                  <p className="mt-1">{selectedLog.actor_name || "System"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">IP Address</label>
                  <p className="font-mono text-sm mt-1">
                    {selectedLog.ip_address || "N/A"}
                  </p>
                </div>
              </div>

              {/* Changed Fields */}
              {selectedLog.changed_fields && selectedLog.changed_fields.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Changed Fields
                  </label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedLog.changed_fields.map((field) => (
                      <Badge key={field} variant="secondary">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Before/After States */}
              {(selectedLog.before_state || selectedLog.after_state) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedLog.before_state && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Before State
                      </label>
                      <pre className="mt-2 p-3 bg-gray-50 rounded-lg text-xs overflow-x-auto">
                        {JSON.stringify(selectedLog.before_state, null, 2)}
                      </pre>
                    </div>
                  )}
                  {selectedLog.after_state && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        After State
                      </label>
                      <pre className="mt-2 p-3 bg-gray-50 rounded-lg text-xs overflow-x-auto">
                        {JSON.stringify(selectedLog.after_state, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Note */}
              {selectedLog.note && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Note</label>
                  <p className="mt-2 p-3 bg-blue-50 rounded-lg text-sm">
                    {selectedLog.note}
                  </p>
                </div>
              )}

              {/* Metadata */}
              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Metadata</label>
                  <pre className="mt-2 p-3 bg-gray-50 rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
