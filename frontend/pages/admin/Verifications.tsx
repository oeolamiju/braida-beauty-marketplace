import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

export default function AdminVerifications() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Freelancer Verifications</h1>
        <p className="text-muted-foreground">Review and approve freelancer applications</p>
      </div>

      <Card className="p-12 text-center">
        <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Freelancer Verifications</h3>
        <p className="text-muted-foreground">
          Verification management features will be available here.
        </p>
      </Card>
    </div>
  );
}
