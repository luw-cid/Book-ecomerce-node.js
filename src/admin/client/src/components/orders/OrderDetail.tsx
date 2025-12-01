import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ArrowLeft, Package, User, CreditCard, MapPin, Loader2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';


const API_URL = 'http://localhost:4000';

interface OrderDetailProps {
  order?: Order;
  orderId?: string;
  onBack: () => void;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
}

interface User {
  _id: string;
  fullName?: string;
  email: string;
  phoneNumber?: string;
}

interface Product {
  _id: string;
  name: string;
  images: string[];
  price: number;
}

interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  user: User;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export function OrderDetail({ order: initialOrder, orderId, onBack }: OrderDetailProps) {
  const [order, setOrder] = useState<Order | null>(initialOrder || null);
  const [isLoading, setIsLoading] = useState(!initialOrder);
  const [isUpdating, setIsUpdating] = useState(false);

  const getToken = () => {
    return localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
  };

  useEffect(() => {
    if (orderId && !initialOrder) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const fetchOrderDetail = async () => {
    if (!orderId) return;
    
    try {
      setIsLoading(true);
      const token = getToken();
      const response = await axios.get(`${API_URL}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setOrder(response.data.order);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch order details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    const targetOrderId = orderId || order?._id;
    if (!targetOrderId) return;
    
    try {
      setIsUpdating(true);
      const token = getToken();
      const response = await axios.put(
        `${API_URL}/orders/${targetOrderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Order status updated successfully');
        if (orderId) {
          fetchOrderDetail(); // Reload data if using orderId
        } else {
          setOrder(response.data.order); // Update state directly if using order object
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Processing': 'bg-blue-100 text-blue-800',
      'Shipped': 'bg-purple-100 text-purple-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

    if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#1a4d2e]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order not found</p>
        <Button onClick={onBack} className="mt-4">
          Back to Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl mb-1">Order: {order.orderNumber}</h2>
          <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex gap-2 items-center">
          <Select 
            value={order.orderStatus} 
            onValueChange={handleUpdateStatus}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Processing">Processing</SelectItem>
              <SelectItem value="Shipped">Shipped</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Badge className={getStatusColor(order.paymentStatus)}>
            {order.paymentStatus}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-[#1a4d2e]" />
              <h3 className="text-xl font-semibold">Order Items</h3>
            </div>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                  <img 
                    src={item.product.images?.[0] || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect width="80" height="80" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E'} 
                    alt={item.product.name}
                    className="w-16 h-20 object-cover rounded flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium">{item.product.name}</h4>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-sm font-medium">{formatCurrency(item.price)} each</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span>{order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span>{formatCurrency(order.tax)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t font-semibold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-[#1a4d2e]" />
              <h3 className="text-xl font-semibold">Payment Information</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <Badge className={getStatusColor(order.paymentStatus)}>
                  {order.paymentStatus}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-semibold text-lg">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-[#1a4d2e]" />
              <h3 className="text-xl font-semibold">Customer</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{order.user?.fullName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{order.user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{order.user?.phoneNumber || order.shippingAddress?.phone || 'N/A'}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-[#1a4d2e]" />
              <h3 className="text-xl font-semibold">Shipping Address</h3>
            </div>
            <div className="space-y-1">
              <p className="font-medium">{order.shippingAddress?.fullName}</p>
              <p className="text-gray-600">{order.shippingAddress?.phone}</p>
              <p className="text-gray-600">{order.shippingAddress?.address}</p>
              <p className="text-gray-600">
                {order.shippingAddress?.ward}, {order.shippingAddress?.district}
              </p>
              <p className="text-gray-600">{order.shippingAddress?.city}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
