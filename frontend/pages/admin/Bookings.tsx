import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import backend from "@/lib/backend";
import { DataTable } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { BookingListItem } from "~backend/admin/types";

export default function Bookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const pageSize = 25;

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await backend.admin.listBookings({
        search: search || undefined,
        status: statusFilter || undefined,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });
      setBookings(response.bookings);
      setTotal(response.total);
    } catch (error: any) {
      console.error("Failed to load bookings:", error);
      const errorMessage = error?.message || "Failed to load bookings";
      toast({
        title: "Error loading bookings",
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

  useEffect(() => {
    loadBookings();
  }, [page, statusFilter]);

  const handleSearch = () => {
    setPage(1);
    loadBookings();
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setPage(1);
    loadBookings();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      PENDING: { variant: "secondary" },
      CONFIRMED: { variant: "default", className: "bg-blue-600" },
      COMPLETED: { variant: "outline", className: "border-green-600 text-green-600" },
      CANCELLED: { variant: "destructive" },
    };
    return variants[status] || { variant: "secondary" };
  };

  const columns = [
    {
      key: "id",
      header: "Booking ID",
      render: (booking: BookingListItem) => (
        <span className="font-mono text-xs">{booking.id.slice(0, 8)}</span>
      ),
    },
    {
      key: "service",
      header: "Service",
      render: (booking: BookingListItem) => (
        <div>
          <div className="font-medium">{booking.serviceTitle}</div>
          <div className="text-xs text-muted-foreground">by {booking.freelancerName}</div>
        </div>
      ),
    },
    {
      key: "client",
      header: "Client",
      render: (booking: BookingListItem) => booking.clientName,
    },
    {
      key: "status",
      header: "Status",
      render: (booking: BookingListItem) => (
        <Badge {...getStatusBadge(booking.status)}>
          {booking.status}
        </Badge>
      ),
    },
    {
      key: "payment",
      header: "Payment",
      render: (booking: BookingListItem) => (
        <div>
          <div className="font-medium">£{booking.totalPrice.toFixed(2)}</div>
          {booking.paymentStatus && (
            <div className="text-xs text-muted-foreground">{booking.paymentStatus}</div>
          )}
        </div>
      ),
    },
    {
      key: "scheduledFor",
      header: "Scheduled",
      render: (booking: BookingListItem) => new Date(booking.scheduledFor).toLocaleString(),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="w-8 h-8" />
            Bookings
          </h1>
          <p className="text-muted-foreground mt-1">View and manage all bookings</p>
        </div>
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearch}
        onClearFilters={handleClearFilters}
        showClear={!!(search || statusFilter)}
      >
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </FilterBar>

      <DataTable
        columns={columns}
        data={bookings}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onRowClick={(booking) => navigate(`/admin/bookings/${booking.id}`)}
        loading={loading}
      />
    </div>
  );
}
