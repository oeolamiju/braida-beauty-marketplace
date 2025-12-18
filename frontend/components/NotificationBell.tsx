import { Bell, Check } from "lucide-react";
import { useNotifications } from "../contexts/NotificationContext";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.data?.bookingId) {
      navigate("/bookings");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 size-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => markAllAsRead()}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex cursor-pointer flex-col items-start gap-1 p-3"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                          {notification.title}
                        </span>
                        {!notification.read && (
                          <div className="size-2 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                      >
                        <Check className="size-3" />
                      </Button>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(notification.created_at)}
                  </span>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
