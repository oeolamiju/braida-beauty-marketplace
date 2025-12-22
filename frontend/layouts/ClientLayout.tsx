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
        
        if (userData.role !== "CLIENT") {
          console.log("[ClientLayout] Wrong role:", userData.role, "expected CLIENT");
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          navigate("/auth/login");
          return;
        }

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
