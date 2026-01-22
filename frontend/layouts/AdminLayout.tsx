import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import BottomNav from "@/components/navigation/BottomNav";
import TopNav from "@/components/navigation/TopNav";
import backend from "@/lib/backend";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const userData = await backend.auth.me();
        
        if (userData.role !== "ADMIN") {
          navigate("/auth/login");
          return;
        }

        setUser(userData);
      } catch (error) {
        navigate("/auth/login");
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [navigate]);

  const navItems = [
    { to: "/admin/portal", label: "Portal", icon: "LayoutDashboard" as const },
    { to: "/admin/users", label: "Users", icon: "Users" as const },
    { to: "/admin/bookings", label: "Bookings", icon: "Calendar" as const },
    { to: "/admin/settings", label: "Settings", icon: "Settings" as const },
  ];

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <TopNav role="admin" />
      <main className="pb-20 md:pb-8 pt-16">
        <div className="max-w-7xl mx-auto px-4">
          <Outlet />
        </div>
      </main>
      <BottomNav items={navItems} />
    </div>
  );
}
