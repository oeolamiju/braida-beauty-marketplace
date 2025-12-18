import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, FileText, ExternalLink, Ban, AlertOctagon, ShieldAlert, UserX } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import backend from "@/lib/backend";

type ReportIssueType = "safety" | "quality" | "payment" | "harassment" | "fraud" | "other";
type ReportStatus = "new" | "under_review" | "resolved";
type AccountStatus = "active" | "warned" | "suspended" | "banned";

interface Report {
  id: string;
  reporterId: string;
  reportedUserId: string;
  freelancerId?: string;
  bookingId?: string;
  issueType: ReportIssueType;
  description: string;
  attachmentUrl?: string;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
  reporterEmail?: string;
  reportedUserEmail?: string;
  reporterName?: string;
  reportedUserName?: string;
}

interface ReportAction {
  id: string;
  reportId: string;
  adminId: string;
  actionType: string;
  notes?: string;
  previousAccountStatus?: AccountStatus;
  newAccountStatus?: AccountStatus;
  createdAt: Date;
  adminEmail?: string;
}

const issueTypeLabels: Record<ReportIssueType, string> = {
  safety: "Safety",
  quality: "Quality",
  payment: "Payment",
  harassment: "Harassment",
  fraud: "Fraud",
  other: "Other",
};

const issueTypeColors: Record<ReportIssueType, string> = {
  safety: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  quality: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
  payment: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200",
  harassment: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200",
  fraud: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actions, setActions] = useState<ReportAction[]>([]);
  const [filterStatus, setFilterStatus] = useState<ReportStatus | "all">("all");
  const [filterIssueType, setFilterIssueType] = useState<ReportIssueType | "all">("all");
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"warn" | "suspend" | "ban" | "reactivate" | null>(null);
  const [actionNotes, setActionNotes] = useState("");
  const [suspensionReason, setSuspensionReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadReports();
  }, [filterStatus, filterIssueType]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const result = await backend.reports.adminList({
        status: filterStatus === "all" ? undefined : filterStatus,
        issueType: filterIssueType === "all" ? undefined : filterIssueType,
      });
      setReports(result.reports.map(r => ({
        ...r,
        createdAt: new Date(r.createdAt),
        updatedAt: new Date(r.updatedAt),
      })));
    } catch (error: any) {
      console.error("Failed to load reports:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadReportDetails = async (reportId: string) => {
    try {
      const result = await backend.reports.adminGet({ id: reportId });
      setSelectedReport({
        ...result.report,
        createdAt: new Date(result.report.createdAt),
        updatedAt: new Date(result.report.updatedAt),
      });
      setActions(result.actions.map(a => ({
        ...a,
        createdAt: new Date(a.createdAt),
      })));
    } catch (error: any) {
      console.error("Failed to load report details:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load report details",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (reportId: string, status: ReportStatus) => {
    try {
      await backend.reports.adminUpdateStatus({ reportId, status });
      toast({
        title: "Status updated",
        description: `Report marked as ${status}`,
      });
      loadReports();
      if (selectedReport?.id === reportId) {
        loadReportDetails(reportId);
      }
    } catch (error: any) {
      console.error("Failed to update status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleAccountAction = async () => {
    if (!selectedReport || !actionType) return;

    setProcessing(true);
    try {
      await backend.reports.adminAccountAction({
        reportId: selectedReport.id,
        userId: selectedReport.reportedUserId,
        action: actionType,
        notes: actionNotes || undefined,
        suspensionReason: suspensionReason || undefined,
      });

      toast({
        title: "Action applied",
        description: `User account ${actionType === "reactivate" ? "reactivated" : actionType === "warn" ? "warned" : actionType === "suspend" ? "suspended" : "banned"}`,
      });

      setActionModalOpen(false);
      setActionType(null);
      setActionNotes("");
      setSuspensionReason("");
      loadReportDetails(selectedReport.id);
      loadReports();
    } catch (error: any) {
      console.error("Failed to apply action:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to apply action",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: ReportStatus) => {
    const variants: Record<ReportStatus, { variant: "default" | "secondary" | "outline"; label: string }> = {
      new: { variant: "default", label: "New" },
      under_review: { variant: "secondary", label: "Under Review" },
      resolved: { variant: "outline", label: "Resolved" },
    };
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getAccountStatusBadge = (status?: AccountStatus) => {
    if (!status) return null;
    const variants: Record<AccountStatus, { className: string; label: string }> = {
      active: { className: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200", label: "Active" },
      warned: { className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200", label: "Warned" },
      suspended: { className: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200", label: "Suspended" },
      banned: { className: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200", label: "Banned" },
    };
    const config = variants[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Reports & Flags</h1>
          <p className="text-muted-foreground">Review and manage user reports</p>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as ReportStatus | "all")}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="under_review">Under Review</option>
          <option value="resolved">Resolved</option>
        </select>

        <select
          value={filterIssueType}
          onChange={(e) => setFilterIssueType(e.target.value as ReportIssueType | "all")}
          className="px-4 py-2 border rounded-lg bg-background"
        >
          <option value="all">All Issue Types</option>
          <option value="safety">Safety</option>
          <option value="quality">Quality</option>
          <option value="payment">Payment</option>
          <option value="harassment">Harassment</option>
          <option value="fraud">Fraud</option>
          <option value="other">Other</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Reports</h3>
          <p className="text-muted-foreground">No reports match the selected filters</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <Card
              key={report.id}
              className="p-6 hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => {
                setSelectedReport(report);
                loadReportDetails(report.id);
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={issueTypeColors[report.issueType]}>
                        {issueTypeLabels[report.issueType]}
                      </Badge>
                      {getStatusBadge(report.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Reported {formatDateTime(report.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Reporter</p>
                  <p className="font-medium">{report.reporterName}</p>
                  <p className="text-sm text-muted-foreground">{report.reporterEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Reported User</p>
                  <p className="font-medium">{report.reportedUserName}</p>
                  <p className="text-sm text-muted-foreground">{report.reportedUserEmail}</p>
                </div>
              </div>

              <p className="text-sm line-clamp-2">{report.description}</p>

              {(report.freelancerId || report.bookingId) && (
                <div className="mt-3 flex gap-2">
                  {report.freelancerId && (
                    <Badge variant="outline">Freelancer Profile</Badge>
                  )}
                  {report.bookingId && (
                    <Badge variant="outline">Booking #{report.bookingId}</Badge>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Report Details
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Badge className={issueTypeColors[selectedReport.issueType]}>
                    {issueTypeLabels[selectedReport.issueType]}
                  </Badge>
                  {getStatusBadge(selectedReport.status)}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Reporter</h3>
                    <p className="font-medium">{selectedReport.reporterName}</p>
                    <p className="text-sm text-muted-foreground">{selectedReport.reporterEmail}</p>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Reported User</h3>
                    <p className="font-medium">{selectedReport.reportedUserName}</p>
                    <p className="text-sm text-muted-foreground">{selectedReport.reportedUserEmail}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => navigate(`/admin/users`)}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View User
                    </Button>
                  </Card>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-lg">
                    {selectedReport.description}
                  </p>
                </div>

                {selectedReport.attachmentUrl && (
                  <div>
                    <h3 className="font-semibold mb-2">Attachment</h3>
                    <a
                      href={selectedReport.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Attachment
                    </a>
                  </div>
                )}

                {(selectedReport.freelancerId || selectedReport.bookingId) && (
                  <div>
                    <h3 className="font-semibold mb-2">Context</h3>
                    <div className="flex gap-2">
                      {selectedReport.freelancerId && (
                        <Badge variant="outline">Freelancer Profile</Badge>
                      )}
                      {selectedReport.bookingId && (
                        <Badge variant="outline">Booking #{selectedReport.bookingId}</Badge>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-3">Update Status</h3>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedReport.status === "new" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleUpdateStatus(selectedReport.id, "new")}
                    >
                      New
                    </Button>
                    <Button
                      variant={selectedReport.status === "under_review" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleUpdateStatus(selectedReport.id, "under_review")}
                    >
                      Under Review
                    </Button>
                    <Button
                      variant={selectedReport.status === "resolved" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleUpdateStatus(selectedReport.id, "resolved")}
                    >
                      Resolved
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Account Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActionType("warn");
                        setActionModalOpen(true);
                      }}
                    >
                      <ShieldAlert className="h-4 w-4 mr-2" />
                      Warn
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActionType("suspend");
                        setActionModalOpen(true);
                      }}
                    >
                      <AlertOctagon className="h-4 w-4 mr-2" />
                      Suspend
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setActionType("ban");
                        setActionModalOpen(true);
                      }}
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Ban
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActionType("reactivate");
                        setActionModalOpen(true);
                      }}
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Reactivate
                    </Button>
                  </div>
                </div>

                {actions.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Action History</h3>
                    <div className="space-y-3">
                      {actions.map((action) => (
                        <Card key={action.id} className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="font-medium">{action.actionType}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatDateTime(action.createdAt)}
                            </div>
                          </div>
                          {action.previousAccountStatus && action.newAccountStatus && (
                            <div className="flex items-center gap-2 mb-2 text-sm">
                              {getAccountStatusBadge(action.previousAccountStatus)}
                              <span>→</span>
                              {getAccountStatusBadge(action.newAccountStatus)}
                            </div>
                          )}
                          {action.notes && (
                            <p className="text-sm text-muted-foreground">{action.notes}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            by {action.adminEmail}
                          </p>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={actionModalOpen} onOpenChange={setActionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "warn" && "Warn User"}
              {actionType === "suspend" && "Suspend User"}
              {actionType === "ban" && "Ban User"}
              {actionType === "reactivate" && "Reactivate User"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {(actionType === "suspend" || actionType === "ban") && (
              <div>
                <label className="text-sm font-medium mb-2 block">Reason (visible to user)</label>
                <Textarea
                  placeholder="Enter the reason for this action..."
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Admin Notes (internal only)</label>
              <Textarea
                placeholder="Add any internal notes about this action..."
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setActionModalOpen(false);
                  setActionType(null);
                  setActionNotes("");
                  setSuspensionReason("");
                }}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleAccountAction}
                disabled={processing}
                variant={actionType === "ban" ? "destructive" : "default"}
              >
                {processing ? "Processing..." : "Confirm"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
