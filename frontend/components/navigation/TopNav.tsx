import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, User, LogOut, Settings, X, Home, Bell, Heart, Calendar, MessageCircle, Briefcase, LayoutDashboard, Users, Search, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/NotificationBell";
import GlobalSearch from "@/components/GlobalSearch";
import RoleSwitcher from "@/components/RoleSwitcher";
import { BraidaLogoLight } from "@/components/BraidaLogo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

interface TopNavProps {
  role?: "client" | "freelancer" | "admin";
}

export default function TopNav({ role }: TopNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (role) {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
    }
  }, [role]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link to={role ? `/${role}` : "/"} className="flex items-center group">
              <BraidaLogoLight size="md" />
            </Link>
          </div>

          <div className="flex-1 flex items-center justify-center mx-2">
            <div className="hidden lg:flex items-center space-x-6">
              {!role && (
                <>
                  <Link 
                    to="/discover" 
                    className={`font-medium transition-colors ${
                      isActive('/discover') ? 'text-[#E91E63]' : 'text-gray-700 hover:text-[#E91E63]'
                    }`}
                  >
                    Find a Stylist
                  </Link>
                  <Link 
                    to="/become-freelancer" 
                    className={`font-medium transition-colors ${
                      isActive('/become-freelancer') ? 'text-[#E91E63]' : 'text-gray-700 hover:text-[#E91E63]'
                    }`}
                  >
                    Become a Pro
                  </Link>
                  <Link 
                    to="/styles/catalogue" 
                    className={`font-medium transition-colors ${
                      isActive('/styles/catalogue') || isActive('/styles') ? 'text-[#E91E63]' : 'text-gray-700 hover:text-[#E91E63]'
                    }`}
                  >
                    Styles
                  </Link>
                </>
              )}
              {role === 'client' && (
                <>
                  <Link 
                    to="/client/discover" 
                    className={`font-medium transition-colors ${
                      isActive('/client/discover') ? 'text-[#E91E63]' : 'text-gray-700 hover:text-[#E91E63]'
                    }`}
                  >
                    Home
                  </Link>
                  <Link 
                    to="/client/styles" 
                    className={`font-medium transition-colors ${
                      isActive('/client/styles') ? 'text-[#E91E63]' : 'text-gray-700 hover:text-[#E91E63]'
                    }`}
                  >
                    Styles
                  </Link>
                  <Link 
                    to="/client/bookings" 
                    className={`font-medium transition-colors ${
                      isActive('/client/bookings') ? 'text-[#E91E63]' : 'text-gray-700 hover:text-[#E91E63]'
                    }`}
                  >
                    Bookings
                  </Link>
                </>
              )}
              {role === 'freelancer' && (
                <>
                  <Link 
                    to="/freelancer/dashboard" 
                    className={`font-medium transition-colors ${
                      isActive('/freelancer/dashboard') ? 'text-[#E91E63]' : 'text-gray-700 hover:text-[#E91E63]'
                    }`}
                  >
                    Home
                  </Link>
                  <Link 
                    to="/freelancer/calendar" 
                    className={`font-medium transition-colors ${
                      isActive('/freelancer/calendar') ? 'text-[#E91E63]' : 'text-gray-700 hover:text-[#E91E63]'
                    }`}
                  >
                    Calendar
                  </Link>
                  <Link 
                    to="/freelancer/bookings" 
                    className={`font-medium transition-colors ${
                      isActive('/freelancer/bookings') ? 'text-[#E91E63]' : 'text-gray-700 hover:text-[#E91E63]'
                    }`}
                  >
                    Bookings
                  </Link>
                  <Link 
                    to="/freelancer/services" 
                    className={`font-medium transition-colors ${
                      isActive('/freelancer/services') ? 'text-[#E91E63]' : 'text-gray-700 hover:text-[#E91E63]'
                    }`}
                  >
                    Services
                  </Link>
                </>
              )}
              {role === 'admin' && (
                <>
                  <Link 
                    to="/admin/dashboard" 
                    className={`font-medium transition-colors ${
                      isActive('/admin/dashboard') ? 'text-[#E91E63]' : 'text-gray-700 hover:text-[#E91E63]'
                    }`}
                  >
                    Home
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="hidden sm:block">
              <GlobalSearch role={role} />
            </div>
            {!role && (
              <>
                <Button variant="ghost" size="sm" asChild className="hidden md:inline-flex font-medium">
                  <Link to="/auth/login">Log In</Link>
                </Button>
                <Button size="sm" asChild className="hidden md:inline-flex bg-gradient-to-r from-[#E91E63] to-[#F4B942] hover:from-[#C2185B] hover:to-[#D4A03A] font-medium px-6">
                  <Link to="/auth/register">Sign Up</Link>
                </Button>
              </>
            )}
            {role && (
              <>
                <RoleSwitcher 
                  currentRole={user?.activeRole || user?.role || role.toUpperCase()} 
                  roles={user?.roles || [role.toUpperCase()]}
                  onRoleSwitch={(newRole) => {
                    // Update local user state
                    const userStr = localStorage.getItem("user");
                    if (userStr) {
                      const updatedUser = JSON.parse(userStr);
                      updatedUser.activeRole = newRole;
                      updatedUser.role = newRole;
                      setUser(updatedUser);
                    }
                  }}
                />
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-pink-100">
                      {user?.profilePhoto ? (
                        <img src={user.profilePhoto} alt="Profile" className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user?.displayName || user?.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user?.activeRole?.toLowerCase() || user?.role?.toLowerCase()}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/")}>
                      <Home className="mr-2 h-4 w-4" />
                      <span>Home</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/${role}/profile`)}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/${role}/notifications`)}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            <div className="sm:hidden">
              <GlobalSearch role={role} />
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-white shadow-lg">
            <div className="py-2">
              {!role && (
                <>
                  <Link 
                    to="/auth/login" 
                    className="block px-4 py-3 font-medium text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/discover" 
                    className="block px-4 py-3 font-medium text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Find a Stylist
                  </Link>
                  <Link 
                    to="/become-freelancer" 
                    className="block px-4 py-3 font-medium text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Become a Pro
                  </Link>
                </>
              )}
              {role === 'client' && (
                <>
                  <Link 
                    to="/client/discover" 
                    className="flex items-center gap-3 px-4 py-3 font-medium text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Search className="h-5 w-5" />
                    Discover
                  </Link>
                  <Link 
                    to="/client/styles" 
                    className="flex items-center gap-3 px-4 py-3 font-medium text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Briefcase className="h-5 w-5" />
                    Styles
                  </Link>
                  <Link 
                    to="/client/bookings" 
                    className="flex items-center gap-3 px-4 py-3 font-medium text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Calendar className="h-5 w-5" />
                    Bookings
                  </Link>
                  <Link 
                    to="/client/messages" 
                    className="flex items-center gap-3 px-4 py-3 font-medium text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <MessageCircle className="h-5 w-5" />
                    Messages
                  </Link>
                  <Link 
                    to="/client/favorites" 
                    className="flex items-center gap-3 px-4 py-3 font-medium text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Heart className="h-5 w-5" />
                    Favorites
                  </Link>
                  <Link 
                    to="/client/loyalty" 
                    className="flex items-center gap-3 px-4 py-3 font-medium text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5" />
                    Loyalty
                  </Link>
                  <Link 
                    to="/client/referrals" 
                    className="flex items-center gap-3 px-4 py-3 font-medium text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Users className="h-5 w-5" />
                    Referrals
                  </Link>
                </>
              )}
              {role === 'freelancer' && (
                <>
                  <Link 
                    to="/freelancer/dashboard" 
                    className="flex items-center gap-3 px-4 py-3 font-medium text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Dashboard
                  </Link>
                  <Link 
                    to="/freelancer/calendar" 
                    className="flex items-center gap-3 px-4 py-3 font-medium text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Calendar className="h-5 w-5" />
                    Calendar
                  </Link>
                  <Link 
                    to="/freelancer/bookings" 
                    className="flex items-center gap-3 px-4 py-3 font-medium text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Calendar className="h-5 w-5" />
                    Bookings
                  </Link>
                  <Link 
                    to="/freelancer/services" 
                    className="flex items-center gap-3 px-4 py-3 font-medium text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Briefcase className="h-5 w-5" />
                    Services
                  </Link>
                  <Link 
                    to="/freelancer/messages" 
                    className="flex items-center gap-3 px-4 py-3 font-medium text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <MessageCircle className="h-5 w-5" />
                    Messages
                  </Link>
                  <Link 
                    to="/freelancer/availability" 
                    className="flex items-center gap-3 px-4 py-3 font-medium text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Calendar className="h-5 w-5" />
                    Availability
                  </Link>
                  <Link 
                    to="/freelancer/earnings" 
                    className="flex items-center gap-3 px-4 py-3 font-medium text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5" />
                    Earnings
                  </Link>
                  <Link 
                    to="/freelancer/packages" 
                    className="flex items-center gap-3 px-4 py-3 font-medium text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Briefcase className="h-5 w-5" />
                    Packages
                  </Link>
                  <Link 
                    to="/freelancer/verification" 
                    className="flex items-center gap-3 px-4 py-3 font-medium text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5" />
                    Verification
                  </Link>
                </>
              )}
              {role === 'admin' && (
                <>
                  <Link 
                    to="/admin/dashboard" 
                    className="flex items-center gap-3 px-4 py-3 font-medium text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Dashboard
                  </Link>
                  <Link 
                    to="/admin/users" 
                    className="flex items-center gap-3 px-4 py-3 font-medium text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Users className="h-5 w-5" />
                    Users
                  </Link>
                  <Link 
                    to="/admin/bookings" 
                    className="flex items-center gap-3 px-4 py-3 font-medium text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Calendar className="h-5 w-5" />
                    Bookings
                  </Link>
                  <Link 
                    to="/admin/listings" 
                    className="flex items-center gap-3 px-4 py-3 font-medium text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Briefcase className="h-5 w-5" />
                    Listings
                  </Link>
                  <Link 
                    to="/admin/verifications" 
                    className="flex items-center gap-3 px-4 py-3 font-medium text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5" />
                    Verifications
                  </Link>
                  <Link 
                    to="/admin/disputes" 
                    className="flex items-center gap-3 px-4 py-3 font-medium text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5" />
                    Disputes
                  </Link>
                  <Link 
                    to="/admin/reports" 
                    className="flex items-center gap-3 px-4 py-3 font-medium text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5" />
                    Reports
                  </Link>
                  <Link 
                    to="/admin/payouts" 
                    className="flex items-center gap-3 px-4 py-3 font-medium text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5" />
                    Payouts
                  </Link>
                  <Link 
                    to="/admin/reviews" 
                    className="flex items-center gap-3 px-4 py-3 font-medium text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5" />
                    Reviews
                  </Link>
                  <Link 
                    to="/admin/styles" 
                    className="flex items-center gap-3 px-4 py-3 font-medium text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Briefcase className="h-5 w-5" />
                    Styles
                  </Link>
                  <Link 
                    to="/admin/kpi" 
                    className="flex items-center gap-3 px-4 py-3 font-medium text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    KPI Dashboard
                  </Link>
                  <Link 
                    to="/admin/city-analytics" 
                    className="flex items-center gap-3 px-4 py-3 font-medium text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    City Analytics
                  </Link>
                  <Link 
                    to="/admin/coupons" 
                    className="flex items-center gap-3 px-4 py-3 font-medium text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Ticket className="h-5 w-5" />
                    Coupons
                  </Link>
                  <Link 
                    to="/admin/settings" 
                    className="flex items-center gap-3 px-4 py-3 font-medium text-gray-700 hover:bg-pink-50 hover:text-[#E91E63] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5" />
                    Settings
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
