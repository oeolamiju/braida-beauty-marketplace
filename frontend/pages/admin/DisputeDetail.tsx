import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Calendar, Clock, User, AlertTriangle, FileText, DollarSign, Ban } from "lucide-react";
import backend from "@/lib/backend";

interface DisputeTimeline {
  booking_id: string;
  client_name: string;
  freelancer_name: string;
  service_name: string;
  scheduled_start: Date;
  scheduled_end: Date;
  booking_status: string;
  payment_status?: string;
  total_amount: number;
  dispute: {
    id: string;
    booking_id: string;
    raised_by: string;
    category: string;
    description: string;
    status: string;
    resolution_type?: string;
    resolution_amount?: number;
    resolution_notes?: string;
    resolved_by?: string;
    resolved_at?: Date;
    created_at: Date;
    updated_at: Date;
    raised_by_name: string;
    raised_by_email: string;
    resolved_by_name?: string;
    attachments: Array<{
      id: string;
      file_key: string;
      file_name: string;
      file_size: number;
      content_type: string;
      uploaded_at: Date;
    }>;
    notes: Array<{
      id: string;
      admin_id: string;
      note: string;
      created_at: Date;
    }>;
  };
}

interface AuditLog {
  id: string;
  action: string;
  performed_by: string;
  performed_by_name: string;
  details: Record<string, any>;
  created_at: Date;
}

export default function AdminDisputeDetail() {
  const { id } = useParams<{ id: string }>();
  const [timeline, setTimeline] = useState<DisputeTimeline | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolutionType, setResolutionType] = useState<string>("");
  const [resolutionAmount, setResolutionAmount] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadDispute();
  }, [id]);

  async function loadDispute() {
    try {
      const data = await backend.disputes.adminGet({ dispute_id: id! });
      setTimeline(data.timeline);
      setAuditLogs(data.audit_logs);
    } catch (error) {
      console.error("Failed to load dispute:", error);
      toast({
        title: "Error",
        description: "Failed to load dispute",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAddNote() {
    if (!note.trim()) return;

    setAddingNote(true);
    try {
      await backend.disputes.adminAddNote({
        dispute_id: id!,
        note: note.trim(),
      });

      toast({
        title: "Note Added",
        description: "Internal note has been added",
      });

      setNote("");
      await loadDispute();
    } catch (error) {
      console.error("Failed to add note:", error);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    } finally {
      setAddingNote(false);
    }
  }

  async function handleUpdateStatus(status: string) {
    try {
      await backend.disputes.adminUpdateStatus({
        dispute_id: id!,
        status: status as any,
      });

      toast({
        title: "Status Updated",
        description: `Dispute status changed to ${status}`,
      });

      await loadDispute();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  }

  async function handleResolve() {
    if (!resolutionType) {
      toast({
        title: "Resolution Required",
        description: "Please select a resolution type",
        variant: "destructive",
      });
      return;
    }

    if (resolutionType === "partial_refund" && !resolutionAmount) {
      toast({
        title: "Amount Required",
        description: "Please enter refund amount for partial refund",
        variant: "destructive",
      });
      return;
    }

    setResolving(true);
    try {
      await backend.disputes.adminResolve({
        dispute_id: id!,
        resolution_type: resolutionType as any,
        resolution_amount: resolutionAmount ? parseInt(resolutionAmount) : undefined,
        resolution_notes: resolutionNotes || undefined,
      });

      toast({
        title: "Dispute Resolved",
        description: "The dispute has been resolved successfully",
      });

      await loadDispute();
      setResolutionType("");
      setResolutionAmount("");
      setResolutionNotes("");
    } catch (error) {
      console.error("Failed to resolve dispute:", error);
      toast({
        title: "Error",
        description: "Failed to resolve dispute",
        variant: "destructive",
      });
    } finally {
      setResolving(false);
    }
  }

  function formatDateTime(date: Date): string {
    return new Date(date).toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function formatPrice(pence: number): string {
    return `£${(pence / 100).toFixed(2)}`;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </Card>
      </div>
    );
  }

  if (!timeline) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Dispute not found</p>
        </Card>
      </div>
    );
  }

  const dispute = timeline.dispute;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button variant="ghost" onClick={() => navigate("/admin/disputes")} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Disputes
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-2">Dispute #{dispute.id.slice(0, 8)}</h1>
                <div className="flex items-center gap-2">
                  <Badge variant={dispute.status === "new" ? "destructive" : dispute.status === "in_review" ? "secondary" : "default"}>
                    {dispute.status}
                  </Badge>
                  <Badge variant="outline">{dispute.category}</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{dispute.description}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <div className="text-sm text-muted-foreground">Raised By</div>
                  <div className="font-medium">{dispute.raised_by_name}</div>
                  <div className="text-sm text-muted-foreground">{dispute.raised_by_email}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Raised On</div>
                  <div className="font-medium">{formatDateTime(dispute.created_at)}</div>
                </div>
              </div>

              {dispute.attachments.length > 0 && (
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3">Attachments ({dispute.attachments.length})</h3>
                  <div className="space-y-2">
                    {dispute.attachments.map((att) => (
                      <div key={att.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{att.file_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {(att.file_size / 1024).toFixed(1)} KB
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Booking Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Client</div>
                  <div className="font-medium">{timeline.client_name}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Freelancer</div>
                  <div className="font-medium">{timeline.freelancer_name}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Service</div>
                  <div className="font-medium">{timeline.service_name}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Scheduled</div>
                  <div className="font-medium">
                    {formatDateTime(timeline.scheduled_start)} - {formatDateTime(timeline.scheduled_end)}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm text-muted-foreground">Amount</div>
                  <div className="font-medium">{formatPrice(timeline.total_amount)}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="flex gap-2">
                  <Badge variant="outline">{timeline.booking_status}</Badge>
                  {timeline.payment_status && (
                    <Badge variant="outline">{timeline.payment_status}</Badge>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Audit Log</h3>
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-sm p-3 bg-muted rounded-lg">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium">{log.action.replace(/_/g, " ")}</div>
                    <div className="text-muted-foreground text-xs mt-1">
                      {log.performed_by_name || "System"} · {formatDateTime(log.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          {dispute.status !== "resolved" && (
            <>
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Status Actions</h3>
                <div className="space-y-2">
                  {dispute.status === "new" && (
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateStatus("in_review")}
                      className="w-full"
                    >
                      Move to Review
                    </Button>
                  )}
                  {dispute.status === "in_review" && (
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateStatus("new")}
                      className="w-full"
                    >
                      Move to New
                    </Button>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Resolve Dispute</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Resolution Type</label>
                    <select
                      value={resolutionType}
                      onChange={(e) => setResolutionType(e.target.value)}
                      className="w-full p-2 border rounded-lg bg-background"
                    >
                      <option value="">Select resolution...</option>
                      <option value="full_refund">Full Refund to Client</option>
                      <option value="partial_refund">Partial Refund</option>
                      <option value="release_to_freelancer">Release to Freelancer</option>
                      <option value="no_action">No Action</option>
                    </select>
                  </div>

                  {resolutionType === "partial_refund" && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Refund Amount (pence)</label>
                      <input
                        type="number"
                        value={resolutionAmount}
                        onChange={(e) => setResolutionAmount(e.target.value)}
                        placeholder="e.g., 5000 for £50"
                        className="w-full p-2 border rounded-lg bg-background"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium mb-2 block">Resolution Notes</label>
                    <Textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Explain the resolution decision..."
                      rows={4}
                    />
                  </div>

                  <Button
                    onClick={handleResolve}
                    disabled={resolving || !resolutionType}
                    className="w-full"
                  >
                    {resolving ? "Resolving..." : "Resolve Dispute"}
                  </Button>
                </div>
              </Card>
            </>
          )}

          {dispute.status === "resolved" && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Resolution</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-muted-foreground">Type</div>
                  <div className="font-medium">{dispute.resolution_type?.replace(/_/g, " ")}</div>
                </div>
                {dispute.resolution_amount && (
                  <div>
                    <div className="text-muted-foreground">Amount</div>
                    <div className="font-medium">{formatPrice(dispute.resolution_amount)}</div>
                  </div>
                )}
                {dispute.resolution_notes && (
                  <div>
                    <div className="text-muted-foreground">Notes</div>
                    <div className="font-medium">{dispute.resolution_notes}</div>
                  </div>
                )}
                <div>
                  <div className="text-muted-foreground">Resolved By</div>
                  <div className="font-medium">{dispute.resolved_by_name}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Resolved At</div>
                  <div className="font-medium">{dispute.resolved_at && formatDateTime(dispute.resolved_at)}</div>
                </div>
              </div>
            </Card>
          )}

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Internal Notes</h3>
            <div className="space-y-3 mb-4">
              {dispute.notes.map((n) => (
                <div key={n.id} className="p-3 bg-muted rounded-lg text-sm">
                  <div className="text-muted-foreground text-xs mb-1">
                    {formatDateTime(n.created_at)}
                  </div>
                  <p>{n.note}</p>
                </div>
              ))}
            </div>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add internal note..."
              rows={3}
              className="mb-3"
            />
            <Button
              onClick={handleAddNote}
              disabled={addingNote || !note.trim()}
              variant="outline"
              className="w-full"
            >
              {addingNote ? "Adding..." : "Add Note"}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
