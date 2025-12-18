import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import backend from "@/lib/backend";
import type { Payout, PayoutAuditLog, PayoutStatus } from "~backend/payouts/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  User,
  Calendar,
  FileText
} from "lucide-react";

export default function PayoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [payout, setPayout] = useState<Payout | null>(null);
  const [auditLogs, setAuditLogs] = useState<PayoutAuditLog[]>([]);
  const [freelancerName, setFreelancerName] = useState("");
  const [freelancerEmail, setFreelancerEmail] = useState("");
  
  const [overrideStatus, setOverrideStatus] = useState<PayoutStatus>("cancelled");
  const [adminNotes, setAdminNotes] = useState("");
  const [overriding, setOverriding] = useState(false);

  useEffect(() => {
    if (id) {
      loadPayout();
    }
  }, [id]);

  const loadPayout = async () => {
    try {
      setLoading(true);
      const res = await backend.payouts.adminGetPayout({ id: parseInt(id!) });
      setPayout(res.payout);
      setAuditLogs(res.auditLogs);
      setFreelancerName(res.freelancerName);
      setFreelancerEmail(res.freelancerEmail);
    } catch (error: any) {
      console.error("Failed to load payout:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load payout details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOverride = async () => {
    if (!adminNotes.trim()) {
      toast({
        title: "Error",
        description: "Please provide admin notes for the override",
        variant: "destructive",
      });
      return;
    }

    try {
      setOverriding(true);
      await backend.payouts.adminOverridePayout({
        id: parseInt(id!),
        status: overrideStatus,
        adminNotes,
      });
      
      toast({
        title: "Success",
        description: "Payout status overridden successfully",
      });
      
      await loadPayout();
      setAdminNotes("");
    } catch (error: any) {
      console.error("Failed to override payout:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to override payout status",
        variant: "destructive",
      });
    } finally {
      setOverriding(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: PayoutStatus) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
      case "scheduled":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "failed":
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "overridden":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!payout) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <Card className="p-12 text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Payout not found</p>
          <Button onClick={() => navigate("/admin/payouts")} className="mt-4">
            Back to Payouts
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/payouts")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-3xl font-bold">Payout #{payout.id}</h1>
        <Badge className={getStatusColor(payout.status)}>
          {payout.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Freelancer Information
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{freelancerName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{freelancerEmail}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Freelancer ID</p>
              <p className="font-medium">#{payout.freelancerId}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Payment Details
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Service Amount</p>
              <p className="font-medium">{formatCurrency(payout.serviceAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Commission</p>
              <p className="font-medium text-red-600">-{formatCurrency(payout.commissionAmount)}</p>
            </div>
            {payout.bookingFee > 0 && (
              <div>
                <p className="text-sm text-muted-foreground">Booking Fee</p>
                <p className="font-medium text-red-600">-{formatCurrency(payout.bookingFee)}</p>
              </div>
            )}
            <div className="pt-3 border-t">
              <p className="text-sm text-muted-foreground">Payout Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(payout.amount)}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Timeline
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Created</p>
            <p className="font-medium">{formatDate(payout.createdAt)}</p>
          </div>
          {payout.scheduledDate && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Scheduled</p>
              <p className="font-medium">{formatDate(payout.scheduledDate)}</p>
            </div>
          )}
          {payout.processedDate && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Processed</p>
              <p className="font-medium">{formatDate(payout.processedDate)}</p>
            </div>
          )}
        </div>
        
        {payout.stripePayoutId && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-1">Stripe Payout ID</p>
            <p className="font-mono text-sm">{payout.stripePayoutId}</p>
          </div>
        )}
        
        {payout.errorMessage && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900 dark:text-red-100">Error</p>
                <p className="text-sm text-red-800 dark:text-red-200">{payout.errorMessage}</p>
              </div>
            </div>
          </div>
        )}
        
        {payout.adminNotes && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Admin Notes</p>
            <p className="text-sm text-blue-800 dark:text-blue-200">{payout.adminNotes}</p>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Audit Log
        </h2>
        
        {auditLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No audit logs</p>
        ) : (
          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Clock className="w-4 h-4 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{log.action.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(log.createdAt)}
                    {log.actorId && ` • User #${log.actorId}`}
                  </p>
                  {log.oldStatus && log.newStatus && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {log.oldStatus} → {log.newStatus}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Admin Override</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Override the payout status in case of disputes or other exceptional circumstances.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">New Status</label>
            <select
              className="w-full p-2 border rounded-lg"
              value={overrideStatus}
              onChange={(e) => setOverrideStatus(e.target.value as PayoutStatus)}
            >
              <option value="pending">Pending</option>
              <option value="scheduled">Scheduled</option>
              <option value="processing">Processing</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
              <option value="overridden">Overridden</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Admin Notes (Required)</label>
            <Input
              placeholder="Explain the reason for this override..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={handleOverride}
            disabled={overriding || !adminNotes.trim()}
            variant="destructive"
          >
            {overriding ? "Overriding..." : "Override Status"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
