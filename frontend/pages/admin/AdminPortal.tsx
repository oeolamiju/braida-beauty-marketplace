import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  ShoppingBag,
  Calendar,
  Shield,
  AlertTriangle,
  FileText,
  Settings,
  DollarSign,
  Star,
  BarChart3,
  MapPin,
  Lock,
  ShoppingCart,
} from "lucide-react";
import backend from "@/lib/backend";

interface AdminPermissions {
  users: { view: boolean; edit: boolean; suspend: boolean };
  services: { view: boolean; edit: boolean; deactivate: boolean };
  bookings: { view: boolean; edit: boolean };
  verifications: { view: boolean; approve: boolean; reject: boolean };
  disputes: { view: boolean; resolve: boolean };
  reports: { view: boolean; action: boolean };
  reviews: { view: boolean; remove: boolean };
  settings: { view: boolean; edit: boolean };
  payouts: { view: boolean; process: boolean };
  analytics: { view: boolean };
}

interface AdminModule {
  id: string;
  name: string;
  description: string;
  icon: React.ReactElement;
  path: string;
  permission: keyof AdminPermissions;
  action: string;
  color: string;
}

const ADMIN_MODULES: AdminModule[] = [
  {
    id: "users",
    name: "Users",
    description: "Manage clients and freelancers",
    icon: <Users className="h-6 w-6" />,
    path: "/admin/user-management",
    permission: "users",
    action: "view",
    color: "bg-blue-500",
  },
  {
    id: "services",
    name: "Services",
    description: "View and moderate listings",
    icon: <ShoppingBag className="h-6 w-6" />,
    path: "/admin/listings",
    permission: "services",
    action: "view",
    color: "bg-purple-500",
  },
  {
    id: "bookings",
    name: "Bookings",
    description: "Search and manage bookings",
    icon: <Calendar className="h-6 w-6" />,
    path: "/admin/bookings",
    permission: "bookings",
    action: "view",
    color: "bg-green-500",
  },
  {
    id: "verifications",
    name: "Verifications",
    description: "Review KYC submissions",
    icon: <Shield className="h-6 w-6" />,
    path: "/admin/verifications",
    permission: "verifications",
    action: "view",
    color: "bg-amber-500",
  },
  {
    id: "disputes",
    name: "Reports & Disputes",
    description: "Handle user reports and disputes",
    icon: <AlertTriangle className="h-6 w-6" />,
    path: "/admin/dispute-dashboard",
    permission: "disputes",
    action: "view",
    color: "bg-red-500",
  },
  {
    id: "reviews",
    name: "Reviews",
    description: "Moderate user reviews",
    icon: <Star className="h-6 w-6" />,
    path: "/admin/reviews",
    permission: "reviews",
    action: "view",
    color: "bg-yellow-500",
  },
  {
    id: "payouts",
    name: "Payouts",
    description: "Process freelancer payouts",
    icon: <DollarSign className="h-6 w-6" />,
    path: "/admin/payouts",
    permission: "payouts",
    action: "view",
    color: "bg-emerald-500",
  },
  {
    id: "analytics",
    name: "Analytics",
    description: "View platform metrics",
    icon: <BarChart3 className="h-6 w-6" />,
    path: "/admin/kpis",
    permission: "analytics",
    action: "view",
    color: "bg-indigo-500",
  },
  {
    id: "cities",
    name: "City Analytics",
    description: "Performance by city",
    icon: <MapPin className="h-6 w-6" />,
    path: "/admin/analytics/cities",
    permission: "analytics",
    action: "view",
    color: "bg-teal-500",
  },
  {
    id: "settings",
    name: "Settings",
    description: "Platform configuration",
    icon: <Settings className="h-6 w-6" />,
    path: "/admin/settings",
    permission: "settings",
    action: "view",
    color: "bg-gray-600",
  },
  {
    id: "content",
    name: "Content",
    description: "Manage pages, FAQs, and safety resources",
    icon: <FileText className="h-6 w-6" />,
    path: "/admin/content",
    permission: "settings",
    action: "edit",
    color: "bg-cyan-500",
  },
  {
    id: "products",
    name: "Products",
    description: "Manage beauty products",
    icon: <ShoppingCart className="h-6 w-6" />,
    path: "/admin/products",
    permission: "services",
    action: "view",
    color: "bg-pink-500",
  },
];

export default function AdminPortal() {
  const [permissions, setPermissions] = useState<AdminPermissions | null>(null);
  const [adminRole, setAdminRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      const response = await backend.admin.getMyPermissions();
      setPermissions(response.permissions);
      setAdminRole(response.role);
    } catch (error) {
      console.error("Failed to load permissions:", error);
      navigate("/auth/login");
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (module: AdminModule): boolean => {
    if (!permissions) return false;
    const modulePerms = permissions[module.permission];
    return modulePerms && (modulePerms as any)[module.action];
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Portal</h1>
        <p className="text-muted-foreground">
          Welcome back. You are logged in as{" "}
          <span className="font-medium text-orange-600">{adminRole.replace("_", " ")}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ADMIN_MODULES.map((module) => {
          const hasAccess = hasPermission(module);

          return (
            <Card
              key={module.id}
              className={`relative overflow-hidden transition-all ${
                hasAccess
                  ? "hover:shadow-lg cursor-pointer"
                  : "opacity-50 cursor-not-allowed"
              }`}
              onClick={() => hasAccess && navigate(module.path)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 rounded-lg ${module.color} text-white`}
                  >
                    {module.icon}
                  </div>
                  {!hasAccess && (
                    <Lock className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <h3 className="font-semibold text-lg mb-1">{module.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {module.description}
                </p>
              </div>
              {hasAccess && (
                <div className={`absolute bottom-0 left-0 right-0 h-1 ${module.color}`} />
              )}
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {permissions?.verifications?.view && (
            <Button
              variant="outline"
              onClick={() => navigate("/admin/verifications")}
            >
              <Shield className="h-4 w-4 mr-2" />
              Pending Verifications
            </Button>
          )}
          {permissions?.disputes?.view && (
            <Button
              variant="outline"
              onClick={() => navigate("/admin/dispute-dashboard")}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Open Disputes
            </Button>
          )}
          {permissions?.payouts?.view && (
            <Button
              variant="outline"
              onClick={() => navigate("/admin/payouts")}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Pending Payouts
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

