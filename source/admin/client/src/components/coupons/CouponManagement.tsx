import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Plus, Edit, Trash2, Copy } from 'lucide-react';
import { DeleteConfirmationDialog } from '../ui/delete-confirmation-dialog';
import { toast } from 'sonner@2.0.3';

const mockCoupons = [
  { id: 1, code: 'SAVE20', type: 'Percentage', value: '20%', minOrder: '$50', uses: 145, maxUses: 500, expiry: '2025-12-31', status: 'Active' },
  { id: 2, code: 'FLAT10', type: 'Fixed', value: '$10', minOrder: '$30', uses: 89, maxUses: 200, expiry: '2025-11-30', status: 'Active' },
  { id: 3, code: 'WELCOME15', type: 'Percentage', value: '15%', minOrder: '$25', uses: 234, maxUses: 1000, expiry: '2025-12-31', status: 'Active' },
  { id: 4, code: 'SUMMER25', type: 'Percentage', value: '25%', minOrder: '$100', uses: 500, maxUses: 500, expiry: '2025-08-31', status: 'Expired' },
];

export function CouponManagement() {
  const [showForm, setShowForm] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<any>(null);
  const [coupons, setCoupons] = useState(mockCoupons);

  const handleEdit = (coupon: any) => {
    setSelectedCoupon(coupon);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setSelectedCoupon(null);
    setShowForm(true);
  };

  const handleDeleteClick = (coupon: any) => {
    setCouponToDelete(coupon);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (couponToDelete) {
      setCoupons(coupons.filter(c => c.id !== couponToDelete.id));
      toast.success('Coupon deleted successfully!');
      setShowDeleteDialog(false);
      setCouponToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl mb-1">Coupon Management</h2>
          <p className="text-gray-600">Create and manage discount coupons</p>
        </div>
        <Button onClick={handleAddNew} className="bg-[#1a4d2e] hover:bg-[#2d6a4f]">
          <Plus className="w-4 h-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h3 className="text-xl mb-4">
            {selectedCoupon ? 'Edit Coupon' : 'Create New Coupon'}
          </h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="coupon-code">Coupon Code</Label>
                <Input 
                  id="coupon-code" 
                  placeholder="e.g., SAVE20"
                  defaultValue={selectedCoupon?.code}
                />
              </div>

              <div>
                <Label htmlFor="discount-type">Discount Type</Label>
                <Select defaultValue={selectedCoupon?.type || 'Percentage'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Percentage">Percentage</SelectItem>
                    <SelectItem value="Fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="discount-value">Discount Value</Label>
                <Input 
                  id="discount-value" 
                  placeholder="e.g., 20 or 10"
                  defaultValue={selectedCoupon?.value?.replace(/[%$]/g, '')}
                />
              </div>

              <div>
                <Label htmlFor="min-order">Minimum Order Amount</Label>
                <Input 
                  id="min-order" 
                  type="number"
                  placeholder="0.00"
                  defaultValue={selectedCoupon?.minOrder?.replace('$', '')}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="max-uses">Maximum Uses</Label>
                <Input 
                  id="max-uses" 
                  type="number"
                  placeholder="Unlimited"
                  defaultValue={selectedCoupon?.maxUses}
                />
              </div>

              <div>
                <Label htmlFor="expiry-date">Expiry Date</Label>
                <Input 
                  id="expiry-date" 
                  type="date"
                  defaultValue={selectedCoupon?.expiry}
                />
              </div>

              <div className="flex items-center gap-4">
                <Switch id="active-coupon" defaultChecked={selectedCoupon?.status === 'Active'} />
                <Label htmlFor="active-coupon">Coupon is active</Label>
              </div>

              <div className="flex items-center gap-4">
                <Switch id="first-order" />
                <Label htmlFor="first-order">Valid for first order only</Label>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-6">
            <Button className="bg-[#1a4d2e] hover:bg-[#2d6a4f]">
              {selectedCoupon ? 'Update Coupon' : 'Create Coupon'}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4">Code</th>
                <th className="text-left py-3 px-4">Type</th>
                <th className="text-left py-3 px-4">Value</th>
                <th className="text-left py-3 px-4">Min. Order</th>
                <th className="text-left py-3 px-4">Uses</th>
                <th className="text-left py-3 px-4">Expiry Date</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <code className="bg-gray-100 px-2 py-1 rounded">{coupon.code}</code>
                      <Button variant="ghost" size="sm">
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                  <td className="py-3 px-4">{coupon.type}</td>
                  <td className="py-3 px-4">{coupon.value}</td>
                  <td className="py-3 px-4">{coupon.minOrder}</td>
                  <td className="py-3 px-4">{coupon.uses} / {coupon.maxUses}</td>
                  <td className="py-3 px-4">{coupon.expiry}</td>
                  <td className="py-3 px-4">
                    <Badge variant={coupon.status === 'Active' ? 'default' : 'secondary'}>
                      {coupon.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(coupon)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteClick(coupon)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title="Delete Coupon"
        itemName={couponToDelete?.code}
      />
    </div>
  );
}
