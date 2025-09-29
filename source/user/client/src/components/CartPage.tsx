import { useState } from "react";
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, Tag, Gift, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { Card, CardContent } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { CartItem } from "./ShoppingCart";
import { validateDiscountCode, calculateDiscount, DiscountCode } from "../data/discountCodes";
import { getLoyaltyAccount, getPointsValue } from "../data/loyaltyPoints";
import type { PageType } from "../App";

interface CartPageProps {
  cartItems: CartItem[];
  onNavigate: (page: PageType) => void;
  onUpdateQuantity: (bookId: string, quantity: number) => void;
  onRemoveItem: (bookId: string) => void;
  isAuthenticated?: boolean;
  userId?: string;
}

export function CartPage({ cartItems, onNavigate, onUpdateQuantity, onRemoveItem, isAuthenticated, userId }: CartPageProps) {
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [loyaltyPointsToUse, setLoyaltyPointsToUse] = useState(0);
  
  const subtotal = cartItems.reduce((sum, item) => sum + (item.book.price * item.quantity), 0);
  const shipping = 0; // Free shipping
  
  // Calculate discount
  const discountAmount = appliedDiscount ? calculateDiscount(appliedDiscount, subtotal) : 0;
  const subtotalAfterDiscount = subtotal - discountAmount;
  
  // Calculate loyalty points discount
  const loyaltyAccount = isAuthenticated && userId ? getLoyaltyAccount(userId) : null;
  const maxLoyaltyPoints = loyaltyAccount ? Math.min(loyaltyAccount.totalPoints, subtotalAfterDiscount) : 0;
  const loyaltyDiscount = getPointsValue(loyaltyPointsToUse);
  
  const taxableAmount = subtotalAfterDiscount - loyaltyDiscount;
  const tax = Math.max(0, taxableAmount * 0.08); // 8% tax
  const total = Math.max(0, subtotalAfterDiscount - loyaltyDiscount + shipping + tax);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponMessage("Please enter a coupon code");
      return;
    }

    const validation = validateDiscountCode(couponCode);
    
    if (validation.isValid && validation.discount) {
      setAppliedDiscount(validation.discount);
      setCouponMessage(validation.message);
      setCouponCode("");
    } else {
      setAppliedDiscount(null);
      setCouponMessage(validation.message);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedDiscount(null);
    setCouponMessage("");
    setCouponCode("");
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
          <p className="text-gray-600 mt-2">{cartItems.length} items in your cart</p>
        </div>

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
                        <p className="text-sm text-gray-500">{item.book.category}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onUpdateQuantity(item.book.id, Math.max(0, item.quantity - 1))}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onUpdateQuantity(item.book.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <div className="font-semibold text-lg">${(item.book.price * item.quantity).toFixed(2)}</div>
                          <div className="text-sm text-gray-500">${item.book.price.toFixed(2)} each</div>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-red-500 self-start"
                      onClick={() => onRemoveItem(item.book.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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
                        placeholder="Enter 5-character code" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        maxLength={5}
                        className="flex-1" 
                      />
                      <Button variant="outline" onClick={handleApplyCoupon}>
                        Apply
                      </Button>
                    </div>
                    {couponMessage && (
                      <div className={`flex items-center space-x-2 text-sm ${
                        appliedDiscount ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {appliedDiscount ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
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
                      <span className="font-medium">{loyaltyAccount.totalPoints.toFixed(2)} pts ($1 = 1 pt)</span>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Use Points:</label>
                      <Input
                        type="number"
                        min="0"
                        max={maxLoyaltyPoints}
                        step="0.01"
                        value={loyaltyPointsToUse}
                        onChange={(e) => setLoyaltyPointsToUse(Math.min(maxLoyaltyPoints, Math.max(0, parseFloat(e.target.value) || 0)))}
                        placeholder="0.00"
                      />
                      <div className="flex justify-between">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setLoyaltyPointsToUse(maxLoyaltyPoints)}
                        >
                          Use All
                        </Button>
                        <span className="text-sm text-gray-600">
                          Save: ${loyaltyDiscount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Order Summary */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {appliedDiscount && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({appliedDiscount.code})</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {loyaltyPointsToUse > 0 && (
                    <div className="flex justify-between text-blue-600">
                      <span>Loyalty Points ({loyaltyPointsToUse.toFixed(2)} pts)</span>
                      <span>-${loyaltyDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  
                  {isAuthenticated && (
                    <div className="text-sm text-gray-600 pt-2 border-t">
                      <div className="flex items-center space-x-1">
                        <Gift className="h-3 w-3" />
                        <span>You'll earn {(total * 0.10).toFixed(2)} loyalty points from this order!</span>
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full mt-6 h-12 bg-blue-600 hover:bg-blue-700"
                  onClick={() => onNavigate("checkout")}
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