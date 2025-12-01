import { useState } from "react";
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Card, CardContent } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { type CartItem } from "./ShoppingCart";
import type { PageType } from "../App";
import { formatCurrency } from "../utils/formatCurrency";

interface CartPageProps {
  cartItems: CartItem[];
  onNavigate: (page: PageType) => void;
  onUpdateQuantity: (bookId: string, quantity: number) => void;
  onRemoveItem: (bookId: string) => void;
  isAuthenticated?: boolean;
  userId?: string;
}

export function CartPage({ cartItems, onNavigate, onUpdateQuantity, onRemoveItem }: CartPageProps) {
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());

  const subtotal = cartItems.reduce((sum, item) => sum + (item.book.price * item.quantity), 0);
  
  // Calculate total quantity of all items
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  // Calculate tax (8%)
  const tax = subtotal * 0;
  
  const total = subtotal + tax;

  const handleUpdateQuantity = (bookId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      onRemoveItem(bookId);
      return;
    }
    onUpdateQuantity(bookId, newQuantity);
  };

  const handleRemoveItem = (bookId: string) => {
    onRemoveItem(bookId);
  };

  const handleCheckout = () => {
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
        {cartItems.length > 0 && (
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <ShoppingBag className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900">Shopping Cart</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Review your items and proceed to checkout when ready
                  </p>
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
                            {formatCurrency(item.book.price * item.quantity)}
                          </div>
                          <div className="text-sm text-gray-500">{formatCurrency(item.book.price)} each</div>
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

            {/* Cart Summary */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Cart Summary</h3>
                
                {/* Items Summary */}
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.book.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                      <div className="w-12 h-16 flex-shrink-0">
                        <ImageWithFallback
                          src={item.book.coverImage}
                          alt={item.book.title}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium line-clamp-1 text-gray-900">
                          {item.book.title}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {item.book.author}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-600">
                            Qty: {item.quantity}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {formatCurrency(item.book.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                {/* Price Summary */}
                <div className="space-y-3">
                  <div className="flex justify-between transition-all duration-300">
                    <span className="text-gray-600">Subtotal ({totalQuantity} items)</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>
                  
                  <div className="flex justify-between transition-all duration-300">
                    <span className="text-gray-600">Tax (0%)</span>
                    <span className="font-medium">{formatCurrency(tax)}</span>
                  </div>
                  
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg transition-all duration-300">
                    <span>Total</span>
                    <span className="text-blue-600">{formatCurrency(total)}</span>
                  </div>
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
                    <span>Free returns within 7 days</span>
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
