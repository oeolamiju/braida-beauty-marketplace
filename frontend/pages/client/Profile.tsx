import { Card } from "@/components/ui/card";
import { User } from "lucide-react";

export default function ClientProfile() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <Card className="p-12 text-center">
        <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Profile Settings</h3>
        <p className="text-muted-foreground">
          Authentication and profile management will be available here.
        </p>
      </Card>
    </div>
  );
}
