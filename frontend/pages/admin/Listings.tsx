import { useState, useEffect } from "react";
import backend from "@/lib/backend";
import { DataTable } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { List, Ban, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { ServiceListItem } from "~backend/admin/types";

export default function Listings() {
  const [services, setServices] = useState<ServiceListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>();
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<ServiceListItem | null>(null);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [deactivationReason, setDeactivationReason] = useState("");
  const { toast } = useToast();

  const pageSize = 25;

  const loadServices = async () => {
    setLoading(true);
    try {
      const response = await backend.admin.listServices({
        search: search || undefined,
        category: categoryFilter || undefined,
        active: activeFilter,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });
      setServices(response.services);
      setTotal(response.total);
    } catch (error: any) {
      toast({
        title: "Error loading services",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [page, categoryFilter, activeFilter]);

  const handleSearch = () => {
    setPage(1);
    loadServices();
  };

  const handleClearFilters = () => {
    setSearch("");
    setCategoryFilter("");
    setActiveFilter(undefined);
    setPage(1);
    loadServices();
  };

  const handleDeactivate = async () => {
    if (!selectedService || !deactivationReason.trim()) return;

    try {
      await backend.admin.deactivateService({
        serviceId: selectedService.id,
        reason: deactivationReason,
      });
      toast({ title: "Service deactivated successfully" });
      setShowDeactivateDialog(false);
      setDeactivationReason("");
      setSelectedService(null);
      loadServices();
    } catch (error: any) {
      toast({
        title: "Error deactivating service",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReactivate = async (serviceId: string) => {
    try {
      await backend.admin.reactivateService({ serviceId });
      toast({ title: "Service reactivated successfully" });
      loadServices();
    } catch (error: any) {
      toast({
        title: "Error reactivating service",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      key: "title",
      header: "Service",
      render: (service: ServiceListItem) => (
        <div>
          <div className="font-medium">{service.title}</div>
          <div className="text-xs text-muted-foreground">{service.freelancerName}</div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (service: ServiceListItem) => (
        <Badge variant="secondary">{service.category}</Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (service: ServiceListItem) =>
        service.active ? (
          <Badge variant="outline" className="border-green-600 text-green-600">Active</Badge>
        ) : (
          <Badge variant="destructive">Inactive</Badge>
        ),
    },
    {
      key: "basePrice",
      header: "Price",
      render: (service: ServiceListItem) => `£${service.basePrice.toFixed(2)}`,
    },
    {
      key: "stats",
      header: "Stats",
      render: (service: ServiceListItem) => (
        <div className="text-xs space-y-1">
          <div>Bookings: {service.totalBookings}</div>
          {service.averageRating && (
            <div>Rating: {service.averageRating.toFixed(1)} ⭐</div>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (service: ServiceListItem) => new Date(service.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (service: ServiceListItem) => (
        <div className="flex gap-2">
          {service.active ? (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedService(service);
                setShowDeactivateDialog(true);
              }}
            >
              <Ban className="w-4 h-4 mr-1" />
              Deactivate
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleReactivate(service.id);
              }}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Reactivate
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <List className="w-8 h-8" />
            Service Listings
          </h1>
          <p className="text-muted-foreground mt-1">Manage service listings and availability</p>
        </div>
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearch}
        onClearFilters={handleClearFilters}
        showClear={!!(search || categoryFilter || activeFilter !== undefined)}
      >
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="">All Categories</option>
          <option value="HAIR">Hair</option>
          <option value="MAKEUP">Makeup</option>
          <option value="NAILS">Nails</option>
          <option value="SKINCARE">Skincare</option>
          <option value="OTHER">Other</option>
        </select>
        <select
          value={activeFilter === undefined ? "" : activeFilter ? "true" : "false"}
          onChange={(e) => setActiveFilter(e.target.value === "" ? undefined : e.target.value === "true")}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </FilterBar>

      <DataTable
        columns={columns}
        data={services}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        loading={loading}
      />

      <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Service</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p>
              Are you sure you want to deactivate <strong>{selectedService?.title}</strong>?
            </p>
            <Textarea
              placeholder="Reason for deactivation (required)"
              value={deactivationReason}
              onChange={(e) => setDeactivationReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeactivateDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={!deactivationReason.trim()}
            >
              Deactivate Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
