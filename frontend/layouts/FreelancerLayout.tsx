import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import BottomNav from "@/components/navigation/BottomNav";
import TopNav from "@/components/navigation/TopNav";
import backend from "@/lib/backend";

export default function FreelancerLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        console.log("[FreelancerLayout] Checking auth...");
        const userData = await backend.auth.me();
        console.log("[FreelancerLayout] Auth successful, user:", userData);
        
        // With multi-role support, check if user has FREELANCER role
        const hasFreelancerRole = userData.roles?.includes("FREELANCER") || userData.role === "FREELANCER";
        const isActiveFreelancer = userData.activeRole === "FREELANCER" || userData.role === "FREELANCER";
        
        if (!hasFreelancerRole) {
          console.log("[FreelancerLayout] User doesn't have FREELANCER role");
          // If they don't have freelancer role, redirect to become-freelancer page
          if (userData.roles?.includes("CLIENT")) {
            navigate("/become-freelancer");
          } else {
            localStorage.removeItem("authToken");
            localStorage.removeItem("user");
            navigate("/auth/login");
          }
          return;
        }

        // If user is not in freelancer mode but has freelancer role
        if (!isActiveFreelancer && userData.roles?.includes("CLIENT")) {
          console.log("[FreelancerLayout] User is in CLIENT mode, redirecting to client dashboard");
          navigate("/client/discover");
          return;
        }

        // Update localStorage with full user data including roles
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      } catch (error: any) {
        console.error("[FreelancerLayout] Auth check failed:", error?.message || error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        navigate("/auth/login");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [navigate]);

  const navItems = [
    { to: "/freelancer/dashboard", label: "Dashboard", icon: "LayoutDashboard" as const },
    { to: "/freelancer/bookings", label: "Bookings", icon: "Calendar" as const },
    { to: "/freelancer/messages", label: "Messages", icon: "MessageCircle" as const },
    { to: "/freelancer/services", label: "Services", icon: "Briefcase" as const },
    { to: "/freelancer/profile", label: "Profile", icon: "User" as const },
  ];

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <TopNav role="freelancer" />
      <main className="pb-20 md:pb-8 pt-16 md:pt-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <Outlet />
        </div>
      </main>
      <BottomNav items={navItems} />
    </div>
  );
}
