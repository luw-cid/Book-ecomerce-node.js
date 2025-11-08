import axios from 'axios';
import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Plus, Edit, Trash2, Copy } from 'lucide-react';
import { DeleteConfirmationDialog } from '../ui/delete-confirmation-dialog';
import { toast } from 'sonner';

const API_ADMIN = 'http://localhost:4000';


interface Coupon {
  _id: string;
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  percentage?: number;
  fixedAmount?: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  usageLimit: number | null;
  usageCount: number;
  perUserLimit: number;
  startAt: string;
  expiresAt: string;
  isActive: boolean;
  isPublic: boolean;
  displayOnHomepage: boolean;
  firstTimeOnly: boolean;
}

interface FormData {
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  percentage: number;
  fixedAmount: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  usageLimit: number | null;
  perUserLimit: number;
  expiresAt: string;
  isActive: boolean;
  isPublic: boolean;
  displayOnHomepage: boolean;
  firstTimeOnly: boolean;
}

export function CouponManagement() {
  const [showForm, setShowForm] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState<FormData>({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage',
    percentage: 0,
    fixedAmount: 0,
    minOrderAmount: 0,
    maxDiscountAmount: null,
    usageLimit: null,
    perUserLimit: 1,
    expiresAt: '',
    isActive: true,
    isPublic: true,
    displayOnHomepage: false,
    firstTimeOnly: false
  });

  const getToken = () => {
    return localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken') || '';
  };

  // Fetch all discounts
  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get(`${API_ADMIN}/discounts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setCoupons(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching discounts:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch discounts');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      discountType: coupon.discountType,
      percentage: coupon.percentage || 0,
      fixedAmount: coupon.fixedAmount || 0,
      minOrderAmount: coupon.minOrderAmount || 0,
      maxDiscountAmount: coupon.maxDiscountAmount || null,
      usageLimit: coupon.usageLimit,
      perUserLimit: coupon.perUserLimit || 1,
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '',
      isActive: coupon.isActive,
      isPublic: coupon.isPublic,
      displayOnHomepage: coupon.displayOnHomepage,
      firstTimeOnly: coupon.firstTimeOnly || false
    });
    setShowForm(true);
  };

  const handleAddNew = () => {
    setSelectedCoupon(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      discountType: 'percentage',
      percentage: 0,
      fixedAmount: 0,
      minOrderAmount: 0,
      maxDiscountAmount: null,
      usageLimit: null,
      perUserLimit: 1,
      expiresAt: '',
      isActive: true,
      isPublic: true,
      displayOnHomepage: false,
      firstTimeOnly: false
    });
    setShowForm(true);
  };

  const handleDeleteClick = (coupon: Coupon) => {
    setCouponToDelete(coupon);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!couponToDelete) return;
    
    try {
      const token = getToken();
      await axios.delete(`${API_ADMIN}/discounts/${couponToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Coupon deleted successfully!');
      fetchDiscounts();
      setShowDeleteDialog(false);
      setCouponToDelete(null);
    } catch (error: any) {
      console.error('Error deleting coupon:', error);
      toast.error(error.response?.data?.message || 'Failed to delete coupon');
    }
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      const token = getToken();
      await axios.patch(`${API_ADMIN}/discounts/${coupon._id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success(`Coupon ${!coupon.isActive ? 'activated' : 'deactivated'} successfully!`);
      fetchDiscounts();
    } catch (error: any) {
      console.error('Error toggling coupon status:', error);
      toast.error(error.response?.data?.message || 'Failed to update coupon status');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = getToken();
      const payload = {
        ...formData,
        percentage: formData.discountType === 'percentage' ? formData.percentage : undefined,
        fixedAmount: formData.discountType === 'fixed' ? formData.fixedAmount : undefined,
      };
      
      if (selectedCoupon) {
        // Update existing coupon
        await axios.put(`${API_ADMIN}/discounts/${selectedCoupon._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Coupon updated successfully!');
      } else {
        // Create new coupon
        await axios.post(`${API_ADMIN}/discounts`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Coupon created successfully!');
      }
      
      setShowForm(false);
      setSelectedCoupon(null);
      fetchDiscounts();
    } catch (error: any) {
      console.error('Error saving coupon:', error);
      toast.error(error.response?.data?.message || 'Failed to save coupon');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Code copied to clipboard!');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
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
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="coupon-code">Coupon Code *</Label>
                  <Input 
                    id="coupon-code" 
                    placeholder="e.g., SAVE20"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="coupon-name">Coupon Name *</Label>
                  <Input 
                    id="coupon-name" 
                    placeholder="e.g., Summer Sale"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input 
                    id="description" 
                    placeholder="Brief description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="discount-type">Discount Type *</Label>
                  <Select 
                    value={formData.discountType}
                    onValueChange={(value: 'percentage' | 'fixed') => setFormData({...formData, discountType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="discount-value">
                    {formData.discountType === 'percentage' ? 'Percentage (%)' : 'Fixed Amount ($)'} *
                  </Label>
                  <Input 
                    id="discount-value" 
                    type="number"
                    min="0"
                    max={formData.discountType === 'percentage' ? 100 : undefined}
                    step={formData.discountType === 'percentage' ? 1 : 0.01}
                    placeholder={formData.discountType === 'percentage' ? 'e.g., 20' : 'e.g., 10.00'}
                    value={formData.discountType === 'percentage' ? formData.percentage : formData.fixedAmount}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      if (formData.discountType === 'percentage') {
                        setFormData({...formData, percentage: value});
                      } else {
                        setFormData({...formData, fixedAmount: value});
                      }
                    }}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="min-order">Minimum Order Amount ($)</Label>
                  <Input 
                    id="min-order" 
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({...formData, minOrderAmount: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="max-discount">Max Discount Amount ($)</Label>
                  <Input 
                    id="max-discount" 
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Leave empty for unlimited"
                    value={formData.maxDiscountAmount || ''}
                    onChange={(e) => setFormData({...formData, maxDiscountAmount: e.target.value ? parseFloat(e.target.value) : null})}
                  />
                </div>

                <div>
                  <Label htmlFor="max-uses">Maximum Total Uses</Label>
                  <Input 
                    id="max-uses" 
                    type="number"
                    min="0"
                    placeholder="Leave empty for unlimited"
                    value={formData.usageLimit || ''}
                    onChange={(e) => setFormData({...formData, usageLimit: e.target.value ? parseInt(e.target.value) : null})}
                  />
                </div>

                <div>
                  <Label htmlFor="per-user-limit">Uses Per User</Label>
                  <Input 
                    id="per-user-limit" 
                    type="number"
                    min="1"
                    placeholder="1"
                    value={formData.perUserLimit}
                    onChange={(e) => setFormData({...formData, perUserLimit: parseInt(e.target.value) || 1})}
                  />
                </div>

                <div>
                  <Label htmlFor="expiry-date">Expiry Date *</Label>
                  <Input 
                    id="expiry-date" 
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                    required
                  />
                </div>

                <div className="flex items-center gap-4">
                  <Switch 
                    id="active-coupon" 
                    checked={formData.isActive}
                    onCheckedChange={(checked: boolean) => setFormData({...formData, isActive: checked})}
                  />
                  <Label htmlFor="active-coupon">Coupon is active</Label>
                </div>

                <div className="flex items-center gap-4">
                  <Switch 
                    id="is-public" 
                    checked={formData.isPublic}
                    onCheckedChange={(checked: boolean) => setFormData({...formData, isPublic: checked})}
                  />
                  <Label htmlFor="is-public">Display publicly</Label>
                </div>

                <div className="flex items-center gap-4">
                  <Switch 
                    id="homepage" 
                    checked={formData.displayOnHomepage}
                    onCheckedChange={(checked: boolean) => setFormData({...formData, displayOnHomepage: checked})}
                  />
                  <Label htmlFor="homepage">Show on homepage</Label>
                </div>

                <div className="flex items-center gap-4">
                  <Switch 
                    id="first-order" 
                    checked={formData.firstTimeOnly}
                    onCheckedChange={(checked: boolean) => setFormData({...formData, firstTimeOnly: checked})}
                  />
                  <Label htmlFor="first-order">First-time customers only</Label>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button type="submit" className="bg-[#1a4d2e] hover:bg-[#2d6a4f]">
                {selectedCoupon ? 'Update Coupon' : 'Create Coupon'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-6">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading coupons...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No coupons found. Create one to get started!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4">Code</th>
                  <th className="text-left py-3 px-4">Name</th>
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
                  <tr key={coupon._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">
                          {coupon.code}
                        </code>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => copyToClipboard(coupon.code)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="py-3 px-4">{coupon.name}</td>
                    <td className="py-3 px-4 capitalize">{coupon.discountType}</td>
                    <td className="py-3 px-4">
                      {coupon.discountType === 'percentage' 
                        ? `${coupon.percentage}%` 
                        : `$${coupon.fixedAmount}`}
                    </td>
                    <td className="py-3 px-4">${coupon.minOrderAmount}</td>
                    <td className="py-3 px-4">
                      {coupon.usageCount} / {coupon.usageLimit || '∞'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={isExpired(coupon.expiresAt) ? 'text-red-600' : ''}>
                        {formatDate(coupon.expiresAt)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={coupon.isActive ? 'default' : 'secondary'}>
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {isExpired(coupon.expiresAt) && (
                          <Badge variant="destructive">Expired</Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleToggleStatus(coupon)}
                          title={coupon.isActive ? 'Deactivate' : 'Activate'}
                        >
                          <Switch checked={coupon.isActive} />
                        </Button>
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
        )}
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
