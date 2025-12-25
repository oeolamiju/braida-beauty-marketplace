import { useState, useEffect } from "react";
import { Plus, Edit, ToggleLeft, ToggleRight, Calendar, Percent, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import type { DiscountCoupon } from "~backend/coupons/types";

export default function Coupons() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<DiscountCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED_AMOUNT",
    discountValue: 0,
    minBookingAmount: 0,
    maxDiscountAmount: undefined as number | undefined,
    usageLimit: undefined as number | undefined,
    validFrom: "",
    validUntil: "",
    applicableTo: "ALL" as "ALL" | "NEW_USERS" | "SPECIFIC_SERVICES",
    notes: "",
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const response = await backend.coupons.list({ page: 1, limit: 100 });
      setCoupons(response.coupons);
    } catch (error: any) {
      console.error("Failed to load coupons:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load coupons",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await backend.coupons.create({
        code: formData.code,
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        minBookingAmount: formData.minBookingAmount,
        maxDiscountAmount: formData.maxDiscountAmount,
        usageLimit: formData.usageLimit,
        validFrom: formData.validFrom,
        validUntil: formData.validUntil,
        applicableTo: formData.applicableTo,
        notes: formData.notes,
      });

      toast({
        title: "Success",
        description: "Coupon created successfully",
      });

      setDialogOpen(false);
      setFormData({
        code: "",
        discountType: "PERCENTAGE",
        discountValue: 0,
        minBookingAmount: 0,
        maxDiscountAmount: undefined,
        usageLimit: undefined,
        validFrom: "",
        validUntil: "",
        applicableTo: "ALL",
        notes: "",
      });
      loadCoupons();
    } catch (error: any) {
      console.error("Failed to create coupon:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create coupon",
      });
    }
  };

  const toggleActive = async (coupon: DiscountCoupon) => {
    try {
      await backend.coupons.update({
        id: coupon.id,
        isActive: !coupon.isActive,
      });

      toast({
        title: "Success",
        description: `Coupon ${coupon.isActive ? "deactivated" : "activated"}`,
      });

      loadCoupons();
    } catch (error: any) {
      console.error("Failed to update coupon:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update coupon status",
      });
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-muted-foreground">Loading coupons...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Discount Coupons</h1>
          <p className="text-muted-foreground">Create and manage promotional discount codes</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Coupon</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Coupon Code</label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., SUMMER2025"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Discount Type</label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(value: "PERCENTAGE" | "FIXED_AMOUNT") =>
                      setFormData({ ...formData, discountType: value })
                    }
                  >
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED_AMOUNT">Fixed Amount</option>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    {formData.discountType === "PERCENTAGE" ? "Percentage (%)" : "Amount (£)"}
                  </label>
                  <Input
                    type="number"
                    value={formData.discountValue || ""}
                    onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Min Booking Amount (£)</label>
                  <Input
                    type="number"
                    value={formData.minBookingAmount || ""}
                    onChange={(e) => setFormData({ ...formData, minBookingAmount: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Max Discount Amount (£)</label>
                  <Input
                    type="number"
                    value={formData.maxDiscountAmount || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, maxDiscountAmount: e.target.value ? parseFloat(e.target.value) : undefined })
                    }
                    min="0"
                    step="0.01"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Usage Limit</label>
                <Input
                  type="number"
                  value={formData.usageLimit || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, usageLimit: e.target.value ? parseInt(e.target.value) : undefined })
                  }
                  min="1"
                  placeholder="Unlimited"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Valid From</label>
                  <Input
                    type="datetime-local"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Valid Until</label>
                  <Input
                    type="datetime-local"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Applicable To</label>
                <Select
                  value={formData.applicableTo}
                  onValueChange={(value: "ALL" | "NEW_USERS" | "SPECIFIC_SERVICES") =>
                    setFormData({ ...formData, applicableTo: value })
                  }
                >
                  <option value="ALL">All Users</option>
                  <option value="NEW_USERS">New Users Only</option>
                  <option value="SPECIFIC_SERVICES">Specific Services</option>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Internal notes about this coupon"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600">
                  Create Coupon
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {coupons.map((coupon) => (
          <Card key={coupon.id} className={!coupon.isActive ? "opacity-60" : ""}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold font-mono">{coupon.code}</h3>
                    {coupon.isActive ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                    {new Date(coupon.validUntil) < new Date() && (
                      <Badge variant="destructive">Expired</Badge>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      {coupon.discountType === "PERCENTAGE" ? (
                        <Percent className="h-4 w-4 text-orange-500" />
                      ) : (
                        <DollarSign className="h-4 w-4 text-orange-500" />
                      )}
                      <span className="font-medium">
                        {coupon.discountType === "PERCENTAGE"
                          ? `${coupon.discountValue}% off`
                          : `£${coupon.discountValue} off`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(coupon.validFrom)} - {formatDate(coupon.validUntil)}
                      </span>
                    </div>

                    {coupon.usageLimit && (
                      <div className="text-sm text-muted-foreground">
                        Usage: {coupon.usedCount} / {coupon.usageLimit}
                      </div>
                    )}

                    <div className="text-sm text-muted-foreground">
                      Min booking: £{coupon.minBookingAmount}
                    </div>
                  </div>

                  {coupon.notes && (
                    <p className="text-sm text-muted-foreground mt-3 italic">{coupon.notes}</p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleActive(coupon)}
                  className="ml-4"
                >
                  {coupon.isActive ? (
                    <ToggleRight className="h-5 w-5 text-green-500" />
                  ) : (
                    <ToggleLeft className="h-5 w-5 text-gray-400" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {coupons.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">No coupons created yet</p>
              <p className="text-sm text-muted-foreground mt-1">Click "Create Coupon" to get started</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
