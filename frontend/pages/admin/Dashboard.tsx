import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import backend from "@/lib/backend";
import { StatCard } from "@/components/admin/StatCard";
import { Card } from "@/components/ui/card";
import { Users, List, Calendar, AlertTriangle, Settings, CheckCircle, Flag } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeListings: 0,
    pendingBookings: 0,
    pendingVerifications: 0,
    openReports: 0,
    openDisputes: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [users, services, bookings, verifications, reports, disputes] = await Promise.all([
        backend.admin.listUsers({ limit: 1, offset: 0 }),
        backend.admin.listServices({ active: true, limit: 1, offset: 0 }),
        backend.admin.listBookings({ status: "PENDING", limit: 1, offset: 0 }),
        backend.verification.adminList(),
        backend.reports.adminList({ status: "new" as any, limit: 1, offset: 0 }),
        backend.disputes.adminList({ status: "new", limit: 1, offset: 0 }),
      ]);

      setStats({
        totalUsers: users.total,
        activeListings: services.total,
        pendingBookings: bookings.total,
        pendingVerifications: verifications.submissions.length,
        openReports: reports.total || 0,
        openDisputes: disputes.total,
      });
    } catch (error: any) {
      console.error("Failed to load statistics:", error);
      const errorMessage = error?.message || "Failed to load statistics";
      toast({
        title: "Error loading statistics",
        description: errorMessage,
        variant: "destructive",
      });
      
      if (error?.message?.includes("unauthenticated") || error?.message?.includes("credentials")) {
        navigate("/auth/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Users",
      description: "Manage user accounts",
      icon: Users,
      path: "/admin/users",
      color: "bg-blue-500",
    },
    {
      title: "Listings",
      description: "Moderate service listings",
      icon: List,
      path: "/admin/listings",
      color: "bg-green-500",
    },
    {
      title: "Bookings",
      description: "View all bookings",
      icon: Calendar,
      path: "/admin/bookings",
      color: "bg-purple-500",
    },
    {
      title: "Verifications",
      description: "Review KYC submissions",
      icon: CheckCircle,
      path: "/admin/verifications",
      color: "bg-yellow-500",
    },
    {
      title: "Reports",
      description: "Handle user reports",
      icon: Flag,
      path: "/admin/reports",
      color: "bg-orange-500",
    },
    {
      title: "Disputes",
      description: "Resolve disputes",
      icon: AlertTriangle,
      path: "/admin/disputes",
      color: "bg-red-500",
    },
    {
      title: "Settings",
      description: "Platform configuration",
      icon: Settings,
      path: "/admin/settings",
      color: "bg-gray-500",
    },
  ];

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of platform activity</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} />
        <StatCard title="Active Listings" value={stats.activeListings} icon={List} />
        <StatCard title="Pending Bookings" value={stats.pendingBookings} icon={Calendar} />
        <StatCard
          title="Pending Verifications"
          value={stats.pendingVerifications}
          icon={CheckCircle}
        />
        <StatCard title="Open Reports" value={stats.openReports} icon={Flag} />
        <StatCard title="Open Disputes" value={stats.openDisputes} icon={AlertTriangle} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card
                key={action.path}
                className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(action.path)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{action.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
