import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";
import { BecomeFreelancerCard } from "@/components/BecomeFreelancerCard";

export default function ClientProfile() {
  const [user, setUser] = useState<any>(null);
  const [showFreelancerUpgrade, setShowFreelancerUpgrade] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUser(userData);
      const roles = userData.roles || [userData.role];
      setShowFreelancerUpgrade(!roles.includes("FREELANCER"));
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <div className="space-y-6">
        {showFreelancerUpgrade && (
          <BecomeFreelancerCard 
            onSuccess={() => {
              setShowFreelancerUpgrade(false);
            }}
          />
        )}

        <Card className="p-12 text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Profile Settings</h3>
          <p className="text-muted-foreground">
            Authentication and profile management will be available here.
          </p>
        </Card>
      </div>
    </div>
  );
}
