import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, Package, MapPin, CreditCard, Calendar, Truck, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import type { PageType } from "../App";
import { formatCurrency } from "../utils/formatCurrency";

interface Product {
  _id: string;
  name: string;
  images: string[];
  price: number;
}

interface OrderItem {
  product?: Product | string;
  quantity: number;
  price: number;
  name?: string;
  image?: string;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district?: string;
  ward?: string;
  zipCode?: string;
}

interface StatusHistoryItem {
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  updatedAt: string;
  note?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  discount?: {
    code?: string;
    amount?: number;
  };
  shipping: number;
  tax: number;
  total: number;
  loyaltyPointsUsed?: number;
  loyaltyDiscount?: number;
  orderStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
  notes?: string;
  statusHistory?: StatusHistoryItem[];
}

interface OrderDetailPageProps {
  orderId: string;
  onNavigate: (page: PageType, data?: any) => void;
}

const API_URL = import.meta.env.VITE_API_URL;

export function OrderDetailPage({ orderId, onNavigate }: OrderDetailPageProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

  const fetchOrderDetails = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`${API_URL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        }
      });
      
      if (response.data.success && response.data.data) {
        setOrder(response.data.data);
      } else {
        setError('Failed to load order details');
      }
    } catch (err: any) {
      console.error('Error fetching order details:', err);
      setError(err.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': 
        return 'bg-summer/20 text-summer-foreground border-summer/30';
      case 'Shipped': 
        return 'bg-winter/20 text-winter-foreground border-winter/30';
      case 'Processing': 
        return 'bg-autumn/20 text-autumn-foreground border-autumn/30';
      case 'Pending': 
        return 'bg-spring/20 text-spring-foreground border-spring/30';
      case 'Cancelled': 
        return 'bg-red-100 text-red-700 border-red-300';
      default: 
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': 
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Failed': 
        return 'bg-red-100 text-red-700 border-red-300';
      case 'Pending': 
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default: 
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered': 
        return <CheckCircle className="h-5 w-5 text-summer" />;
      case 'Shipped': 
        return <Truck className="h-5 w-5 text-winter" />;
      case 'Processing': 
        return <Clock className="h-5 w-5 text-autumn" />;
      case 'Cancelled': 
        return <XCircle className="h-5 w-5 text-red-600" />;
      default: 
        return <Clock className="h-5 w-5 text-spring" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6 text-center">
            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4 animate-pulse" />
            <p className="text-gray-600">Loading order details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6 text-center">
            <Package className="h-16 w-16 mx-auto text-red-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error || 'Order not found'}</p>
            <Button onClick={() => onNavigate("profile")}>Back to Profile</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => onNavigate("profile")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Profile</span>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Order Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
              <p className="text-gray-600 mt-1">Order #{order.orderNumber}</p>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(order.orderStatus)}
              <Badge variant="outline" className={getStatusColor(order.orderStatus)}>
                {order.orderStatus}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Order Items</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => {
                    const productName = typeof item.product === 'object' && item.product !== null
                      ? item.product.name
                      : item.name || 'Product';
                    
                    // Xử lý URL hình ảnh - thêm prefix nếu là relative path
                    let productImage: string | undefined;
                    if (typeof item.product === 'object' && item.product !== null) {
                      const imageUrl = item.product.images?.[0];
                      if (imageUrl) {
                        productImage = imageUrl.startsWith('http') 
                          ? imageUrl 
                          : `${API_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
                      }
                    } else if (item.image) {
                      productImage = item.image.startsWith('http')
                        ? item.image
                        : `${API_URL}${item.image.startsWith('/') ? '' : '/'}${item.image}`;
                    }
                    
                    const productPrice = typeof item.product === 'object' && item.product !== null
                      ? item.product.price
                      : item.price;

                    return (
                      <div key={index} className="flex items-center space-x-4 pb-4 border-b last:border-0">
                        <div className="w-20 h-24 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {productImage ? (
                            <img 
                              src={productImage} 
                              alt={productName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback nếu hình ảnh không load được
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg></div>';
                                }
                              }}
                            />
                          ) : (
                            <Package className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{productName}</h4>
                          <p className="text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-gray-600">Price: {formatCurrency(productPrice)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Shipping Address</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-semibold">{order.shippingAddress.fullName}</p>
                  <p className="text-gray-600">{order.shippingAddress.address}</p>
                  <p className="text-gray-600">
                    {order.shippingAddress.city}
                    {order.shippingAddress.district && `, ${order.shippingAddress.district}`}
                    {order.shippingAddress.ward && `, ${order.shippingAddress.ward}`}
                  </p>
                  <p className="text-gray-600">Phone: {order.shippingAddress.phone}</p>
                  {order.shippingAddress.zipCode && (
                    <p className="text-gray-600">Zip Code: {order.shippingAddress.zipCode}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tracking Information */}
            {order.trackingNumber && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Truck className="h-5 w-5" />
                    <span>Tracking Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    <span className="font-semibold">Tracking Number:</span> {order.trackingNumber}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {order.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{formatCurrency(order.subtotal)}</span>
                </div>
                
                {order.discount && order.discount.amount && order.discount.amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount {order.discount.code && `(${order.discount.code})`}</span>
                    <span className="font-semibold">-{formatCurrency(order.discount.amount)}</span>
                  </div>
                )}

                {order.loyaltyDiscount && order.loyaltyDiscount > 0 && (
                  <div className="flex justify-between text-amber-700">
                    <span>
                      Loyalty Points
                      {typeof order.loyaltyPointsUsed === 'number' && order.loyaltyPointsUsed > 0
                        ? ` (${order.loyaltyPointsUsed.toLocaleString()} pts)`
                        : ''}
                    </span>
                    <span className="font-semibold">-{formatCurrency(order.loyaltyDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">{formatCurrency(order.shipping)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold">{formatCurrency(order.tax)}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Payment Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                  <p className="font-semibold">{order.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                  <Badge variant="outline" className={getPaymentStatusColor(order.paymentStatus)}>
                    {order.paymentStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Order Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order Date</p>
                  <p className="font-semibold">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">Current Status</p>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.orderStatus)}
                    <Badge variant="outline" className={getStatusColor(order.orderStatus)}>
                      {order.orderStatus}
                    </Badge>
                  </div>
                </div>

                {/* Status History Timeline */}
                {order.statusHistory && order.statusHistory.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-3">Status History</p>
                    <div className="space-y-3">
                      {order.statusHistory
                        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                        .map((historyItem, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="flex flex-col items-center">
                              <div className={`w-2 h-2 rounded-full ${
                                index === 0 ? 'bg-current' : 'bg-gray-300'
                              }`} style={{ 
                                color: index === 0 ? 
                                  (order.orderStatus === 'Delivered' ? '#10b981' : 
                                   order.orderStatus === 'Shipped' ? '#3b82f6' :
                                   order.orderStatus === 'Processing' ? '#f59e0b' :
                                   order.orderStatus === 'Cancelled' ? '#ef4444' : '#8b5cf6') : undefined
                              }} />
                              {index < order.statusHistory!.length - 1 && (
                                <div className="w-0.5 h-8 bg-gray-200 mt-1" />
                              )}
                            </div>
                            <div className="flex-1 pb-3">
                              <div className="flex items-center space-x-2 mb-1">
                                <Badge 
                                  variant="outline" 
                                  className={`${getStatusColor(historyItem.status)} text-xs`}
                                >
                                  {historyItem.status}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {new Date(historyItem.updatedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              {historyItem.note && (
                                <p className="text-sm text-gray-600 mt-1">{historyItem.note}</p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

