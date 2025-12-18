import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import backend from "@/lib/backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";

export default function VerificationsList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const result = await backend.verification.adminList();
      setSubmissions(result.submissions);
    } catch (err: any) {
      console.error("Failed to load verifications:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to load verifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500 text-white">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const pendingCount = submissions.filter(s => s.status === 'pending').length;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Verifications</h1>
          <p className="text-muted-foreground mt-2">
            Review and approve freelancer KYC submissions
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge className="bg-yellow-500 text-white text-lg px-4 py-2">
            {pendingCount} Pending
          </Badge>
        )}
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No verification submissions yet
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {submissions.map((submission) => (
            <Card key={submission.freelancerId} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{submission.freelancerName}</h3>
                      {getStatusBadge(submission.status)}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Legal Name: {submission.legalName}</p>
                      <p>Email: {submission.email}</p>
                      <p>Location: {submission.city}, {submission.postcode}</p>
                      <p>Submitted: {new Date(submission.submittedAt).toLocaleString()}</p>
                      {submission.reviewedAt && (
                        <p>Reviewed: {new Date(submission.reviewedAt).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate(`/admin/verifications/${submission.freelancerId}`)}
                    variant="outline"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
