import React, { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, User, Mail, Calendar, Heart, ShoppingBag, Settings, Camera, Package, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { BookCard, type Book } from "./BookCard";
import type { CartItem } from "./ShoppingCart";
import { sampleBooks } from "../data/books";
import type { PageType } from "../App";
import { useAuth } from "../context/authContext";
import { formatCurrency } from "../utils/formatCurrency";

interface User {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
  createdAt: string;
  phoneNumber?: string;
  address?: string;
  preferences?: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    marketingEmails: boolean;
  };
}

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
  district: string;
  ward: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  user?: User;
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
  orderStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
}

interface ProfilePageProps {
  user: User | null;
  onNavigate: (page: PageType, data?: any) => void;
  onLogout: () => void;
  cartItems: CartItem[];
  wishlist: Set<string>;
  onToggleWishlist: (bookId: string) => void;
  onAddToCart: (payload: { book: Book; variantId?: string }) => void;
}

const API_URL = 'http://localhost:3000';

export function ProfilePage({ 
  user, 
  onNavigate, 
  onLogout, 
  cartItems, 
  wishlist, 
  onToggleWishlist, 
  onAddToCart 
}: ProfilePageProps) {
  const { updateUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  // State cho phép cập nhật thông tin người dùng
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
  });

  // State cho thay đổi mật khẩu
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  // State cho preferences
  const [preferences, setPreferences] = useState({
    emailNotifications: user?.preferences?.emailNotifications || false,
    smsNotifications: user?.preferences?.smsNotifications || false,
    marketingEmails: user?.preferences?.marketingEmails || false,
  });

  // State cho chỉnh sửa avatar
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatar || '');

  // State cho order history
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string>('');

  // State cho loyalty account
  const [loyaltyAccount, setLoyaltyAccount] = useState<{ totalPoints: number; tier: string } | null>(null);

  // Cập nhật states khi user prop thay đổi
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
      });
      setPreferences({
        emailNotifications: user.preferences?.emailNotifications || false,
        smsNotifications: user.preferences?.smsNotifications || false,
        marketingEmails: user.preferences?.marketingEmails || false,
      });
      setAvatarPreview(user.avatar || '');
    }
  }, [user]);

  // Tự động ản message sau 5 giây
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage({ type: '', content: '' }), 5000);
      return () => clearTimeout(timer); 
    }
  }, [message]);

  // Fetch order history và loyalty account khi user đăng nhập
  useEffect(() => {
    if (user) {
      fetchUserOrders();
      fetchLoyaltyAccount();
    }
  }, [user]);

  const fetchLoyaltyAccount = async () => {
    try {
      const response = await axios.get(`${API_URL}/loyalty/account`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        }
      });
      
      if (response.data.success && response.data.account) {
        setLoyaltyAccount(response.data.account);
      }
    } catch (error: any) {
      console.error('Error fetching loyalty account:', error);
      // Set default nếu có lỗi
      setLoyaltyAccount({ totalPoints: 0, tier: 'bronze' });
    }
  };

  const fetchUserOrders = async () => {
    setOrdersLoading(true);
    setOrdersError('');
    
    try {
      const response = await axios.get(`${API_URL}/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
        },
        params: {
          page: 1,
          limit: 10,
        }
      });
      
      if (response.data.success && response.data.data) {
        setOrders(response.data.data);
      } else {
        setOrdersError(response.data.message || 'Failed to fetch orders.');
      }
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      setOrdersError(error.response?.data?.message || 'Failed to load order history');
    } finally {
      setOrdersLoading(false);
    }
  };

  // JWT token được lưu trong localStorage sau khi login
  const getToken = () => localStorage.getItem('token');

  // Hiển thị message và scroll lên đầu trang (smooth animation)
  const showMessage = (type: 'success' | 'error', content: string) => {
    setMessage({ type, content });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 1. Xử lý cập nhật thông tin cá nhân
  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();     // Ngăn form reload page
    setLoading(true);
    
    try {
      const response = await axios.put(`${API_URL}/user/profile`, profileData, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,    //JWT token
          "Content-Type": "application/json"
        }
      });
      
      if (response.data.user) {
        updateUser?.(response.data.user);  // Cập nhật user trong context
        showMessage('success', response.data.message || 'Profile updated successfully.');
      }
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);    // Tắt loading trong mọi trường hợp
    }
  }

  // 2. Xử lý thay đổi mật khẩu
  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      showMessage('error', 'New password and confirmation do not match.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showMessage('error', 'New password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.put(`${API_URL}/user/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            "Content-Type": "application/json"
          }
        });

      showMessage('success', response.data.message || 'Password changed successfully.');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  }

  // 3. Xử lý cập nhật avatar
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      showMessage('error', 'Only JPG, PNG, and GIF files are allowed.');
      return;
    }

    // Cho phép file size <= 5MB
    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'File size must be less than 5MB.');
      return;
    }

    // Nếu tất cả điều kiện đều hợp lệ, tiến hành cập nhật avatar
    const formData = new FormData();
    formData.append('avatar', file);

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/user/avatar`, formData, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.avatar) {
        // Fetch updated user profile
        const profileResponse = await axios.get(`${API_URL}/user/profile`, {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
          }
        });
        
        if (profileResponse.data.user) {
          updateUser?.(profileResponse.data.user);
          setAvatarPreview(response.data.avatar);
        }
        showMessage('success', response.data.message || 'Avatar updated successfully.');
      }
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to update avatar.');
    } finally {
      setLoading(false);
    }
  }

  // 4. Xử lý cập nhật preferences
  const handleUpdatePreferences = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.put(`${API_URL}/user/preference`, preferences,
        {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            "Content-Type": "application/json"
          }
        });

      if (response.data.preferences) {
        // Fetch updated user profile
        const profileResponse = await axios.get(`${API_URL}/user/profile`, {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
          }
        });
        
        if (profileResponse.data.user) {
          updateUser?.(profileResponse.data.user);
        }
        showMessage('success', response.data.message || 'Preferences updated successfully.');
      }
    } catch (error: any) {
      showMessage('error', error.response?.data?.message || 'Failed to update preferences.');
    } finally {
      setLoading(false);
    }
  }

  // ==================== UI GUARD ====================

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Please Sign In</h2>
            <p className="text-gray-600 mb-4">You need to be logged in to view your profile.</p>
            <Button onClick={() => onNavigate("login")}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }


  const wishlistBooks = sampleBooks.filter(book => wishlist.has(book.id));
  const memberSince = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : 'Recently';

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

  // Handler functions cho order actions
  const handleViewOrderDetails = (orderId: string) => {
    onNavigate("order-detail", { orderId });
  };

  const handleTrackOrder = (orderId: string) => {
    // Navigate đến trang tracking hoặc hiển thị thông tin tracking
    // Có thể mở modal hoặc navigate đến trang tracking
    onNavigate("order-detail", { orderId });
  };

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => onNavigate("home")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <p className="font-medium">{message.content}</p>
          </div>
        )}

        {/* Profile Header */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-spring-light/30 via-summer-light/30 via-autumn-light/30 to-winter-light/30 border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                    <AvatarImage 
                      src={user.avatar || `https://ui-avatars.com/?name=${encodeURIComponent(user.fullName || 'User')}&size=128`}
                      alt={user.fullName || 'User'} />
                    <AvatarFallback className="bg-gradient-to-br from-spring to-winter text-white text-2xl">
                      {user.fullName?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 cursor-pointer">
                    <div className="h-10 w-10 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
                      <Camera className="h-5 w-5" />
                    </div>
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>

                {/* User Info */}
                <div className="flex-1 md:mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{user.fullName}</h1>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mt-2 text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{user.email || ''}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Member since {memberSince}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 md:mb-4">
                    <Button variant="outline" onClick={onLogout}>
                      Sign Out
                    </Button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 bg-white/60 rounded-lg backdrop-blur-sm">
                      <div className="text-2xl font-bold text-spring">{orders.length}</div>
                      <div className="text-sm text-gray-600">Orders</div>
                    </div>
                    <div className="text-center p-4 bg-white/60 rounded-lg backdrop-blur-sm">
                      <div className="text-2xl font-bold text-summer">{wishlistBooks.length}</div>
                      <div className="text-sm text-gray-600">Wishlist</div>
                    </div>
                    <div className="text-center p-4 bg-white/60 rounded-lg backdrop-blur-sm">
                      <div className="text-2xl font-bold text-winter flex items-center justify-center gap-1">
                        <Star className="h-5 w-5" />
                        {loyaltyAccount ? loyaltyAccount.totalPoints.toLocaleString() : '0'}
                      </div>
                      <div className="text-sm text-gray-600">Loyalty Points</div>
                      {/* {loyaltyAccount && loyaltyAccount.tier && (
                        <div className="text-xs text-gray-500 mt-1 capitalize">{loyaltyAccount.tier}</div>
                      )} */}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2">
                  {/* <Button className="bg-gradient-to-r from-summer to-winter text-white hover:opacity-90">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button> */}
                  <Button className="bg-gradient-to-r from-summer to-winter text-white hover:opacity-90" variant="outline" onClick={onLogout}>
                    Sign Out
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Content */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Orders</span>
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>Wishlist</span>
            </TabsTrigger>
            <TabsTrigger value="cart" className="flex items-center space-x-2">
              <ShoppingBag className="h-4 w-4" />
              <span>Cart</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Order History */}
          <TabsContent value="orders" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Order History</h2>
              
              {ordersLoading ? (
                <Card className="p-8 text-center">
                  <Package className="h-16 w-16 mx-auto text-gray-400 mb-4 animate-pulse" />
                  <p className="text-gray-600">Loading orders...</p>
                </Card>
              ) : ordersError ? (
                <Card className="p-8 text-center">
                  <Package className="h-16 w-16 mx-auto text-red-400 mb-4" />
                  <p className="text-red-600 mb-4">{ordersError}</p>
                  <Button onClick={fetchUserOrders}>Retry</Button>
                </Card>
              ) : orders.length === 0 ? (
                <Card className="p-8 text-center">
                  <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
                  <p className="text-gray-600 mb-4">Start browsing to place your first order!</p>
                  <Button onClick={() => onNavigate("home")}>Browse Books</Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order._id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">Order #{order.orderNumber}</h3>
                            <p className="text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className={getStatusColor(order.orderStatus)}>
                              {order.orderStatus}
                            </Badge>
                            <p className="font-semibold text-lg mt-1">{formatCurrency(order.total)}</p>
                          </div>
                        </div>
                        
                        <Separator className="my-4" />
                        
                        {/* Order Items Preview */}
                        {order.items && order.items.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Items:</p>
                            <div className="space-y-2">
                              {order.items.slice(0, 3).map((item, index) => {
                                const productName = typeof item.product === 'object' && item.product !== null
                                  ? item.product.name
                                  : item.name || 'Product';
                                
                                return (
                                  <div key={index} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">
                                      {productName} x {item.quantity}
                                    </span>
                                    <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                                  </div>
                                );
                              })}
                              {order.items.length > 3 && (
                                <p className="text-gray-500 text-xs">
                                  and {order.items.length - 3} more item(s)...
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <Separator className="my-4" />
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-600">{order.items?.length || 0} items</p>
                            <p className="text-sm text-gray-500">
                              Payment: {order.paymentStatus} • Method: {order.paymentMethod}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewOrderDetails(order._id)}
                            >
                              View Details
                            </Button>
                            {order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleTrackOrder(order._id)}
                              >
                                Track Order
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Wishlist */}
          <TabsContent value="wishlist" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">My Wishlist</h2>
              {wishlistBooks.length === 0 ? (
                <Card className="p-8 text-center">
                  <Heart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
                  <p className="text-gray-600 mb-4">Save books you love to your wishlist!</p>
                  <Button onClick={() => onNavigate("home")}>Browse Books</Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {wishlistBooks.map((book) => (
                    <div key={book.id} onClick={() => onNavigate("product-detail", { bookId: book.id })} className="cursor-pointer">
                      <BookCard
                        book={book}
                        onAddToCart={(payload) => onAddToCart(payload)}
                        onToggleWishlist={onToggleWishlist}
                        isInWishlist={true}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Cart */}
          <TabsContent value="cart" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Shopping Cart</h2>
              {cartItems.length === 0 ? (
                <Card className="p-8 text-center">
                  <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
                  <p className="text-gray-600 mb-4">Add some books to get started!</p>
                  <Button onClick={() => onNavigate("home")}>Browse Books</Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600">{cartItems.length} items in cart</p>
                    <Button onClick={() => onNavigate("cart")}>View Full Cart</Button>
                  </div>
                  {cartItems.slice(0, 3).map((item) => (
                    <Card key={item.book.id} className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-20 bg-gray-100 rounded-lg flex-shrink-0"></div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.book.title}</h4>
                          <p className="text-gray-600">{item.book.author}</p>
                          <p className="font-semibold">{formatCurrency(item.book.price)} x {item.quantity}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {cartItems.length > 3 && (
                    <p className="text-center text-gray-600">
                      and {cartItems.length - 3} more items...
                    </p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Account Settings</h2>
              <div className="grid gap-6">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input 
                            id="fullName" 
                            value={profileData.fullName}
                            onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            value={user.email || ''} 
                            disabled
                            className="bg-gray-100 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phoneNumber">Phone Number</Label>
                          <Input 
                            id="phoneNumber" 
                            type="tel"
                            value={profileData.phoneNumber}
                            onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor="address">Address</Label>
                          <Input 
                            id="address" 
                            value={profileData.address}
                            onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                          />
                        </div>
                      </div>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Profile'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Change Password */}
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input 
                          id="currentPassword" 
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="newPassword">New Password (min 6 characters)</Label>
                        <Input 
                          id="newPassword" 
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          required
                          minLength={6}
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                        <Input 
                          id="confirmNewPassword" 
                          type="password"
                          value={passwordData.confirmNewPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                          required
                          minLength={6}
                        />
                      </div>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Changing...' : 'Change Password'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Preferences */}
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdatePreferences} className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <h4 className="font-medium">Email Notifications</h4>
                            <p className="text-sm text-gray-600">Receive order updates via email</p>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={preferences.emailNotifications}
                            onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                            className="w-4 h-4"
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <h4 className="font-medium">SMS Notifications</h4>
                            <p className="text-sm text-gray-600">Receive order updates via SMS</p>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={preferences.smsNotifications}
                            onChange={(e) => setPreferences({ ...preferences, smsNotifications: e.target.checked })}
                            className="w-4 h-4"
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <h4 className="font-medium">Marketing Emails</h4>
                            <p className="text-sm text-gray-600">Receive promotions and special offers</p>
                          </div>
                          <input 
                            type="checkbox" 
                            checked={preferences.marketingEmails}
                            onChange={(e) => setPreferences({ ...preferences, marketingEmails: e.target.checked })}
                            className="w-4 h-4"
                          />
                        </div>
                      </div>
                      <Button type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Preferences'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button variant="destructive">Delete Account</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}