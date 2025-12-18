import { NavLink } from "react-router-dom";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: keyof typeof Icons;
}

interface BottomNavProps {
  items: NavItem[];
}

export default function BottomNav({ items }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="flex justify-around">
        {items.map((item) => {
          const Icon = Icons[item.icon] as Icons.LucideIcon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center py-3 px-4 min-w-0 flex-1",
                  "text-muted-foreground hover:text-foreground transition-colors",
                  isActive && "text-primary"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-xs font-medium truncate w-full text-center">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
