import { useState, useEffect } from "react";
import backend from "@/lib/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, XCircle, Clock, AlertCircle, Upload } from "lucide-react";

export default function Verification() {
  const { toast } = useToast();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [legalName, setLegalName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [postcode, setPostcode] = useState("");
  const [idDocumentType, setIdDocumentType] = useState<"passport" | "brp" | "driving_licence">("passport");
  const [idDocumentFile, setIdDocumentFile] = useState<File | null>(null);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const result = await backend.verification.getStatus();
      setStatus(result);

      if (result.status !== 'unverified' && result.status !== 'rejected') {
        setLegalName(result.legalName || "");
        setDateOfBirth(result.dateOfBirth || "");
        setAddressLine1(result.addressLine1 || "");
        setAddressLine2(result.addressLine2 || "");
        setCity(result.city || "");
        setPostcode(result.postcode || "");
      }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 10MB",
          variant: "destructive",
        });
        return;
      }
      setIdDocumentFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!legalName || !dateOfBirth || !addressLine1 || !city || !postcode) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!idDocumentFile) {
      toast({
        title: "Missing document",
        description: "Please upload your ID document",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(idDocumentFile);
      reader.onload = async () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(",")[1];

        try {
          await backend.verification.submit({
            legalName,
            dateOfBirth,
            addressLine1,
            addressLine2: addressLine2 || undefined,
            city,
            postcode,
            idDocumentData: base64Data,
            idDocumentType,
          });

          toast({
            title: "Verification submitted",
            description: "Your verification has been submitted for review",
          });

          loadStatus();
        } catch (err: any) {
          console.error("Verification submission failed:", err);
          toast({
            title: "Submission failed",
            description: err.message || "Failed to submit verification",
            variant: "destructive",
          });
        } finally {
          setSubmitting(false);
        }
      };
    } catch (err: any) {
      console.error("File read error:", err);
      toast({
        title: "File error",
        description: "Failed to read document file",
        variant: "destructive",
      });
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
            <CardTitle>Verification Information</CardTitle>
            <CardDescription>
              Provide your legal information and ID document. All information is encrypted and stored securely.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Legal Name *</label>
                <Input
                  type="text"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="Full name as shown on ID"
                  required
                />
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

              <div>
                <label className="block text-sm font-medium mb-2">Address Line 2</label>
                <Input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Apartment, suite, etc. (optional)"
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

              <div>
                <label className="block text-sm font-medium mb-2">ID Document Type *</label>
                <select
                  value={idDocumentType}
                  onChange={(e) => setIdDocumentType(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  required
                >
                  <option value="passport">Passport</option>
                  <option value="brp">Biometric Residence Permit (BRP)</option>
                  <option value="driving_licence">UK Driving Licence</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Upload ID Document *</label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                    className="hidden"
                    id="id-upload"
                    required
                  />
                  <label htmlFor="id-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {idDocumentFile ? idDocumentFile.name : "Click to upload (Max 10MB)"}
                    </p>
                  </label>
                </div>
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Submitting..." : status?.status === 'rejected' ? "Resubmit Verification" : "Submit Verification"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
