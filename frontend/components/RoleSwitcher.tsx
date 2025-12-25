import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftRight, Briefcase, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import backend from "@/lib/backend";

interface RoleSwitcherProps {
  currentRole: string;
  roles: string[];
  onRoleSwitch?: (newRole: string) => void;
}

export default function RoleSwitcher({ currentRole, roles, onRoleSwitch }: RoleSwitcherProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [canBecomeFreelancer, setCanBecomeFreelancer] = useState(false);

  useEffect(() => {
    // Check if user can become freelancer (doesn't have freelancer role yet)
    setCanBecomeFreelancer(!roles.includes("FREELANCER"));
  }, [roles]);

  const handleSwitchRole = async (targetRole: string) => {
    if (targetRole === currentRole) return;
    
    setLoading(true);
    try {
      const response = await backend.auth.switchRole({ targetRole: targetRole as "CLIENT" | "FREELANCER" });
      
      // Update stored auth data
      localStorage.setItem("authToken", response.token);
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        user.activeRole = response.activeRole;
        user.role = response.activeRole;
        localStorage.setItem("user", JSON.stringify(user));
      }

      toast({
        title: "Role Switched",
        description: `Switched to ${response.activeRole} role`,
      });

      // Notify parent component
      if (onRoleSwitch) {
        onRoleSwitch(response.activeRole);
      }

      // Navigate to appropriate dashboard
      if (targetRole === "FREELANCER") {
        navigate("/freelancer/dashboard");
      } else if (targetRole === "CLIENT") {
        navigate("/client/discover");
      }
    } catch (error: any) {
      console.error("Failed to switch role:", error);
      const errorMessage = error.message || "Something went wrong";
      
      if (errorMessage.includes("not verified") || errorMessage.includes("profile not found")) {
        toast({
          variant: "destructive",
          title: "Verification Required",
          description: "Your freelancer profile must be verified by an admin before you can switch to freelancer mode.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Failed to switch role",
          description: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBecomeFreelancer = () => {
    navigate("/become-freelancer");
  };

  const getRoleIcon = (role: string) => {
    switch (role.toUpperCase()) {
      case "FREELANCER":
        return <Briefcase className="h-4 w-4" />;
      case "CLIENT":
        return <User className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role.toUpperCase()) {
      case "FREELANCER":
        return "Freelancer Mode";
      case "CLIENT":
        return "Client Mode";
      case "ADMIN":
        return "Admin";
      default:
        return role;
    }
  };

  // If user only has CLIENT role and can become freelancer, show upgrade option
  if (roles.length === 1 && roles[0] === "CLIENT" && canBecomeFreelancer) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleBecomeFreelancer}
        className="flex items-center gap-2 border-pink-200 hover:bg-pink-50 hover:border-pink-300 text-pink-600"
      >
        <Sparkles className="h-4 w-4" />
        <span className="hidden sm:inline">Become a Freelancer</span>
        <span className="sm:hidden">Freelancer</span>
      </Button>
    );
  }

  // Show role switcher if user has multiple roles
  if (roles.length <= 1) return null;

  const availableRoles = roles.filter(r => r !== "ADMIN"); // Don't show admin in switcher

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2 border-pink-200 hover:bg-pink-50"
          disabled={loading}
        >
          <ArrowLeftRight className="h-4 w-4" />
          <span className="hidden sm:inline">{getRoleLabel(currentRole)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Switch Mode</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableRoles.map((role) => (
          <DropdownMenuItem
            key={role}
            onClick={() => handleSwitchRole(role)}
            className={`flex items-center gap-2 cursor-pointer ${
              role === currentRole ? "bg-pink-50 text-pink-600" : ""
            }`}
          >
            {getRoleIcon(role)}
            <span>{getRoleLabel(role)}</span>
            {role === currentRole && (
              <span className="ml-auto text-xs text-pink-500">Active</span>
            )}
          </DropdownMenuItem>
        ))}
        {canBecomeFreelancer && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleBecomeFreelancer}
              className="flex items-center gap-2 cursor-pointer text-pink-600"
            >
              <Sparkles className="h-4 w-4" />
              <span>Become a Freelancer</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
