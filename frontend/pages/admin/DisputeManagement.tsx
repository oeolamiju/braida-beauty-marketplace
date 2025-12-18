import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Search, Download, Clock, Eye, CheckCircle2 } from "lucide-react";
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

export default function DisputeManagement() {
  const [disputes, setDisputes] = useState<DisputeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDispute, setSelectedDispute] = useState<DisputeListItem | null>(null);
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

  const activeDisputes = disputes.filter(d => d.status === 'new').length;
  const needsReview = disputes.filter(d => d.status === 'in_review').length;
  const resolvedThisWeek = disputes.filter(d => d.status === 'resolved').length;

  const filteredDisputes = disputes.filter(d => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      d.id.toLowerCase().includes(search) ||
      d.client_name.toLowerCase().includes(search) ||
      d.freelancer_name.toLowerCase().includes(search)
    );
  });

  function getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHrs < 1) return "Just now";
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays === 1) return "1d ago";
    return `${diffDays}d ago`;
  }

  function getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      "no-show": "No Show",
      quality: "Quality Issue",
      safety: "Safety",
      other: "Other",
    };
    return labels[category] || category;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading disputes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Dispute Resolution Center</h1>
              <p className="text-muted-foreground mt-1">
                Review and resolve client and stylist issues fairly.
              </p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search ID, Client, or Stylist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Active Disputes</div>
                <div className="text-3xl font-bold">{activeDisputes}</div>
                <div className="text-xs text-green-600 font-medium mt-1">+2% this week</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Needs Review</div>
                <div className="text-3xl font-bold">{needsReview}</div>
                <div className="text-xs text-red-600 font-medium mt-1">High Priority</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Resolved (Weekly)</div>
                <div className="text-3xl font-bold">{resolvedThisWeek}</div>
                <div className="text-xs text-green-600 font-medium mt-1">+15% efficiency</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Avg. Time</div>
                <div className="text-3xl font-bold">48h</div>
                <div className="text-xs text-green-600 font-medium mt-1">-5% improvement</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-5">
            <Card className="bg-white">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Dispute Management</h2>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant={statusFilter === "" ? "default" : "outline"}
                    onClick={() => setStatusFilter("")}
                    className={statusFilter === "" ? "bg-black text-white hover:bg-black/90" : ""}
                  >
                    All Disputes
                  </Button>
                  <Button
                    size="sm"
                    variant={statusFilter === "new" ? "default" : "outline"}
                    onClick={() => setStatusFilter("new")}
                    className={statusFilter === "new" ? "bg-orange-600 text-white hover:bg-orange-600/90" : ""}
                  >
                    New ({disputes.filter(d => d.status === 'new').length})
                  </Button>
                  <Button
                    size="sm"
                    variant={statusFilter === "in_review" ? "default" : "outline"}
                    onClick={() => setStatusFilter("in_review")}
                    className={statusFilter === "in_review" ? "bg-blue-600 text-white hover:bg-blue-600/90" : ""}
                  >
                    Under Review ({needsReview})
                  </Button>
                  <Button
                    size="sm"
                    variant={statusFilter === "resolved" ? "default" : "outline"}
                    onClick={() => setStatusFilter("resolved")}
                    className={statusFilter === "resolved" ? "bg-green-600 text-white hover:bg-green-600/90" : ""}
                  >
                    Resolved
                  </Button>
                </div>
              </div>

              <div className="divide-y max-h-[calc(100vh-400px)] overflow-y-auto">
                {filteredDisputes.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Disputes Found</h3>
                    <p className="text-muted-foreground text-sm">
                      {statusFilter
                        ? `No disputes with status "${statusFilter}"`
                        : "No disputes have been raised yet"}
                    </p>
                  </div>
                ) : (
                  filteredDisputes.map((dispute) => (
                    <div
                      key={dispute.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedDispute?.id === dispute.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                      }`}
                      onClick={() => setSelectedDispute(dispute)}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={`text-xs font-bold uppercase ${
                              dispute.status === 'new' ? 'bg-red-100 text-red-700' :
                              dispute.status === 'in_review' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}
                          >
                            {dispute.status === 'new' ? 'URGENT' : dispute.status === 'in_review' ? 'REVIEW' : 'RESOLVED'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {getTimeAgo(dispute.created_at)}
                          </span>
                        </div>
                      </div>

                      <div className="mb-2">
                        <div className="font-semibold text-sm mb-1">
                          #D-2024-{dispute.id.slice(0, 3).toUpperCase()}
                        </div>
                        <div className="text-xs text-muted-foreground mb-1">
                          {dispute.raised_by_name} vs {dispute.freelancer_name}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getCategoryLabel(dispute.category)}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          <div className="col-span-7">
            {selectedDispute ? (
              <Card className="bg-white p-6">
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">
                        Dispute #D-2024-{selectedDispute.id.slice(0, 3).toUpperCase()}
                      </h2>
                      <div className="flex items-center gap-2 mb-4">
                        <Badge
                          className={`${
                            selectedDispute.category === 'quality' ? 'bg-red-100 text-red-700' :
                            selectedDispute.category === 'no-show' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {getCategoryLabel(selectedDispute.category)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Raised on {new Date(selectedDispute.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/admin/disputes/${selectedDispute.id}`)}
                      >
                        Message User
                      </Button>
                      <Button
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                        onClick={() => navigate(`/admin/disputes/${selectedDispute.id}`)}
                      >
                        Issue Refund
                      </Button>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <span className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        😟
                      </span>
                      Client Report
                    </h3>
                    <p className="text-sm mb-2">Submitted by {selectedDispute.raised_by_name}</p>
                    <h4 className="font-medium text-sm mb-2">DESCRIPTION</h4>
                    <p className="text-sm text-muted-foreground">
                      The braids started unraveling less than 24 hours after the appointment. 
                      I paid for "Goddess Braids" which are supposed to last 4-6 weeks. 
                      The stylist rushed through the appointment and used the wrong gel. 
                      I tried contacting her but she blocked me.
                    </p>
                    <div className="mt-4">
                      <h4 className="font-medium text-sm mb-2">EVIDENCE</h4>
                      <div className="flex gap-2">
                        <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                          <div className="w-full h-full bg-gradient-to-br from-amber-900 to-amber-700"></div>
                        </div>
                        <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                          <div className="w-full h-full bg-gradient-to-br from-amber-800 to-amber-600"></div>
                        </div>
                        <div className="w-12 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                          0:15
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <Card className="p-4 bg-gray-50">
                      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <span className="text-lg">📋</span>
                        Booking Details
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Service</span>
                          <span className="font-medium">{selectedDispute.service_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Stylist</span>
                          <span className="font-medium text-orange-600">@{selectedDispute.freelancer_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date</span>
                          <span className="font-medium">Oct 23, 2023</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Paid</span>
                          <span className="font-medium">£120.00</span>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => navigate(`/admin/bookings/${selectedDispute.booking_id}`)}
                        >
                          View Booking
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          Stylist History
                        </Button>
                      </div>
                    </Card>

                    <Card className="p-4 bg-yellow-50">
                      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <span className="text-lg">🔒</span>
                        Internal Notes
                      </h3>
                      <div className="space-y-2 mb-3">
                        <div className="text-xs bg-white p-2 rounded border">
                          <span className="text-muted-foreground">Admin Sarah • 1h ago</span>
                          <p className="mt-1">Reached out to stylist for comment. No response yet.</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a private note..."
                          className="flex-1 text-sm"
                        />
                        <Button size="sm" variant="outline">
                          →
                        </Button>
                      </div>
                    </Card>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/admin/disputes/${selectedDispute.id}`)}
                    >
                      View Full Details
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="bg-white p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3">Select a Dispute</h3>
                <p className="text-muted-foreground">
                  Choose a dispute from the inbox to view details and take action
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
