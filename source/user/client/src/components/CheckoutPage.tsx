import axios from "axios";
import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Loader2, Tag, Gift, X, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Separator } from "./ui/separator";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { type CartItem } from "./ShoppingCart";
import type { PageType } from "../App";
import { formatCurrency } from "../utils/formatCurrency";
import { Checkbox } from "./ui/checkbox";
import { PaymentModal } from "./PaymentModal";

interface CheckoutPageProps {
  cartItems: CartItem[];
  onNavigate: (page: PageType, data?: any) => void;
  user?: any;
  onClearCart: () => void;
}

interface DiscountCode {
  _id: string;
  code: string;
  name: string;
  description: string;
  discountType: "percentage" | "fixed";
  percentage?: number;
  fixedAmount?: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  expiresAt?: string;
}

interface LoyaltyAccount {
  userId: string;
  totalPoints: number;
  tier: string;
  tierBenefits?: string;
}

const API_URL = 'http://localhost:3000';

export function CheckoutPage({ cartItems, onNavigate, user, onClearCart }: CheckoutPageProps) {
  const [formData, setFormData] = useState({
    email: user?.email || "",
    fullName: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("bank-transfer");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // Promo code states
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [isLoadingCoupon, setIsLoadingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<DiscountCode[]>([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);
  
  // Loyalty points states
  const [loyaltyPointsToUse, setLoyaltyPointsToUse] = useState(0);
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  const [loyaltyAccount, setLoyaltyAccount] = useState<LoyaltyAccount | null>(null);
  const [isLoadingLoyalty, setIsLoadingLoyalty] = useState(false);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);

  const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  };

  // Fetch loyalty account when user is authenticated
  useEffect(() => {
    if (user) {
      fetchLoyaltyAccount();
    }
  }, [user]);

  // Fetch available coupons
  useEffect(() => {
    fetchAvailableCoupons();
  }, []);

  const fetchAvailableCoupons = async () => {
    try {
      setIsLoadingCoupons(true);
      const response = await axios.get(`${API_URL}/discounts/active`);
      
      if (response.data.success) {
        setAvailableCoupons(response.data.discounts || []);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setIsLoadingCoupons(false);
    }
  };

  const fetchLoyaltyAccount = async () => {
    if (!user) return;
    
    try {
      setIsLoadingLoyalty(true);
      const token = getToken();
      
      const response = await axios.get(`${API_URL}/loyalty/account`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setLoyaltyAccount(response.data.account);
      }
    } catch (error: any) {
      console.error('Error fetching loyalty account:', error);
      if (error.response?.status === 404) {
        setLoyaltyAccount({
          userId: user.id,
          totalPoints: 0,
          tier: 'Bronze'
        });
      }
    } finally {
      setIsLoadingLoyalty(false);
    }
  };

  const calculateDiscountAmount = (discount: DiscountCode, amount: number): number => {
    if (!discount) return 0;
    
    if (discount.minOrderAmount && amount < discount.minOrderAmount) {
      return 0;
    }
    
    if (discount.discountType === 'percentage') {
      const discountAmount = (amount * (discount.percentage || 0)) / 100;
      return discount.maxDiscountAmount ? Math.min(discountAmount, discount.maxDiscountAmount) : discountAmount;
    } else {
      return Math.min(discount.fixedAmount || 0, amount);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.book.price * item.quantity), 0);
  
  // Calculate discount
  const discountAmount = appliedDiscount ? calculateDiscountAmount(appliedDiscount, subtotal) : 0;
  const subtotalAfterDiscount = subtotal - discountAmount;
  
  // Calculate loyalty points discount (100 points = 100,000 VND, so 1 point = 1,000 VND)
  const maxLoyaltyPoints = loyaltyAccount ? Math.min(loyaltyAccount.totalPoints, Math.floor(subtotalAfterDiscount / 1000)) : 0;
  const loyaltyDiscount = useLoyaltyPoints ? loyaltyPointsToUse * 1000 : 0;
  
  // Calculate shipping cost based on city
  const shippingCost = formData.city.includes('Hồ Chí Minh') || 
                       formData.city.includes('thành phố Hồ Chí Minh') || 
                       formData.city.toLowerCase().includes('tp.hcm') ||
                       formData.city.toLowerCase().includes('tphcm') ||
                       formData.city.toLowerCase().includes('hcm') ||
                       formData.city.toLowerCase().includes('HCM') ||
                       formData.city === 'TP. Hồ Chí Minh' ? 0 : 30000;
  
  const total = Math.max(0, subtotalAfterDiscount - loyaltyDiscount + shippingCost);
  const earnedPoints = user ? Math.floor(total * 0.1 / 1000) : 0; // Earn 1% of total as loyalty points (1 point = 1,000 VND)

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = codeToApply || couponCode;
    if (!code.trim()) {
      setCouponMessage("Please enter a coupon code");
      return;
    }

    try {
      setIsLoadingCoupon(true);
      setCouponMessage("");
      
      const response = await axios.post(`${API_URL}/discounts/apply`, {
        code: code.toUpperCase(),
        subtotal: subtotal
      });

      if (response.data.success && response.data.data.discount) {
        const discount = response.data.data.discount;
        
        const discountCode: DiscountCode = {
          _id: discount._id,
          code: discount.code,
          name: discount.name || discount.code,
          description: `${discount.type === 'percentage' ? `${discount.value}% OFF` : `${discount.value} OFF`}`,
          discountType: discount.type,
          percentage: discount.type === 'percentage' ? discount.value : undefined,
          fixedAmount: discount.type === 'fixed' ? discount.value : undefined,
          minOrderAmount: discount.minOrderAmount,
          maxDiscountAmount: discount.maxDiscountAmount,
        };
        
        setAppliedDiscount(discountCode);
        setCouponMessage(`✓ Discount applied: ${discountCode.description}`);
        setCouponCode("");
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Invalid or expired coupon code";
      setAppliedDiscount(null);
      setCouponMessage(message);
    } finally {
      setIsLoadingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedDiscount(null);
    setCouponMessage("");
    setCouponCode("");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (!formData.email || !formData.fullName || !formData.phone || !formData.address || !formData.city) {
        setError("Please fill in all required fields.");
        setIsSubmitting(false);
        return;
      }

      const orderData = {
        items: cartItems.map(item => ({
          product: item.book.id,
          quantity: item.quantity,
          price: item.book.price
        })),
        shippingAddress: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
        },
        paymentMethod: paymentMethod === "bank-transfer" ? "Bank Transfer" : "Cash on Delivery",
        shippingMethod: "Standard",
        shippingCost: shippingCost,
        subtotal: subtotal,
        discount: appliedDiscount ? {
          code: appliedDiscount.code,
          amount: discountAmount,
          type: appliedDiscount.discountType
        } : undefined,
        loyaltyPointsUsed: useLoyaltyPoints ? loyaltyPointsToUse : 0,
        loyaltyDiscount: useLoyaltyPoints ? loyaltyDiscount : 0,
        total: total,
        paymentStatus: "Pending",
        orderStatus: "Pending"
      };

      console.log("Creating order:", orderData);

      const response = await axios.post('http://localhost:3000/orders', orderData, 
        { 
          headers: user ? {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          } : {}
        });

        console.log("Order created:", response.data);

        if (response.data.success) {
          const order = response.data.order;

          if (paymentMethod === "bank-transfer") {
            const newOrderData = {
              orderId: order._id,
              orderNumber: order.orderNumber,
              total: order.total,
              recipientName: formData.fullName,
              recipientEmail: formData.email,
              recipientPhone: formData.phone,
              paymentMethod: "Bank Transfer"
            };
            
            console.log("Setting order data:", newOrderData);
            setOrderData(newOrderData);
            setShowPaymentModal(true);
            console.log("Modal should be showing now");
          } else {
            alert(`✅ Order placed successfully!\n\nOrder Number: ${order.orderNumber}\nTotal: ${formatCurrency(order.total)}\n\nYou will pay when you receive the order.`);
            onClearCart();
            onNavigate("home");
          }
        }
    } catch (error: any) {
      console.error("Error creating order:", error);
      setError(error.response?.data?.message || "An error occurred while placing your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handelPaymentSuccess = () => {
    alert(`✅ Payment successful!\n\nOrder Number: ${orderData.orderNumber}\nTotal: ${formatCurrency(orderData.total)}`);
    onClearCart();
    onNavigate("home");
  };

  const paymentOptions = [
    {
      id: "bank-transfer",
      name: "Bank Transfer",
      description: "Scan QR code to pay",
      icon: "🏦"
    },
    {
      id: "cod",
      name: "Cash on Delivery (COD)",
      description: "Pay with cash when you receive your order",
      icon: "💵"
    }
  ];

  return (
    <>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
            <Button
            variant="ghost"
            onClick={() => onNavigate("cart")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Cart</span>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your order</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="email@example.com"
                      required
                      disabled={!!user}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      placeholder="Nguyen Van A"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="0912345678"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="123 Main Street"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="TPHCM"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Free shipping for TPHCM/HCM, {formatCurrency(30000)} for other cities
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Promo Code */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Promo Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!appliedDiscount ? (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Enter promo code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                          disabled={isLoadingCoupon}
                        />
                        <Button
                          onClick={() => handleApplyCoupon()}
                          disabled={isLoadingCoupon || !couponCode.trim()}
                          variant="outline"
                        >
                          {isLoadingCoupon ? "Applying..." : "Apply"}
                        </Button>
                      </div>
                      {couponMessage && (
                        <p className={`text-sm ${couponMessage.includes('✓') ? 'text-green-600' : 'text-red-600'}`}>
                          {couponMessage}
                        </p>
                      )}
                      
                      {/* Available Promo Codes */}
                      {availableCoupons.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            Available Promo Codes:
                          </p>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {availableCoupons.map((coupon) => {
                              const canUse = !coupon.minOrderAmount || subtotal >= coupon.minOrderAmount;
                              const discountText = coupon.discountType === 'percentage'
                                ? `${coupon.percentage}% OFF`
                                : `${formatCurrency(coupon.fixedAmount || 0)} OFF`;
                              
                              return (
                                <div
                                  key={coupon._id}
                                  className={`p-3 border rounded-lg ${
                                    canUse 
                                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 cursor-pointer hover:shadow-md transition-shadow' 
                                      : 'bg-gray-50 border-gray-200 opacity-60'
                                  }`}
                                  onClick={() => {
                                    if (canUse) {
                                      setCouponCode(coupon.code);
                                      handleApplyCoupon(coupon.code);
                                    }
                                  }}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded text-sm">
                                          {coupon.code}
                                        </span>
                                        <span className="font-semibold text-green-600 text-sm">
                                          {discountText}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-700 font-medium">
                                        {coupon.name}
                                      </p>
                                      {coupon.description && (
                                        <p className="text-xs text-gray-600 mt-1">
                                          {coupon.description}
                                        </p>
                                      )}
                                      <div className="flex flex-wrap gap-2 mt-2 text-xs">
                                        {coupon.minOrderAmount && (
                                          <span className={`${canUse ? 'text-gray-600' : 'text-red-600 font-medium'}`}>
                                            Min: {formatCurrency(coupon.minOrderAmount)}
                                          </span>
                                        )}
                                        {coupon.maxDiscountAmount && (
                                          <span className="text-gray-600">
                                            Max discount: {formatCurrency(coupon.maxDiscountAmount)}
                                          </span>
                                        )}
                                        {coupon.expiresAt && (
                                          <span className="text-gray-600">
                                            Expires: {new Date(coupon.expiresAt).toLocaleDateString('vi-VN')}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    {canUse && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="ml-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setCouponCode(coupon.code);
                                          handleApplyCoupon(coupon.code);
                                        }}
                                      >
                                        Apply
                                      </Button>
                                    )}
                                  </div>
                                  {!canUse && coupon.minOrderAmount && (
                                    <p className="text-xs text-red-600 mt-2 font-medium">
                                      Add {formatCurrency(coupon.minOrderAmount - subtotal)} more to use this code
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {isLoadingCoupons && (
                        <p className="text-sm text-gray-500 text-center">Loading available coupons...</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-900">{appliedDiscount.code}</p>
                          <p className="text-sm text-green-700">
                            Discount: {formatCurrency(discountAmount)}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={handleRemoveCoupon}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    {paymentOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <RadioGroupItem value={option.id} id={option.id} />
                        <div className="flex items-center space-x-3 flex-1">
                          <span className="text-2xl">{option.icon}</span>
                          <div>
                            <Label htmlFor={option.id} className="font-medium cursor-pointer">
                              {option.name}
                            </Label>
                            <p className="text-sm text-gray-600">{option.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              {/* Loyalty Points Card */}
              {user && (
                <Card className="mb-4">
                  <CardContent className="p-4">
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-amber-100 rounded-full p-2">
                            <Gift className="h-6 w-6 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-amber-900">
                              Your Loyalty Points
                            </p>
                            <p className="text-lg font-bold text-amber-600">
                              {loyaltyAccount ? loyaltyAccount.totalPoints.toLocaleString() : '0'} pts
                            </p>
                            <p className="text-xs text-amber-700">
                              = {formatCurrency((loyaltyAccount?.totalPoints || 0) * 1000)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              💡 100 pts = {formatCurrency(100000)}
                            </p>
                          </div>
                        </div>
                        {useLoyaltyPoints && loyaltyDiscount > 0 && (
                          <div className="text-right bg-green-50 rounded-lg px-3 py-2">
                            <p className="text-xs text-green-600 font-medium">
                              Discount Applied
                            </p>
                            <p className="text-lg font-bold text-green-600">
                              -{formatCurrency(loyaltyDiscount)}
                            </p>
                            <p className="text-xs text-green-600">
                              ({loyaltyPointsToUse} pts used)
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Use Loyalty Points Section */}
                      {loyaltyAccount && loyaltyAccount.totalPoints > 0 && (
                        <div className="border-t border-amber-200 pt-3 space-y-3">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="useLoyaltyCheckout"
                              checked={useLoyaltyPoints}
                              onCheckedChange={(checked) => {
                                setUseLoyaltyPoints(checked as boolean);
                                if (!checked) {
                                  setLoyaltyPointsToUse(0);
                                } else {
                                  setLoyaltyPointsToUse(Math.min(maxLoyaltyPoints, 100));
                                }
                              }}
                            />
                            <Label htmlFor="useLoyaltyCheckout" className="cursor-pointer text-sm font-medium text-amber-900">
                              Use loyalty points for this order
                            </Label>
                          </div>
                          
                          {useLoyaltyPoints && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top duration-300">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="loyaltySliderCheckout" className="text-sm text-amber-900">
                                  Points to use: <span className="font-bold">{loyaltyPointsToUse}</span> pts
                                </Label>
                                <span className="text-sm font-bold text-green-600">
                                  -{formatCurrency(loyaltyDiscount)}
                                </span>
                              </div>
                              <input
                                id="loyaltySliderCheckout"
                                type="range"
                                min="0"
                                max={maxLoyaltyPoints}
                                step="1"
                                value={loyaltyPointsToUse}
                                onChange={(e) => setLoyaltyPointsToUse(parseInt(e.target.value))}
                                className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                              />
                              <div className="flex justify-between text-xs text-amber-700">
                                <span>0 pts</span>
                                <span>{maxLoyaltyPoints} pts (max)</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items */}
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.book.id} className="flex items-center space-x-3">
                        <div className="w-12 h-16 relative">
                          <ImageWithFallback
                            src={item.book.coverImage}
                            alt={item.book.title}
                            className="w-full h-full object-cover rounded"
                          />
                          <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {item.quantity}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium line-clamp-2">{item.book.title}</h4>
                          <p className="text-xs text-gray-600">{item.book.author}</p>
                        </div>
                        <div className="text-sm font-semibold">
                          {formatCurrency(item.book.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    
                    {appliedDiscount && discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount ({appliedDiscount.code})</span>
                        <span>-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                    
                    {useLoyaltyPoints && loyaltyDiscount > 0 && (
                      <div className="flex justify-between text-sm text-blue-600">
                        <span>Loyalty Points ({loyaltyPointsToUse.toLocaleString()} pts)</span>
                        <span>-{formatCurrency(loyaltyDiscount)}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span className={shippingCost === 0 ? "text-green-600 font-medium" : ""}>
                        {shippingCost === 0 ? "Free" : formatCurrency(shippingCost)}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(total)}</span>
                    </div>
                    
                    {user && earnedPoints > 0 && (
                      <div className="text-xs text-green-600 text-center mt-2 p-2 bg-green-50 rounded">
                        🎁 You'll earn {earnedPoints.toLocaleString()} loyalty points from this order!
                      </div>
                    )}
                  </div>

                  <Button
                      type="submit"
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700"
                      disabled={isSubmitting}>
                       {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>) : (
                          paymentMethod === "bank-transfer" ? "Continue to Payment" : "Place Order")}
                  </Button>

                  <div className="text-xs text-gray-500 text-center">
                    By placing your order, you agree to our Terms of Service and Privacy Policy.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && orderData && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          orderData={orderData}
          onPaymentSuccess={handelPaymentSuccess}
        />
      )}
    </>
  );
}