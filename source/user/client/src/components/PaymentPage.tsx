import { useState } from "react";
import { ArrowLeft, CreditCard, Lock, CheckCircle, Download, Mail } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import type { PageType } from "../App";

interface PaymentPageProps {
  onNavigate?: (page: PageType, data?: any) => void;
  checkoutData?: any;
}

export function PaymentPage({ onNavigate, checkoutData }: PaymentPageProps) {
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    return formatted.substring(0, 19);
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);
      setOrderNumber(`BH${Date.now().toString().slice(-6)}`);
    }, 3000);
  };

  const total = checkoutData?.total || 29.99;

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardContent className="pt-8 pb-6">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
              <p className="text-gray-600">Thank you for your purchase</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 mb-1">Order Number</div>
              <div className="text-lg font-semibold text-gray-900">{orderNumber}</div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>Confirmation email sent</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Download className="h-4 w-4" />
                <span>Order details available in your account</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => onNavigate?.("home")} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Continue Shopping
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => alert("Order tracking would be implemented here")}
              >
                Track Your Order
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => onNavigate?.("checkout")}
            className="flex items-center space-x-2"
            disabled={isProcessing}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Checkout</span>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
          <p className="text-gray-600 mt-2">Complete your secure payment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-green-600" />
                  Secure Payment
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">SSL Encrypted</Badge>
                  <Badge variant="secondary" className="text-xs">PCI Compliant</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {checkoutData?.paymentMethod === "credit-card" ? (
                  <form onSubmit={handlePaymentSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cardholderName">Cardholder Name</Label>
                        <Input
                          id="cardholderName"
                          value={paymentData.cardholderName}
                          onChange={(e) => handleInputChange("cardholderName", e.target.value)}
                          placeholder="John Doe"
                          required
                          disabled={isProcessing}
                        />
                      </div>

                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <div className="relative">
                          <Input
                            id="cardNumber"
                            value={formatCardNumber(paymentData.cardNumber)}
                            onChange={(e) => handleInputChange("cardNumber", e.target.value.replace(/\s/g, ''))}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            required
                            disabled={isProcessing}
                            className="pr-12"
                          />
                          <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex space-x-4 mt-2">
                          <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCA0MCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzAwNTFBNSIvPgo8cGF0aCBkPSJNMTYuNSA5LjVIMTQuNVYxNC41SDE2LjVWOS41WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTIyLjUgMTJDMjIuNSAxMC4zNCAyMS4xNiA5IDM5LjUgOUMxNy44NCA5IDE2LjUgMTAuMzQgMTYuNSAxMkMxNi41IDEzLjY2IDE3Ljg0IDE1IDE5LjUgMTVDMjEuMTYgMTUgMjIuNSAxMy42NiAyMi41IDEyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+" alt="Visa" className="h-6" />
                          <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCA0MCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iI0VCMDAxQiIvPgo8Y2lyY2xlIGN4PSIxNSIgY3k9IjEyIiByPSI2IiBmaWxsPSIjRkY1RjAwIi8+CjxjaXJjbGUgY3g9IjI1IiBjeT0iMTIiIHI9IjYiIGZpbGw9IiNGRkY1RjAiLz4KPC9zdmc+" alt="Mastercard" className="h-6" />
                          <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCA0MCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzAwNkZDRiIvPgo8L3N2Zz4=" alt="American Express" className="h-6" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiryDate">Expiry Date</Label>
                          <Input
                            id="expiryDate"
                            value={formatExpiryDate(paymentData.expiryDate)}
                            onChange={(e) => handleInputChange("expiryDate", e.target.value.replace(/\D/g, ''))}
                            placeholder="MM/YY"
                            maxLength={5}
                            required
                            disabled={isProcessing}
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            value={paymentData.cvv}
                            onChange={(e) => handleInputChange("cvv", e.target.value.replace(/\D/g, ''))}
                            placeholder="123"
                            maxLength={4}
                            required
                            disabled={isProcessing}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 text-sm text-blue-700">
                        <Lock className="h-4 w-4" />
                        <span>Your payment information is encrypted and secure</span>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700" 
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Processing Payment...</span>
                        </div>
                      ) : (
                        `Pay $${total.toFixed(2)}`
                      )}
                    </Button>
                  </form>
                ) : checkoutData?.paymentMethod === "paypal" ? (
                  <div className="text-center py-8">
                    <div className="bg-yellow-100 p-6 rounded-lg mb-6">
                      <h3 className="font-semibold mb-2">PayPal Payment</h3>
                      <p className="text-sm text-gray-600">You'll be redirected to PayPal to complete your payment securely.</p>
                    </div>
                    <Button 
                      onClick={() => handlePaymentSubmit({ preventDefault: () => {} } as any)}
                      className="w-full h-12 bg-yellow-500 hover:bg-yellow-600"
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Redirecting..." : "Continue with PayPal"}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-green-100 p-6 rounded-lg mb-6">
                      <h3 className="font-semibold mb-2">Cash on Delivery</h3>
                      <p className="text-sm text-gray-600">You'll pay when you receive your order. No online payment required.</p>
                    </div>
                    <Button 
                      onClick={() => handlePaymentSubmit({ preventDefault: () => {} } as any)}
                      className="w-full h-12 bg-green-600 hover:bg-green-700"
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Confirming Order..." : "Confirm Order"}
                    </Button>
                  </div>
                )}
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
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${(total * 0.9259).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${(total * 0.0741).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Shipping to:</h4>
                  <div className="text-sm text-gray-600">
                    <div>{checkoutData?.formData?.firstName} {checkoutData?.formData?.lastName}</div>
                    <div>{checkoutData?.formData?.address}</div>
                    <div>{checkoutData?.formData?.city}, {checkoutData?.formData?.state} {checkoutData?.formData?.zipCode}</div>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  <p>By completing your purchase you agree to these Terms of Service.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}