import { useState, useEffect } from "react";
import backend from "@/lib/backend";
import { DataTable } from "@/components/admin/DataTable";
import { FilterBar } from "@/components/admin/FilterBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Users as UsersIcon, Ban, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { UserListItem } from "~backend/admin/types";

export default function Users() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [suspendedFilter, setSuspendedFilter] = useState<boolean | undefined>();
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState("");
  const { toast } = useToast();

  const pageSize = 25;

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await backend.admin.listUsers({
        search: search || undefined,
        role: roleFilter || undefined,
        suspended: suspendedFilter,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });
      setUsers(response.users);
      setTotal(response.total);
    } catch (error: any) {
      toast({
        title: "Error loading users",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, roleFilter, suspendedFilter]);

  const handleSearch = () => {
    setPage(1);
    loadUsers();
  };

  const handleClearFilters = () => {
    setSearch("");
    setRoleFilter("");
    setSuspendedFilter(undefined);
    setPage(1);
    loadUsers();
  };

  const handleSuspend = async () => {
    if (!selectedUser || !suspensionReason.trim()) return;

    try {
      await backend.admin.suspendUser({
        userId: selectedUser.id,
        reason: suspensionReason,
      });
      toast({ title: "User suspended successfully" });
      setShowSuspendDialog(false);
      setSuspensionReason("");
      setSelectedUser(null);
      loadUsers();
    } catch (error: any) {
      toast({
        title: "Error suspending user",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUnsuspend = async (userId: string) => {
    try {
      await backend.admin.unsuspendUser({ userId });
      toast({ title: "User unsuspended successfully" });
      loadUsers();
    } catch (error: any) {
      toast({
        title: "Error unsuspending user",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      key: "email",
      header: "Email",
      render: (user: UserListItem) => (
        <div>
          <div className="font-medium">{user.email}</div>
          <div className="text-xs text-muted-foreground">{user.fullName}</div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (user: UserListItem) => (
        <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
          {user.role}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (user: UserListItem) =>
        user.suspended ? (
          <Badge variant="destructive">Suspended</Badge>
        ) : (
          <Badge variant="outline" className="border-green-600 text-green-600">Active</Badge>
        ),
    },
    {
      key: "stats",
      header: "Activity",
      render: (user: UserListItem) => (
        <div className="text-xs space-y-1">
          <div>Bookings: {user.totalBookingsAsClient + user.totalBookingsAsFreelancer}</div>
          <div className="text-red-600">Reports: {user.totalReports} | Disputes: {user.totalDisputes}</div>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (user: UserListItem) => new Date(user.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (user: UserListItem) => (
        <div className="flex gap-2">
          {user.suspended ? (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleUnsuspend(user.id);
              }}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Unsuspend
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedUser(user);
                setShowSuspendDialog(true);
              }}
            >
              <Ban className="w-4 h-4 mr-1" />
              Suspend
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
            <UsersIcon className="w-8 h-8" />
            Users
          </h1>
          <p className="text-muted-foreground mt-1">Manage user accounts and permissions</p>
        </div>
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearch}
        onClearFilters={handleClearFilters}
        showClear={!!(search || roleFilter || suspendedFilter !== undefined)}
      >
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="">All Roles</option>
          <option value="CLIENT">Client</option>
          <option value="FREELANCER">Freelancer</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select
          value={suspendedFilter === undefined ? "" : suspendedFilter ? "true" : "false"}
          onChange={(e) => setSuspendedFilter(e.target.value === "" ? undefined : e.target.value === "true")}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="">All Status</option>
          <option value="false">Active</option>
          <option value="true">Suspended</option>
        </select>
      </FilterBar>

      <DataTable
        columns={columns}
        data={users}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        loading={loading}
      />

      <Dialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p>
              Are you sure you want to suspend <strong>{selectedUser?.email}</strong>?
            </p>
            <Textarea
              placeholder="Reason for suspension (required)"
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuspendDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspend}
              disabled={!suspensionReason.trim()}
            >
              Suspend User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
