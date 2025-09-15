import { useState } from "react";
import { ArrowLeft, CreditCard, Truck, MapPin, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Separator } from "./ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { CartItem } from "./ShoppingCart";

interface CheckoutPageProps {
  cartItems: CartItem[];
  onNavigate: (page: string, data?: any) => void;
}

export function CheckoutPage({ cartItems, onNavigate }: CheckoutPageProps) {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US"
  });

  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("credit-card");

  const subtotal = cartItems.reduce((sum, item) => sum + (item.book.price * item.quantity), 0);
  const tax = subtotal * 0.08;
  const shippingCost = deliveryMethod === "express" ? 15.99 : 0;
  const total = subtotal + tax + shippingCost;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate("payment", { formData, deliveryMethod, paymentMethod, total });
  };

  const deliveryOptions = [
    {
      id: "standard",
      name: "Standard Delivery",
      description: "5-7 business days",
      price: "Free",
      icon: Truck
    },
    {
      id: "express",
      name: "Express Delivery",
      description: "2-3 business days",
      price: "$15.99",
      icon: Clock
    }
  ];

  const paymentOptions = [
    {
      id: "credit-card",
      name: "Credit Card",
      description: "Visa, Mastercard, American Express",
      icon: CreditCard
    },
    {
      id: "paypal",
      name: "PayPal",
      description: "Pay with your PayPal account",
      icon: "💳"
    },
    {
      id: "cod",
      name: "Cash on Delivery",
      description: "Pay when you receive your order",
      icon: "💵"
    }
  ];

  return (
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
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        placeholder="John"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+1 (555) 123-4567"
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
                        placeholder="New York"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AL">Alabama</SelectItem>
                          <SelectItem value="CA">California</SelectItem>
                          <SelectItem value="FL">Florida</SelectItem>
                          <SelectItem value="NY">New York</SelectItem>
                          <SelectItem value="TX">Texas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange("zipCode", e.target.value)}
                        placeholder="10001"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod}>
                    {deliveryOptions.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <div key={option.id} className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <RadioGroupItem value={option.id} id={option.id} />
                          <div className="flex items-center space-x-3 flex-1">
                            <IconComponent className="h-5 w-5 text-blue-600" />
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <Label htmlFor={option.id} className="font-medium cursor-pointer">
                                  {option.name}
                                </Label>
                                <span className="font-semibold text-blue-600">{option.price}</span>
                              </div>
                              <p className="text-sm text-gray-600">{option.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </RadioGroup>
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
                          <span className="text-2xl">{typeof option.icon === 'string' ? option.icon : <CreditCard className="h-5 w-5" />}</span>
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
                          ${(item.book.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Price Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>{shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700">
                    Continue to Payment
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
  );
}