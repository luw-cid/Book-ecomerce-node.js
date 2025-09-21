import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, Tag } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { Card, CardContent } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import type { CartItem } from "./ShoppingCart";
import type { PageType } from "../App";

interface CartPageProps {
  cartItems: CartItem[];
  onNavigate?: (page: PageType, data?: any) => void;
  onUpdateQuantity: (bookId: string, quantity: number) => void;
  onRemoveItem: (bookId: string) => void;
}

export function CartPage({ cartItems, onNavigate, onUpdateQuantity, onRemoveItem }: CartPageProps) {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.book.price * item.quantity), 0);
  const shipping = 0; // Free shipping
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const handleApplyCoupon = () => {
    // Placeholder for coupon functionality
    alert("Coupon functionality would be implemented here");
  };

  return (
    <div className="min-h-screen">
      {/* Back Navigation */}
      <div className="bg-white/90 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => onNavigate?.("home")}
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
              onClick={() => onNavigate?.("home")}
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
                <div className="flex space-x-2">
                  <Input placeholder="Enter coupon code" className="flex-1" />
                  <Button variant="outline" onClick={handleApplyCoupon}>
                    Apply
                  </Button>
                </div>
              </Card>

              {/* Order Summary */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
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
                </div>

                <Button 
                  className="w-full mt-6 h-12 bg-blue-600 hover:bg-blue-700"
                  onClick={() => onNavigate?.("checkout")}
                >
                  Proceed to Checkout
                </Button>

                <div className="mt-4 text-center">
                  <Button
                    variant="link"
                    onClick={() => onNavigate?.("home")}
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