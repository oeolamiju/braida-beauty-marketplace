import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ChevronRight, Filter } from "lucide-react";
import backend from "@/lib/backend";
import { useToast } from "@/components/ui/use-toast";

interface DisputeListItem {
  id: string;
  booking_id: string;
  category: string;
  status: string;
  raised_by_name: string;
  client_name: string;
  freelancer_name: string;
  service_name: string;
  created_at: Date;
  updated_at: Date;
}

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState<DisputeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [total, setTotal] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadDisputes();
  }, [statusFilter]);

  async function loadDisputes() {
    try {
      const data = await backend.disputes.adminList({
        status: statusFilter as any,
        limit: 50,
        offset: 0,
      });
      setDisputes(data.disputes);
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to load disputes:", error);
      toast({
        title: "Error",
        description: "Failed to load disputes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function formatDateTime(date: Date): string {
    return new Date(date).toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function getStatusBadge(status: string) {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      new: { variant: "destructive", label: "New" },
      in_review: { variant: "secondary", label: "In Review" },
      resolved: { variant: "default", label: "Resolved" },
    };
    const config = variants[status] || { variant: "secondary" as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }

  function getCategoryBadge(category: string) {
    const labels: Record<string, string> = {
      "no-show": "No-Show",
      quality: "Quality",
      safety: "Safety",
      other: "Other",
    };
    return <Badge variant="outline">{labels[category] || category}</Badge>;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Loading disputes...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Dispute Resolution Center</h1>
            </div>
          </div>
          <p className="text-lg text-muted-foreground ml-15">
            Review and resolve client and stylist issues fairly.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-white border-2 border-orange-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <div className="text-3xl font-bold text-orange-600">
                  {disputes.filter(d => d.status === 'new').length}
                </div>
                <div className="text-sm font-medium text-muted-foreground">Active Disputes</div>
                <div className="text-xs text-green-600 font-medium mt-1">+2% this week</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">👁️</span>
              </div>
              <div className="flex-1">
                <div className="text-3xl font-bold text-blue-600">
                  {disputes.filter(d => d.status === 'in_review').length}
                </div>
                <div className="text-sm font-medium text-muted-foreground">Needs Review</div>
                <div className="text-xs text-red-600 font-medium mt-1">High Priority</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-50 to-white border-2 border-green-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
              <div className="flex-1">
                <div className="text-3xl font-bold text-green-600">
                  {disputes.filter(d => d.status === 'resolved').length}
                </div>
                <div className="text-sm font-medium text-muted-foreground">Resolved (Weekly)</div>
                <div className="text-xs text-green-600 font-medium mt-1">+15% efficiency</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border-2 border-purple-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">⏱️</span>
              </div>
              <div className="flex-1">
                <div className="text-3xl font-bold text-purple-600">48h</div>
                <div className="text-sm font-medium text-muted-foreground">Avg. Time</div>
                <div className="text-xs text-red-600 font-medium mt-1">-5% improvement</div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 mb-6 bg-white shadow-lg border-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Dispute Management</h2>
            <Button variant="outline" className="gap-2">
              Export CSV
            </Button>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant={statusFilter === "" ? "default" : "outline"}
              onClick={() => setStatusFilter("")}
              className={statusFilter === "" ? "bg-black text-white" : ""}
            >
              All Disputes
            </Button>
            <Button
              variant={statusFilter === "new" ? "default" : "outline"}
              onClick={() => setStatusFilter("new")}
              className={statusFilter === "new" ? "bg-orange-600 text-white" : ""}
            >
              New (3)
            </Button>
            <Button
              variant={statusFilter === "in_review" ? "default" : "outline"}
              onClick={() => setStatusFilter("in_review")}
              className={statusFilter === "in_review" ? "bg-blue-600 text-white" : ""}
            >
              Under Review (5)
            </Button>
            <Button
              variant={statusFilter === "resolved" ? "default" : "outline"}
              onClick={() => setStatusFilter("resolved")}
              className={statusFilter === "resolved" ? "bg-green-600 text-white" : ""}
            >
              Refund Requested
            </Button>
            <Button variant="outline">
              Resolved
            </Button>
          </div>
        </Card>

        {disputes.length === 0 ? (
          <Card className="p-16 text-center bg-white">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-3">No Disputes Found</h3>
            <p className="text-muted-foreground text-lg">
              {statusFilter
                ? `No disputes with status "${statusFilter}"`
                : "No disputes have been raised yet"}
            </p>
          </Card>
        ) : (
          <div className="bg-white rounded-2xl border-2 shadow-lg overflow-hidden">
            <div className="divide-y divide-gray-100">
              {disputes.map((dispute, idx) => (
                <div
                  key={dispute.id}
                  className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                    dispute.status === 'new' ? 'bg-orange-50/30 border-l-4 border-l-orange-600' : ''
                  } ${
                    dispute.status === 'in_review' ? 'bg-yellow-50/30 border-l-4 border-l-yellow-600' : ''
                  }`}
                  onClick={() => navigate(`/admin/disputes/${dispute.id}`)}
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex gap-4 flex-1">
                      <div className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${
                        dispute.status === 'new' ? 'bg-red-100 text-red-700' :
                        dispute.status === 'in_review' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {dispute.status === 'new' ? 'URGENT' : dispute.status === 'in_review' ? 'REVIEW' : 'RESOLVED'}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg">
                            #D-2024-{dispute.id.slice(0, 3)}
                          </h3>
                          <Badge className={`${
                            dispute.category === 'quality' ? 'bg-red-100 text-red-700' :
                            dispute.category === 'no-show' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {getCategoryBadge(dispute.category)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {dispute.status === 'new' ? '2h ago' : '5h ago'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm font-medium">{dispute.raised_by_name}</span>
                          <span className="text-xs text-muted-foreground">vs</span>
                          <span className="text-sm font-medium">{dispute.freelancer_name}</span>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">
                          Raised on Oct 24, 2023 at 10:30 AM
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
