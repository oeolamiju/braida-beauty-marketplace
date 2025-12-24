import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import BottomNav from "@/components/navigation/BottomNav";
import TopNav from "@/components/navigation/TopNav";
import backend from "@/lib/backend";

export default function ClientLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        console.log("[ClientLayout] Checking auth, token exists:", !!localStorage.getItem("authToken"));
        const userData = await backend.auth.me();
        console.log("[ClientLayout] Auth successful, user:", userData);
        
        // With multi-role support, check if user has CLIENT role in their roles array
        // or if their active role is CLIENT
        const hasClientRole = userData.roles?.includes("CLIENT") || userData.role === "CLIENT";
        const isActiveClient = userData.activeRole === "CLIENT" || userData.role === "CLIENT";
        
        if (!hasClientRole) {
          console.log("[ClientLayout] User doesn't have CLIENT role:", userData.roles);
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          navigate("/auth/login");
          return;
        }

        // If user is not in client mode but has client role, they can still access
        // (they might be a freelancer who also has client role)
        if (!isActiveClient && userData.roles?.includes("FREELANCER")) {
          console.log("[ClientLayout] User is in FREELANCER mode, redirecting to freelancer dashboard");
          navigate("/freelancer/dashboard");
          return;
        }

        // Update localStorage with full user data including roles
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      } catch (error: any) {
        console.error("[ClientLayout] Auth check failed:", error?.message || error);
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
    { to: "/client/discover", label: "Discover", icon: "Search" as const },
    { to: "/client/bookings", label: "Bookings", icon: "Calendar" as const },
    { to: "/client/messages", label: "Messages", icon: "MessageCircle" as const },
    { to: "/client/favorites", label: "Saved", icon: "Heart" as const },
    { to: "/client/profile", label: "Profile", icon: "User" as const },
  ];

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <TopNav role="client" />
      <main className="pb-20 md:pb-8 pt-16 md:pt-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <Outlet />
        </div>
      </main>
      <BottomNav items={navItems} />
    </div>
  );
}
