import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import backend from "@/lib/backend";
import type { Payout, PayoutStatus } from "~backend/payouts/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { 
  DollarSign, 
  Search, 
  Filter,
  Eye,
  AlertCircle
} from "lucide-react";

interface PayoutWithFreelancer extends Payout {
  freelancerName: string;
  freelancerEmail: string;
}

export default function AdminPayoutsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState<PayoutWithFreelancer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadPayouts();
  }, [page, statusFilter]);

  const loadPayouts = async () => {
    try {
      setLoading(true);
      const res = await backend.payouts.adminListPayouts({
        page,
        limit: 20,
        status: statusFilter || undefined,
      });
      setPayouts(res.payouts);
      setTotal(res.total);
    } catch (error: any) {
      console.error("Failed to load payouts:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load payouts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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

  const filteredPayouts = payouts.filter(payout => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      payout.freelancerName.toLowerCase().includes(query) ||
      payout.freelancerEmail.toLowerCase().includes(query) ||
      payout.bookingId.toString().includes(query)
    );
  });

  const totalPages = Math.ceil(total / 20);

  if (loading && page === 1) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payouts</h1>
        <Button 
          variant="outline" 
          onClick={() => navigate("/admin/settings/payments")}
        >
          Payment Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Payouts</p>
          <p className="text-2xl font-bold">{total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Pending</p>
          <p className="text-2xl font-bold">
            {payouts.filter(p => p.status === "pending" || p.status === "scheduled").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Processing</p>
          <p className="text-2xl font-bold">
            {payouts.filter(p => p.status === "processing").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-1">Failed</p>
          <p className="text-2xl font-bold text-red-600">
            {payouts.filter(p => p.status === "failed").length}
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by freelancer name, email, or booking ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            {["", "pending", "scheduled", "processing", "paid", "failed"].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                size="sm"
              >
                {status || "All"}
              </Button>
            ))}
          </div>
        </div>

        {filteredPayouts.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No payouts found</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {filteredPayouts.map((payout) => (
                <div 
                  key={payout.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/payouts/${payout.id}`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold">{payout.freelancerName}</p>
                      <Badge className={getStatusColor(payout.status)}>
                        {payout.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {payout.freelancerEmail} • Booking #{payout.bookingId}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {payout.processedDate 
                        ? `Paid on ${formatDate(payout.processedDate)}`
                        : payout.scheduledDate
                        ? `Scheduled for ${formatDate(payout.scheduledDate)}`
                        : `Created ${formatDate(payout.createdAt)}`
                      }
                    </p>
                    {payout.errorMessage && (
                      <div className="flex items-center gap-2 mt-2 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <p className="text-xs">{payout.errorMessage}</p>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{formatCurrency(payout.amount)}</p>
                    <p className="text-xs text-muted-foreground">
                      Commission: {formatCurrency(payout.commissionAmount)}
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/payouts/${payout.id}`);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} payouts
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
