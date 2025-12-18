import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import backend from "@/lib/backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, XCircle, Clock, ArrowLeft, FileText, Download } from "lucide-react";

export default function VerificationDetail() {
  const { freelancerId } = useParams<{ freelancerId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [verification, setVerification] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionNote, setRejectionNote] = useState("");
  const [approvalNotes, setApprovalNotes] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  useEffect(() => {
    if (freelancerId) {
      loadVerification();
    }
  }, [freelancerId]);

  const loadVerification = async () => {
    try {
      const result = await backend.verification.adminGet({ freelancerId: freelancerId! });
      setVerification(result);
    } catch (err: any) {
      console.error("Failed to load verification:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to load verification",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!freelancerId) return;

    setActionLoading(true);
    try {
      await backend.verification.adminApprove({
        freelancerId,
        notes: approvalNotes || undefined,
      });

      toast({
        title: "Verification approved",
        description: "The freelancer has been verified successfully",
      });

      navigate("/admin/verifications");
    } catch (err: any) {
      console.error("Approval failed:", err);
      toast({
        title: "Approval failed",
        description: err.message || "Failed to approve verification",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!freelancerId || !rejectionNote.trim()) {
      toast({
        title: "Missing rejection note",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(true);
    try {
      await backend.verification.adminReject({
        freelancerId,
        rejectionNote,
      });

      toast({
        title: "Verification rejected",
        description: "The freelancer has been notified",
      });

      navigate("/admin/verifications");
    } catch (err: any) {
      console.error("Rejection failed:", err);
      toast({
        title: "Rejection failed",
        description: err.message || "Failed to reject verification",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadDocument = async () => {
    if (!freelancerId) return;

    try {
      const result = await backend.verification.getDocument({ freelancerId });
      window.open(result.downloadUrl, '_blank');
    } catch (err: any) {
      console.error("Download failed:", err);
      toast({
        title: "Download failed",
        description: err.message || "Failed to download document",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="w-4 h-4 mr-1" />
            Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500 text-white">
            <Clock className="w-4 h-4 mr-1" />
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-4 h-4 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!verification) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center text-muted-foreground">Verification not found</div>
      </div>
    );
  }

  const isPending = verification.status === 'pending';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/admin/verifications")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Verification Review</h1>
        </div>
        {getStatusBadge(verification.status)}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Freelancer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Display Name</p>
              <p className="font-medium">{verification.displayName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{verification.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Freelancer Name</p>
              <p className="font-medium">{verification.freelancerName}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>KYC Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Legal Name</p>
              <p className="font-medium">{verification.legalName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p className="font-medium">{verification.dateOfBirth}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">
                {verification.addressLine1}
                {verification.addressLine2 && <>, {verification.addressLine2}</>}
                <br />
                {verification.city}, {verification.postcode}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ID Document</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleDownloadDocument} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download ID Document
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submission Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Submitted</p>
            <p className="font-medium">{new Date(verification.submittedAt).toLocaleString()}</p>
          </div>
          {verification.reviewedAt && (
            <div>
              <p className="text-sm text-muted-foreground">Reviewed</p>
              <p className="font-medium">
                {new Date(verification.reviewedAt).toLocaleString()}
                {verification.reviewedBy && ` by ${verification.reviewedBy}`}
              </p>
            </div>
          )}
          {verification.rejectionNote && (
            <div>
              <p className="text-sm text-muted-foreground">Rejection Reason</p>
              <p className="font-medium text-destructive">{verification.rejectionNote}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {verification.actionLogs && verification.actionLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Action History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {verification.actionLogs.map((log: any, idx: number) => (
                <div key={idx} className="border-l-2 border-muted pl-4 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{log.action}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {log.adminName && (
                    <p className="text-sm text-muted-foreground">by {log.adminName}</p>
                  )}
                  {log.notes && <p className="text-sm mt-1">{log.notes}</p>}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isPending && (
        <Card>
          <CardHeader>
            <CardTitle>Review Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showRejectForm ? (
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">Approval Notes (Optional)</label>
                  <Input
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    placeholder="Add notes about this approval"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-2">Rejection Reason *</label>
                <textarea
                  value={rejectionNote}
                  onChange={(e) => setRejectionNote(e.target.value)}
                  placeholder="Explain why this verification is being rejected"
                  className="w-full px-3 py-2 border rounded-md bg-background min-h-[100px]"
                  required
                />
              </div>
            )}

            <div className="flex gap-4">
              {!showRejectForm ? (
                <>
                  <Button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Verification
                  </Button>
                  <Button
                    onClick={() => setShowRejectForm(true)}
                    disabled={actionLoading}
                    variant="destructive"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Verification
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleReject}
                    disabled={actionLoading || !rejectionNote.trim()}
                    variant="destructive"
                  >
                    Confirm Rejection
                  </Button>
                  <Button
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectionNote("");
                    }}
                    disabled={actionLoading}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
