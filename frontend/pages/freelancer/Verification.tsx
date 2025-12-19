import { useState, useEffect } from "react";
import backend from "@/lib/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { createVeriffFrame } from "@veriff/incontext-sdk";

export default function Verification() {
  const { toast } = useToast();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const result = await backend.verification.getStatus();
      setStatus(result);
    } catch (err: any) {
      console.error("Failed to load verification status:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to load verification status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !dateOfBirth || !addressLine1 || !city || !postcode) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const session = await backend.verification.startKyc({
        firstName,
        lastName,
        dateOfBirth,
        addressLine1,
        city,
        postcode,
      });

      const veriffFrame = createVeriffFrame({
        url: session.sessionUrl,
        onEvent: async (msg: string) => {
          if (msg === "FINISHED") {
            try {
              const result = await backend.verification.completeKyc({
                verificationId: session.verificationId,
              });

              toast({
                title: result.status === "verified" ? "Verified!" : "Submitted",
                description: result.message,
              });

              loadStatus();
            } catch (err: any) {
              console.error("Failed to complete verification:", err);
              toast({
                title: "Error",
                description: err.message || "Failed to complete verification",
                variant: "destructive",
              });
            }
          }
        },
      });

      veriffFrame.mount();
    } catch (err: any) {
      console.error("Failed to start verification:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to start verification",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const getStatusBadge = () => {
    switch (status?.status) {
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
            Pending Review
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
        return (
          <Badge variant="secondary">
            <AlertCircle className="w-4 h-4 mr-1" />
            Unverified
          </Badge>
        );
    }
  };

  const canSubmit = status?.status === 'unverified' || status?.status === 'rejected';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">KYC Verification</h1>
        <p className="text-muted-foreground mt-2">
          Complete your verification to unlock payouts and display the Braida Verified badge
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Verification Status</CardTitle>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {status?.status === 'verified' && (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-green-800 dark:text-green-200">
                Your account is verified! You can now receive payouts and your profile displays the Braida Verified badge.
              </p>
            </div>
          )}

          {status?.status === 'pending' && (
            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-800 dark:text-yellow-200">
                Your verification is under review. We'll notify you once it's been processed.
              </p>
              {status?.submittedAt && (
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                  Submitted: {new Date(status.submittedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {status?.status === 'rejected' && status?.rejectionNote && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="font-medium text-red-800 dark:text-red-200 mb-2">Rejection Reason:</p>
              <p className="text-red-700 dark:text-red-300">{status.rejectionNote}</p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                Please correct the issues and resubmit your verification.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {canSubmit && (
        <Card>
          <CardHeader>
            <CardTitle>Start Verification</CardTitle>
            <CardDescription>
              Provide your information to start the identity verification process with Veriff.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name *</label>
                  <Input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Last Name *</label>
                  <Input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Date of Birth *</label>
                <Input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  max={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Address Line 1 *</label>
                <Input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="Street address"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City *</label>
                  <Input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Postcode *</label>
                  <Input
                    type="text"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    placeholder="Postcode"
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Starting verification..." : status?.status === 'rejected' ? "Retry Verification" : "Start Verification"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
