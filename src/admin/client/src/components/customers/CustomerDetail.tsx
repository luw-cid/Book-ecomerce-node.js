import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ArrowLeft, User, MapPin, ShoppingCart, CreditCard, Award, TrendingUp, Mail, Phone, Edit2, Save, X, Plus, Minus, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';
import { formatCurrency } from '../../utils/formatCurrency';

const API_URL = import.meta.env.VITE_API_URL;

interface Customer {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  avatar?: string;
  loyalty: {
    points: number;
    lifetimePoints: number;
    lastEarnedAt?: string;
    lastRedeemedAt?: string;
  };
  preferences: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    marketingEmails: boolean;
  };
  createdAt: string;
  updatedAt: string;
  orderStats?: {
    totalOrders: number;
    totalSpent: number;
    avgOrderValue: number;
  };
  recentOrders?: any[];
}

interface CustomerDetailProps {
  customer: Customer;
  onBack: () => void;
  onUpdate: () => void;
}

export function CustomerDetail({ customer: initialCustomer, onBack, onUpdate }: CustomerDetailProps) {
  const [customer, setCustomer] = useState<Customer>(initialCustomer);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPointsDialog, setShowPointsDialog] = useState(false);
  const [pointsAction, setPointsAction] = useState<'add' | 'subtract'>('add');
  const [pointsAmount, setPointsAmount] = useState('');
  const [pointsReason, setPointsReason] = useState('');
  const [editData, setEditData] = useState({
    fullName: customer.fullName,
    phoneNumber: customer.phoneNumber || '',
    address: customer.address || ''
  });

  const getToken = () => {
    return localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
  };

  useEffect(() => {
    fetchCustomerDetail();
  }, []);

  const fetchCustomerDetail = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      const response = await axios.get(`${API_URL}/customers/${customer._id}`, {
        headers: { Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        setCustomer(response.data.customer);
      }
    } catch (error: any) {
      console.error('Error fetching customer detail:', error);
      toast.error(error.response?.data?.message || 'Failed to load customer details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCustomer = async () => {
    try {
      const token = getToken();
      const response = await axios.put(
        `${API_URL}/customers/${customer._id}`,
        editData,
        {
          headers: { Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setCustomer(response.data.customer);
        setIsEditing(false);
        toast.success('Customer updated successfully');
        onUpdate();
      }
    } catch (error: any) {
      console.error('Error updating customer:', error);
      toast.error(error.response?.data?.message || 'Failed to update customer');
    }
  };

  const handleUpdatePoints = async () => {
    if (!pointsAmount || parseInt(pointsAmount) <= 0) {
      toast.error('Please enter a valid points amount');
      return;
    }

    try {
      const token = getToken();
      const response = await axios.put(
        `${API_URL}/customers/${customer._id}/loyalty`,
        {
          points: parseInt(pointsAmount),
          action: pointsAction,
          reason: pointsReason
        },
        {
          headers: { Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setCustomer(response.data.customer);
        setShowPointsDialog(false);
        setPointsAmount('');
        setPointsReason('');
        toast.success(`Successfully ${pointsAction === 'add' ? 'added' : 'subtracted'} ${pointsAmount} points`);
        onUpdate();
      }
    } catch (error: any) {
      console.error('Error updating points:', error);
      toast.error(error.response?.data?.message || 'Failed to update points');
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-purple-100 text-purple-800';
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'bronze': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#1a4d2e]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Customers
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {customer.avatar ? (
            <img 
              src={customer.avatar} 
              alt={customer.fullName}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#1a4d2e] text-white flex items-center justify-center text-2xl font-medium">
              {customer.fullName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="text-3xl mb-1">{customer.fullName}</h2>
            <p className="text-gray-600">Customer since {formatDate(customer.createdAt)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold">{customer.orderStats?.totalOrders || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold">{formatCurrency(customer.orderStats?.totalSpent || 0)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold">{formatCurrency(customer.orderStats?.avgOrderValue || 0)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Loyalty Points</p>
              <p className="text-2xl font-bold">{customer.loyalty?.points?.toLocaleString() || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Orders */}
          <Card className="p-6">
            <h3 className="text-xl mb-4 font-semibold">Recent Orders</h3>
            {customer.recentOrders && customer.recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Order Number</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.recentOrders.map((order: any) => (
                      <tr key={order._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-sm">{order.orderNumber}</td>
                        <td className="py-3 px-4 text-sm">{formatDate(order.createdAt)}</td>
                        <td className="py-3 px-4 text-sm font-semibold text-green-600">{formatCurrency(order.total)}</td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary" className="text-xs">
                            {order.orderStatus}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No orders yet</p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          {/* Contact Information */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-[#1a4d2e]" />
                <h3 className="text-xl font-semibold">Contact Info</h3>
              </div>
            </div>
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={editData.fullName}
                      onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">Phone</Label>
                    <Input
                      id="phoneNumber"
                      value={editData.phoneNumber}
                      onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={editData.address}
                      onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleUpdateCustomer}
                      className="flex-1"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600">Email</p>
                      <p className="text-sm">{customer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600">Phone</p>
                      <p className="text-sm">{customer.phoneNumber || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600">Address</p>
                      <p className="text-sm">{customer.address || 'Not provided'}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Loyalty Management */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-[#1a4d2e]" />
              <h3 className="text-xl font-semibold">Loyalty Program</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Current Points</p>
                <p className="text-2xl font-bold text-green-600">{customer.loyalty?.points?.toLocaleString() || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Lifetime Points</p>
                <p className="text-lg font-semibold">{customer.loyalty?.lifetimePoints?.toLocaleString() || 0}</p>
              </div>
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPointsDialog(true)}
                  className="w-full"
                >
                  Manage Points
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Points Management Dialog */}
      <Dialog open={showPointsDialog} onOpenChange={setShowPointsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Loyalty Points</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Action</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={pointsAction === 'add' ? 'default' : 'outline'}
                  onClick={() => setPointsAction('add')}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Points
                </Button>
                <Button
                  variant={pointsAction === 'subtract' ? 'default' : 'outline'}
                  onClick={() => setPointsAction('subtract')}
                  className="flex-1"
                >
                  <Minus className="w-4 h-4 mr-2" />
                  Subtract Points
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="points">Points Amount</Label>
              <Input
                id="points"
                type="number"
                value={pointsAmount}
                onChange={(e) => setPointsAmount(e.target.value)}
                placeholder="Enter points amount"
              />
            </div>
            <div>
              <Label htmlFor="reason">Reason (optional)</Label>
              <Input
                id="reason"
                value={pointsReason}
                onChange={(e) => setPointsReason(e.target.value)}
                placeholder="e.g., Bonus points, Compensation"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPointsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePoints}>
              Update Points
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
