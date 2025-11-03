import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, Tag, Gift, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { Card, CardContent } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { type CartItem } from "./ShoppingCart";
import type { PageType } from "../App";
import axios from "axios";

interface CartPageProps {
  cartItems: CartItem[];
  onNavigate: (page: PageType) => void;
  onUpdateQuantity: (bookId: string, quantity: number) => void;
  onRemoveItem: (bookId: string) => void;
  isAuthenticated?: boolean;
  userId?: string;
}

interface DiscountCode {
  _id: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  isActive: boolean;
  expiresAt?: string;
}

interface LoyaltyAccount {
  userId: string;
  totalPoints: number;
  tier: string;
  tierBenefits?: string;
}

const API_URL = 'http://localhost:3000';

export function CartPage({ cartItems, onNavigate, onUpdateQuantity, onRemoveItem, isAuthenticated, userId }: CartPageProps) {
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [loyaltyPointsToUse, setLoyaltyPointsToUse] = useState(0);
  const [loyaltyAccount, setLoyaltyAccount] = useState<LoyaltyAccount | null>(null);
  const [isLoadingCoupon, setIsLoadingCoupon] = useState(false);
  const [isLoadingLoyalty, setIsLoadingLoyalty] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());

  const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  };

  // Fetch loyalty account when user is authenticated
  useEffect(() => {
    if (isAuthenticated && userId) {
      fetchLoyaltyAccount();
    }
  }, [isAuthenticated, userId]);

  // Reset loyalty points when discount changes
  useEffect(() => {
    if (appliedDiscount) {
      setLoyaltyPointsToUse(0);
    }
  }, [appliedDiscount]);

  const fetchLoyaltyAccount = async () => {
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
      // Không hiện lỗi cho user nếu không có loyalty account
    } finally {
      setIsLoadingLoyalty(false);
    }
  };
  
  const subtotal = cartItems.reduce((sum, item) => sum + (item.book.price * item.quantity), 0);
  const shipping = 0; // Free shipping
  
  // Calculate total quantity of all items
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  // Calculate discount amount
  const calculateDiscountAmount = (discount: DiscountCode, amount: number): number => {
    if (!discount) return 0;
    
    // Check minimum purchase requirement
    if (discount.minPurchase && amount < discount.minPurchase) {
      return 0;
    }
    
    if (discount.discountType === 'percentage') {
      const discountAmount = (amount * discount.discountValue) / 100;
      return discount.maxDiscount ? Math.min(discountAmount, discount.maxDiscount) : discountAmount;
    } else {
      // Fixed amount discount
      return Math.min(discount.discountValue, amount);
    }
  };

  const discountAmount = appliedDiscount ? calculateDiscountAmount(appliedDiscount, subtotal) : 0;
  const subtotalAfterDiscount = subtotal - discountAmount;
  
  // Calculate loyalty points discount (1 point = $1)
  const maxLoyaltyPoints = loyaltyAccount ? Math.min(loyaltyAccount.totalPoints, subtotalAfterDiscount) : 0;
  const loyaltyDiscount = loyaltyPointsToUse;
  
  const taxableAmount = subtotalAfterDiscount - loyaltyDiscount;
  const tax = Math.max(0, taxableAmount * 0.08); // 8% tax
  const total = Math.max(0, subtotalAfterDiscount - loyaltyDiscount + shipping + tax);
  const earnedPoints = isAuthenticated ? (total * 0.10) : 0;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage("Please enter a coupon code");
      return;
    }

    try {
      setIsLoadingCoupon(true);
      setCouponMessage("");
      
      const response = await axios.post(`${API_URL}/discounts/validate`, {
        code: couponCode.toUpperCase(),
        orderAmount: subtotal
      });

      if (response.data.success && response.data.discount) {
        const discount = response.data.discount;
        
        // Check minimum purchase requirement
        if (discount.minPurchase && subtotal < discount.minPurchase) {
          setCouponMessage(`Minimum purchase of $${discount.minPurchase} required for this code`);
          setAppliedDiscount(null);
        } else {
          setAppliedDiscount(discount);
          setCouponMessage(`✓ ${discount.description}`);
          setCouponCode("");
        }
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

  const handleUpdateQuantity = async (bookId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      handleRemoveItem(bookId);
      return;
    }

    // Optimistic update
    onUpdateQuantity(bookId, newQuantity);
    
    // If authenticated, sync with backend
    if (isAuthenticated) {
      try {
        const token = getToken();
        await axios.put(
          `${API_URL}/cart/items/${bookId}`,
          { quantity: newQuantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error: any) {
        console.error('Error updating cart item:', error);
        // Revert on error - could add toast notification here
      } finally {
        setUpdatingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(bookId);
          return newSet;
        });
      }
    } else {
      // For guest users, update localStorage
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (bookId: string) => {
    // Set loading state
    setRemovingItems(prev => new Set(prev).add(bookId));

    // Optimistic update
    onRemoveItem(bookId);

    // If authenticated, sync with backend
    if (isAuthenticated) {
      try {
        const token = getToken();
        await axios.delete(`${API_URL}/cart/items/${bookId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error: any) {
        console.error('Error removing cart item:', error);
      } finally {
        setRemovingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(bookId);
          return newSet;
        });
      }
    } else {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookId);
        return newSet;
      });
    }
  };

  const handleUseLoyaltyPoints = (points: number) => {
    if (!loyaltyAccount) return;
    
    const validPoints = Math.min(
      Math.max(0, points),
      maxLoyaltyPoints
    );
    
    setLoyaltyPointsToUse(validPoints);
  };

  const handleCheckout = () => {
    // Prepare checkout data
    const checkoutData = {
      items: cartItems,
      subtotal,
      discount: appliedDiscount ? {
        code: appliedDiscount.code,
        amount: discountAmount,
        type: appliedDiscount.discountType
      } : null,
      loyaltyPointsUsed: loyaltyPointsToUse,
      loyaltyDiscount,
      tax,
      shipping,
      total,
      earnedPoints
    };

    // Store checkout data in sessionStorage for checkout page
    sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    
    // Navigate to checkout
    onNavigate("checkout");
  };

  return (
    <div className="min-h-screen">
      {/* Back Navigation */}
      <div className="bg-white/90 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => onNavigate("home")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Continue Shopping</span>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">
            {totalQuantity} {totalQuantity === 1 ? 'book' : 'books'} ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
          </p>
        </div>

        {/* Guest User Banner - Show if not authenticated */}
        {!isAuthenticated && cartItems.length > 0 && (
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Gift className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900">Sign in to unlock exclusive benefits!</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    • Earn 10% loyalty points on every purchase • Save your cart across devices • Track your orders • Get exclusive discounts
                  </p>
                  <div className="flex space-x-3 mt-3">
                    <Button
                      size="sm"
                      onClick={() => onNavigate("login")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Sign In
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onNavigate("register")}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      Create Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven't added any books to your cart yet.</p>
            <Button 
              onClick={() => onNavigate("home")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.book.id} className="p-6">
                  <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                    {/* Book Image */}
                    <div className="w-full sm:w-24 h-32 flex-shrink-0">
                      <ImageWithFallback
                        src={item.book.coverImage}
                        alt={item.book.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    {/* Book Details */}
                    <div className="flex-1 space-y-2">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{item.book.title}</h3>
                        <p className="text-gray-600">by {item.book.author}</p>
                        <div className="flex items-center space-x-3">
                          <p className="text-sm text-gray-500">{item.book.category}</p>
                          {item.book.variants && item.book.variants.length > 0 && item.book.variants[0].stock !== undefined && (
                            <span className={`text-sm font-medium ${
                              item.book.variants[0].stock > 10 
                                ? 'text-green-600' 
                                : item.book.variants[0].stock > 0 
                                  ? 'text-orange-600' 
                                  : 'text-red-600'
                            }`}>
                              {item.book.variants[0].stock > 0 
                                ? `${item.book.variants[0].stock} in stock` 
                                : 'Out of stock'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.book.id, item.quantity - 1)}
                            disabled={updatingItems.has(item.book.id) || item.quantity <= 1}
                          >
                            {updatingItems.has(item.book.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Minus className="h-4 w-4" />
                            )}
                          </Button>
                          <span className="w-12 text-center font-medium">
                            {updatingItems.has(item.book.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.book.id, item.quantity + 1)}
                            disabled={updatingItems.has(item.book.id)}
                          >
                            {updatingItems.has(item.book.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Plus className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        <div className="text-right">
                          <div className="font-semibold text-lg transition-all duration-300">
                            ${(item.book.price * item.quantity).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">${item.book.price.toFixed(2)} each</div>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-500 self-start"
                      onClick={() => handleRemoveItem(item.book.id)}
                      disabled={removingItems.has(item.book.id)}
                    >
                      {removingItems.has(item.book.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Coupon Code */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Promo Code
                </h3>
                
                {!appliedDiscount ? (
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <Input 
                        placeholder="Enter discount code" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1"
                        disabled={isLoadingCoupon}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleApplyCoupon();
                          }
                        }}
                      />
                      <Button 
                        variant="outline" 
                        onClick={handleApplyCoupon}
                        disabled={isLoadingCoupon || !couponCode.trim()}
                      >
                        {isLoadingCoupon ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Checking...
                          </>
                        ) : (
                          'Apply'
                        )}
                      </Button>
                    </div>
                    {couponMessage && !appliedDiscount && (
                      <div className="flex items-center space-x-2 text-sm text-red-600 animate-in fade-in">
                        <AlertCircle className="h-4 w-4" />
                        <span>{couponMessage}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <div>
                          <span className="font-medium text-green-800">{appliedDiscount.code}</span>
                          <p className="text-sm text-green-600">{appliedDiscount.description}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleRemoveCoupon}>
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </Card>

              {/* Loyalty Points */}
              {isAuthenticated && loyaltyAccount && loyaltyAccount.totalPoints > 0 && (
                <Card className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <Gift className="h-4 w-4 mr-2" />
                    Loyalty Points
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Available Points:</span>
                      <span className="font-medium">{loyaltyAccount.totalPoints.toFixed(2)} pts</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Your Tier:</span>
                      <span className="font-medium capitalize">{loyaltyAccount.tier}</span>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Use Points (1 pt = $1):</label>
                      <Input
                        type="number"
                        min="0"
                        max={maxLoyaltyPoints}
                        step="0.01"
                        value={loyaltyPointsToUse}
                        onChange={(e) => handleUseLoyaltyPoints(parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        disabled={maxLoyaltyPoints === 0}
                      />
                      <div className="flex justify-between items-center">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleUseLoyaltyPoints(maxLoyaltyPoints)}
                          disabled={maxLoyaltyPoints === 0}
                        >
                          Use All ({maxLoyaltyPoints.toFixed(2)})
                        </Button>
                        <span className="text-sm font-medium text-green-600">
                          Save: ${loyaltyDiscount.toFixed(2)}
                        </span>
                      </div>
                      {maxLoyaltyPoints === 0 && (
                        <p className="text-xs text-gray-500">
                          No points available after discount
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              )}

              {/* Order Summary */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between transition-all duration-300">
                    <span className="text-gray-600">Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {appliedDiscount && (
                    <div className="flex justify-between text-green-600 animate-in fade-in slide-in-from-top">
                      <span>Discount ({appliedDiscount.code})</span>
                      <span className="font-medium">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {loyaltyPointsToUse > 0 && (
                    <div className="flex justify-between text-blue-600 transition-all duration-300">
                      <span>Loyalty Points ({loyaltyPointsToUse.toFixed(2)} pts)</span>
                      <span className="font-medium">-${loyaltyDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between transition-all duration-300">
                    <span className="text-gray-600">Tax (8%)</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg transition-all duration-300">
                    <span>Total</span>
                    <span className="text-blue-600">${total.toFixed(2)}</span>
                  </div>
                  
                  {isAuthenticated && earnedPoints > 0 && (
                    <div className="text-sm text-gray-600 pt-2 border-t">
                      <div className="flex items-center space-x-1">
                        <Gift className="h-3 w-3 text-yellow-500" />
                        <span>You'll earn <strong className="text-yellow-600">{earnedPoints.toFixed(2)}</strong> loyalty points from this order!</span>
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full mt-6 h-12 bg-blue-600 hover:bg-blue-700 transition-all"
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0}
                >
                  Proceed to Checkout
                </Button>

                <div className="mt-4 text-center">
                  <Button 
                    variant="link" 
                    onClick={() => onNavigate("home")}
                    className="text-blue-600"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </Card>

              {/* Security Features */}
              <Card className="p-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Free returns within 30 days</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Customer support 24/7</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}