import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import backend from "@/lib/backend";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Users as UsersIcon, Ban, CheckCircle, Search, Upload, Scissors, UserCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { UserListItem } from "~backend/admin/types";

export default function UserManagement() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const pageSize = 25;

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await backend.admin.listUsers({
        search: search || undefined,
        role: roleFilter || undefined,
        suspended: statusFilter === "blocked" ? true : statusFilter === "active" ? false : undefined,
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
  }, [page, roleFilter, statusFilter, search]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
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

  const totalUsers = total;
  const pendingVerification = users.filter(u => u.role === 'FREELANCER').length;
  const activeFreelancers = users.filter(u => u.role === 'FREELANCER' && !u.suspended).length;
  const blockedReported = users.filter(u => u.suspended).length;

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">User Management</h1>
              <p className="text-muted-foreground mt-1">
                Admin &gt; Users
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name, email or ID..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 w-80"
                />
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-sm">🔔</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full"></div>
                <div>
                  <div className="text-sm font-medium">Admin User</div>
                  <div className="text-xs text-muted-foreground">Super Admin</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <UsersIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Total Users</div>
                <div className="text-3xl font-bold">{totalUsers.toLocaleString()}</div>
                <div className="text-xs text-green-600 font-medium mt-1">+5% from last month</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Upload className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Pending Verification</div>
                <div className="text-3xl font-bold">{pendingVerification}</div>
                <div className="text-xs text-orange-600 font-medium mt-1">! Action needed</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Scissors className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Active Freelancers</div>
                <div className="text-3xl font-bold">{activeFreelancers.toLocaleString()}</div>
                <div className="text-xs text-green-600 font-medium mt-1">+12% growth</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Ban className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground">Blocked/Reported</div>
                <div className="text-3xl font-bold">{blockedReported}</div>
                <div className="text-xs text-muted-foreground mt-1">Stable this week</div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="bg-white">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-4 py-2 border rounded-lg bg-background font-medium"
                >
                  <option value="">All Roles</option>
                  <option value="CLIENT">Client</option>
                  <option value="FREELANCER">Freelancer</option>
                  <option value="ADMIN">Admin</option>
                </select>

                <Button
                  size="sm"
                  variant={statusFilter === "" ? "default" : "outline"}
                  onClick={() => {
                    setStatusFilter("");
                    setPage(1);
                  }}
                  className={statusFilter === "" ? "bg-orange-600 text-white hover:bg-orange-600/90" : ""}
                >
                  All Users
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === "pending" ? "default" : "outline"}
                  onClick={() => {
                    setStatusFilter("pending");
                    setPage(1);
                  }}
                  className={statusFilter === "pending" ? "bg-orange-600 text-white hover:bg-orange-600/90" : ""}
                >
                  Pending Verification
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === "active" ? "default" : "outline"}
                  onClick={() => {
                    setStatusFilter("active");
                    setPage(1);
                  }}
                  className={statusFilter === "active" ? "bg-orange-600 text-white hover:bg-orange-600/90" : ""}
                >
                  Active
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === "blocked" ? "default" : "outline"}
                  onClick={() => {
                    setStatusFilter("blocked");
                    setPage(1);
                  }}
                  className={statusFilter === "blocked" ? "bg-orange-600 text-white hover:bg-orange-600/90" : ""}
                >
                  Blocked
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">USER</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">ROLE</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">STATUS</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">LOCATION</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">JOINED</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-300 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.fullName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{user.fullName || 'No name'}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="secondary"
                        className={`${
                          user.role === 'FREELANCER' ? 'bg-orange-100 text-orange-700' :
                          user.role === 'CLIENT' ? 'bg-blue-100 text-blue-700' :
                          'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {user.role === 'FREELANCER' && <Scissors className="w-3 h-3 mr-1" />}
                        {user.role === 'CLIENT' && <UserCircle2 className="w-3 h-3 mr-1" />}
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {user.suspended ? (
                        <Badge variant="destructive" className="bg-red-100 text-red-700">
                          <Ban className="w-3 h-3 mr-1" />
                          Blocked
                        </Badge>
                      ) : user.role === 'FREELANCER' ? (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                          Pending
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">N/A</td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(user.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {user.suspended ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUnsuspend(user.id)}
                          >
                            Unsuspend
                          </Button>
                        ) : user.role === 'FREELANCER' ? (
                          <Button
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            Verify
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowSuspendDialog(true);
                            }}
                          >
                            Suspend
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                        >
                          ⋮
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total.toLocaleString()} results
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ‹
              </Button>
              {[...Array(Math.min(5, Math.ceil(total / pageSize)))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className={page === pageNum ? "bg-orange-600 text-white hover:bg-orange-600/90" : ""}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              {Math.ceil(total / pageSize) > 5 && (
                <>
                  <Button variant="outline" size="sm" disabled>
                    ...
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.ceil(total / pageSize))}
                  >
                    {Math.ceil(total / pageSize)}
                  </Button>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(Math.ceil(total / pageSize), p + 1))}
                disabled={page >= Math.ceil(total / pageSize)}
              >
                ›
              </Button>
            </div>
          </div>
        </Card>
      </div>

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
