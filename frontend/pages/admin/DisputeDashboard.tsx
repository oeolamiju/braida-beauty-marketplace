import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  Eye,
  MessageSquare,
  Paperclip,
  User,
  Calendar,
  DollarSign,
  FileText,
  Send,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import backend from "@/lib/backend";

interface DisputeListItem {
  id: string;
  booking_id: string;
  category: string;
  status: string;
  raised_by_name: string;
  client_name: string;
  freelancer_name: string;
  service_name: string;
  created_at: string;
  updated_at: string;
}

interface DisputeStats {
  total: number;
  new: number;
  inReview: number;
  resolved: number;
  averageResolutionHours: number;
}

export default function DisputeDashboard() {
  const [stats, setStats] = useState<DisputeStats | null>(null);
  const [disputes, setDisputes] = useState<DisputeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, disputesRes] = await Promise.all([
        backend.disputes.getDashboardStats(),
        backend.disputes.adminList({
          status: statusFilter === "all" ? undefined : (statusFilter as any),
        }),
      ]);
      setStats(statsRes);
      setDisputes(disputesRes.disputes as any);
    } catch (error) {
      console.error("Failed to load disputes:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load disputes",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      new: { variant: "destructive", label: "New" },
      in_review: { variant: "secondary", label: "In Review" },
      resolved: { variant: "default", label: "Resolved" },
    };
    const style = styles[status] || { variant: "outline" as const, label: status };
    return <Badge variant={style.variant}>{style.label}</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      no_show: "bg-red-100 text-red-700",
      quality_issue: "bg-yellow-100 text-yellow-700",
      safety_issue: "bg-purple-100 text-purple-700",
      other: "bg-gray-100 text-gray-700",
    };
    return (
      <Badge className={colors[category] || "bg-gray-100 text-gray-700"}>
        {category.replace(/_/g, " ")}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dispute Management</h1>
        <p className="text-muted-foreground">
          Review and resolve user disputes fairly and efficiently
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.new}</div>
                <div className="text-xs text-muted-foreground">New</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{stats.inReview}</div>
                <div className="text-xs text-muted-foreground">In Review</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
                <div className="text-xs text-muted-foreground">Resolved</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{stats.averageResolutionHours}h</div>
                <div className="text-xs text-muted-foreground">Avg. Resolution</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Disputes</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={loadData}>
          Refresh
        </Button>
      </div>

      {/* Disputes List */}
      <Card>
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : disputes.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No disputes found
          </div>
        ) : (
          <div className="divide-y">
            {disputes.map((dispute) => (
              <div
                key={dispute.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(dispute.status)}
                      {getCategoryBadge(dispute.category)}
                      <span className="text-sm text-muted-foreground">
                        Booking #{dispute.booking_id}
                      </span>
                    </div>
                    <h3 className="font-semibold mb-1">{dispute.service_name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {dispute.client_name} vs {dispute.freelancer_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(dispute.created_at).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Raised by: {dispute.raised_by_name}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDisputeId(dispute.id)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Dispute Detail Modal */}
      {selectedDisputeId && (
        <DisputeDetailModal
          disputeId={selectedDisputeId}
          onClose={() => {
            setSelectedDisputeId(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

// Dispute Detail Modal Component
function DisputeDetailModal({
  disputeId,
  onClose,
}: {
  disputeId: string;
  onClose: () => void;
}) {
  const [dispute, setDispute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [resolution, setResolution] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDispute();
  }, [disputeId]);

  const loadDispute = async () => {
    setLoading(true);
    try {
      const data = await backend.disputes.getDisputeDetails({ id: disputeId });
      setDispute(data);
    } catch (error) {
      console.error("Failed to load dispute:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!resolution || !resolutionNote) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a resolution and add a note",
      });
      return;
    }

    setResolving(true);
    try {
      await backend.disputes.adminResolve({
        dispute_id: disputeId,
        resolution_type: resolution as any,
        resolution_amount: refundAmount ? Math.round(parseFloat(refundAmount) * 100) : undefined,
        resolution_notes: resolutionNote,
      });

      toast({
        title: "Dispute Resolved",
        description: "The dispute has been resolved successfully",
      });
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Resolve",
        description: error.message || "Could not resolve the dispute",
      });
    } finally {
      setResolving(false);
    }
  };

  const handleAddNote = async () => {
    if (!internalNote.trim()) return;

    setAddingNote(true);
    try {
      await backend.disputes.adminAddNote({
        dispute_id: disputeId,
        note: internalNote,
      });
      setInternalNote("");
      loadDispute();
    } catch (error) {
      console.error("Failed to add note:", error);
    } finally {
      setAddingNote(false);
    }
  };

  if (loading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="p-8 text-center">Loading...</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!dispute) return null;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dispute #{dispute.id.slice(0, 8)}</DialogTitle>
          <DialogDescription>
            Review all details and resolve the dispute
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 mt-4">
          {/* Status and Category */}
          <div className="flex items-center gap-4">
            <Badge
              variant={dispute.status === "resolved" ? "default" : "destructive"}
            >
              {dispute.status}
            </Badge>
            <Badge variant="outline">{dispute.category.replace(/_/g, " ")}</Badge>
          </div>

          {/* Parties */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Client</h4>
              <p className="text-sm">{dispute.clientName}</p>
              <p className="text-sm text-muted-foreground">{dispute.clientEmail}</p>
            </Card>
            <Card className="p-4">
              <h4 className="font-semibold mb-2">Freelancer</h4>
              <p className="text-sm">{dispute.freelancerName}</p>
              <p className="text-sm text-muted-foreground">{dispute.freelancerEmail}</p>
            </Card>
          </div>

          {/* Booking Info */}
          <Card className="p-4">
            <h4 className="font-semibold mb-2">Booking Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Service:</span>{" "}
                {dispute.serviceTitle}
              </div>
              <div>
                <span className="text-muted-foreground">Date:</span>{" "}
                {new Date(dispute.bookingDate).toLocaleDateString("en-GB")}
              </div>
              <div>
                <span className="text-muted-foreground">Total:</span>{" "}
                £{(dispute.bookingTotal / 100).toFixed(2)}
              </div>
              <div>
                <span className="text-muted-foreground">Payment:</span>{" "}
                {dispute.paymentStatus} / Escrow: {dispute.escrowStatus}
              </div>
            </div>
          </Card>

          {/* Description */}
          <Card className="p-4">
            <h4 className="font-semibold mb-2">Dispute Description</h4>
            <p className="text-sm whitespace-pre-wrap">{dispute.description}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Raised by: {dispute.raisedByName} ({dispute.raisedByRole})
            </p>
          </Card>

          {/* Attachments */}
          {dispute.attachments.length > 0 && (
            <Card className="p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Paperclip className="h-4 w-4" />
                Attachments ({dispute.attachments.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {dispute.attachments.map((att: any) => (
                  <a
                    key={att.id}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {att.filename}
                  </a>
                ))}
              </div>
            </Card>
          )}

          {/* Messages */}
          {dispute.messages.length > 0 && (
            <Card className="p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Booking Messages ({dispute.messages.length})
              </h4>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {dispute.messages.map((msg: any) => (
                  <div key={msg.id} className="text-sm p-2 bg-gray-50 rounded">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{msg.senderName}</span>
                      <span>{new Date(msg.createdAt).toLocaleString("en-GB")}</span>
                    </div>
                    <p>{msg.content}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Admin Notes */}
          <Card className="p-4">
            <h4 className="font-semibold mb-2">Admin Notes</h4>
            <div className="space-y-2 mb-4">
              {dispute.notes.map((note: any) => (
                <div
                  key={note.id}
                  className={`text-sm p-2 rounded ${
                    note.isInternal ? "bg-yellow-50" : "bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{note.authorName}</span>
                    <span>{new Date(note.createdAt).toLocaleString("en-GB")}</span>
                  </div>
                  <p>{note.content}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Add internal note..."
              />
              <Button onClick={handleAddNote} disabled={addingNote} size="sm">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Resolution (if not resolved) */}
          {dispute.status !== "resolved" && (
            <Card className="p-4 border-orange-200 bg-orange-50">
              <h4 className="font-semibold mb-4">Resolve Dispute</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Resolution Type *
                  </label>
                  <Select value={resolution} onValueChange={setResolution}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select resolution" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_refund">Full Refund to Client</SelectItem>
                      <SelectItem value="partial_refund">Partial Refund</SelectItem>
                      <SelectItem value="release_to_freelancer">Release to Freelancer</SelectItem>
                      <SelectItem value="split">Split 50/50</SelectItem>
                      <SelectItem value="no_action">No Financial Action</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {resolution === "partial_refund" && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Refund Amount (£) *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      placeholder="0.00"
                      max={dispute.bookingTotal / 100}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Resolution Note *
                  </label>
                  <textarea
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    placeholder="Explain the resolution decision..."
                    className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                  />
                </div>

                <Button
                  onClick={handleResolve}
                  disabled={resolving}
                  className="w-full"
                >
                  {resolving ? "Resolving..." : "Resolve Dispute"}
                </Button>
              </div>
            </Card>
          )}

          {/* Previous Resolution */}
          {dispute.resolution && (
            <Card className="p-4 border-green-200 bg-green-50">
              <h4 className="font-semibold mb-2 text-green-800">Resolution</h4>
              <div className="text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">Type:</span>{" "}
                  {dispute.resolution.type.replace(/_/g, " ")}
                </p>
                {dispute.resolution.refundAmount && (
                  <p>
                    <span className="text-muted-foreground">Refund:</span>{" "}
                    £{(dispute.resolution.refundAmount / 100).toFixed(2)}
                  </p>
                )}
                <p>
                  <span className="text-muted-foreground">Note:</span>{" "}
                  {dispute.resolution.note}
                </p>
                <p className="text-xs text-muted-foreground">
                  Resolved on {new Date(dispute.resolution.resolvedAt).toLocaleString("en-GB")}
                </p>
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

