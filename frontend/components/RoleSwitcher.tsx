import { useState } from "react";
import { User, Briefcase, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import backend from "~backend/client";
import { useToast } from "@/components/ui/use-toast";

interface RoleSwitcherProps {
  currentRole: string;
  availableRoles: string[];
  onRoleChange?: (newRole: string) => void;
}

const roleConfig = {
  CLIENT: {
    label: "Client",
    icon: User,
    color: "bg-blue-500",
  },
  FREELANCER: {
    label: "Freelancer",
    icon: Briefcase,
    color: "bg-purple-500",
  },
  ADMIN: {
    label: "Admin",
    icon: Users,
    color: "bg-red-500",
  },
};

export function RoleSwitcher({ currentRole, availableRoles, onRoleChange }: RoleSwitcherProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const current = roleConfig[currentRole as keyof typeof roleConfig] || roleConfig.CLIENT;
  const CurrentIcon = current.icon;

  if (availableRoles.length <= 1) {
    return (
      <Badge variant="outline" className="gap-2 px-3 py-1.5">
        <CurrentIcon className="h-4 w-4" />
        {current.label}
      </Badge>
    );
  }

  const handleSwitch = async (targetRole: string) => {
    if (targetRole === currentRole) return;

    setIsLoading(true);
    try {
      const response = await backend.auth.switchRole({
        targetRole: targetRole as "CLIENT" | "FREELANCER",
      });

      localStorage.setItem("authToken", response.token);
      
      toast({
        title: "Role switched",
        description: `You are now using Braida as a ${roleConfig[targetRole as keyof typeof roleConfig]?.label}`,
      });

      if (onRoleChange) {
        onRoleChange(targetRole);
      } else {
        window.location.reload();
      }
    } catch (error: any) {
      console.error("Role switch failed:", error);
      toast({
        title: "Failed to switch role",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 px-3"
          disabled={isLoading}
        >
          <CurrentIcon className="h-4 w-4" />
          {current.label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Switch Mode</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableRoles.map((role) => {
          const config = roleConfig[role as keyof typeof roleConfig];
          if (!config) return null;

          const Icon = config.icon;
          const isCurrent = role === currentRole;

          return (
            <DropdownMenuItem
              key={role}
              onClick={() => handleSwitch(role)}
              disabled={isCurrent || isLoading}
              className="gap-2 cursor-pointer"
            >
              <div className={`h-2 w-2 rounded-full ${config.color}`} />
              <Icon className="h-4 w-4" />
              <span className="flex-1">{config.label}</span>
              {isCurrent && (
                <Badge variant="secondary" className="text-xs">
                  Active
                </Badge>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
