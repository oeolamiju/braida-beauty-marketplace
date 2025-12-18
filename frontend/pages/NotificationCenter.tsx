import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Calendar,
  CreditCard,
  MessageSquare,
  Star,
  AlertTriangle,
  Settings,
  ChevronRight,
  Clock,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import backend from "@/lib/backend";
import TopNav from "@/components/navigation/TopNav";

interface Notification {
  id: number;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  created_at: string;
  link?: string;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
  }, [tab, page]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const response = await backend.notifications.listPaginated({
        page,
        limit: 20,
        unreadOnly: tab === "unread",
      });
      setNotifications(page === 1 ? response.notifications : [...notifications, ...response.notifications]);
      setUnreadCount(response.unreadCount);
      setHasMore(response.hasMore);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await backend.notifications.markRead({ id });
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await backend.notifications.markAllRead();
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast({ title: "All notifications marked as read" });
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleClearRead = async () => {
    try {
      const result = await backend.notifications.clearRead();
      setNotifications(notifications.filter((n) => !n.read));
      toast({ title: `Cleared ${result.deletedCount} notifications` });
    } catch (error) {
      console.error("Failed to clear read:", error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await handleMarkRead(notification.id);
    }
    
    // Navigate based on notification type
    const link = getNotificationLink(notification);
    if (link) {
      navigate(link);
    }
  };

  const getNotificationLink = (notification: Notification): string | undefined => {
    const data = notification.data;
    if (!data) return undefined;

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const rolePrefix = user.role?.toLowerCase() || "client";

    if (data.bookingId) {
      return `/${rolePrefix}/bookings/${data.bookingId}`;
    }
    if (data.disputeId) {
      return `/${rolePrefix === "admin" ? "admin" : rolePrefix}/disputes/${data.disputeId}`;
    }
    return undefined;
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, JSX.Element> = {
      new_booking_request: <Calendar className="h-5 w-5 text-blue-500" />,
      booking_confirmed: <Check className="h-5 w-5 text-green-500" />,
      booking_cancelled: <AlertTriangle className="h-5 w-5 text-red-500" />,
      booking_declined: <AlertTriangle className="h-5 w-5 text-red-500" />,
      booking_reminder: <Clock className="h-5 w-5 text-orange-500" />,
      booking_paid: <CreditCard className="h-5 w-5 text-green-500" />,
      payment_confirmed: <CreditCard className="h-5 w-5 text-green-500" />,
      payment_failed: <CreditCard className="h-5 w-5 text-red-500" />,
      payment_released: <CreditCard className="h-5 w-5 text-green-500" />,
      booking_refunded: <CreditCard className="h-5 w-5 text-yellow-500" />,
      message_received: <MessageSquare className="h-5 w-5 text-blue-500" />,
      review_reminder: <Star className="h-5 w-5 text-yellow-500" />,
      dispute_raised: <AlertTriangle className="h-5 w-5 text-red-500" />,
      dispute_resolved: <CheckCheck className="h-5 w-5 text-green-500" />,
    };
    return icons[type] || <Bell className="h-5 w-5 text-gray-500" />;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <div className="container mx-auto px-4 py-8 pt-24 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-muted-foreground">
                You have <span className="font-medium text-orange-600">{unreadCount}</span> unread notifications
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/notifications/settings")}
          >
            <Settings className="h-4 w-4 mr-2" />
            Preferences
          </Button>
        </div>

        <Tabs value={tab} onValueChange={(t) => { setTab(t); setPage(1); }}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread
                {unreadCount > 0 && (
                  <Badge className="ml-2 bg-orange-500">{unreadCount}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleClearRead}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Read
              </Button>
            </div>
          </div>

          <TabsContent value="all" className="mt-0">
            <NotificationList
              notifications={notifications}
              loading={loading}
              onNotificationClick={handleNotificationClick}
              getIcon={getNotificationIcon}
              formatTime={formatTime}
            />
          </TabsContent>

          <TabsContent value="unread" className="mt-0">
            <NotificationList
              notifications={notifications.filter(n => !n.read)}
              loading={loading}
              onNotificationClick={handleNotificationClick}
              getIcon={getNotificationIcon}
              formatTime={formatTime}
            />
          </TabsContent>
        </Tabs>

        {hasMore && (
          <div className="text-center mt-6">
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={loading}
            >
              {loading ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationList({
  notifications,
  loading,
  onNotificationClick,
  getIcon,
  formatTime,
}: {
  notifications: Notification[];
  loading: boolean;
  onNotificationClick: (n: Notification) => void;
  getIcon: (type: string) => JSX.Element;
  formatTime: (date: string) => string;
}) {
  if (loading && notifications.length === 0) {
    return (
      <Card className="divide-y">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 animate-pulse">
            <div className="flex gap-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </Card>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Bell className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <h3 className="font-semibold text-lg mb-2">No notifications</h3>
        <p className="text-muted-foreground">
          You're all caught up! New notifications will appear here.
        </p>
      </Card>
    );
  }

  return (
    <Card className="divide-y overflow-hidden">
      {notifications.map((notification) => (
        <button
          key={notification.id}
          onClick={() => onNotificationClick(notification)}
          className={`w-full p-4 flex items-start gap-4 text-left hover:bg-gray-50 transition-colors ${
            !notification.read ? "bg-orange-50/50" : ""
          }`}
        >
          <div className={`p-2 rounded-full ${!notification.read ? "bg-orange-100" : "bg-gray-100"}`}>
            {getIcon(notification.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className={`font-medium ${!notification.read ? "text-gray-900" : "text-gray-600"}`}>
                  {notification.title}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {notification.message}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground">
                  {formatTime(notification.created_at)}
                </span>
                {!notification.read && (
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                )}
              </div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-300 shrink-0" />
        </button>
      ))}
    </Card>
  );
}

