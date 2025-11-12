import { CheckCircle, Mail, Download, Home, Package } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { formatCurrency } from "../utils/formatCurrency";

interface OrderSuccessModalProps {
  isOpen: boolean;
  orderNumber: string;
  total: number;
  paymentMethod: string;
  onContinueShopping: () => void;
}

export function OrderSuccessModal({ 
  isOpen, 
  orderNumber, 
  total, 
  paymentMethod,
  onContinueShopping 
}: OrderSuccessModalProps) {
  if (!isOpen) return null;

  const isCOD = paymentMethod === "Cash on Delivery";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[100] flex items-center justify-center p-4" style={{ zIndex: 9999, backdropFilter: 'blur(4px)' }}>
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardContent className="pt-8 pb-6">
          <div className="mb-6">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isCOD ? 'Order Placed Successfully!' : 'Payment Confirmed!'}
            </h1>
            <p className="text-gray-600">Thank you for your purchase</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-600 mb-1">Order Number</div>
            <div className="text-lg font-semibold text-gray-900">{orderNumber}</div>
            <div className="text-sm text-gray-600 mt-3 mb-1">Total Amount</div>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(total)}</div>
          </div>

          {isCOD ? (
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                <Package className="h-4 w-4 text-yellow-600" />
                <span className="text-yellow-700 font-medium">You will pay when you receive the order</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>Confirmation email sent</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Download className="h-4 w-4" />
                <span>Order details saved</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 bg-green-50 p-3 rounded-lg border border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-700 font-medium">Payment received successfully</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>Confirmation email sent</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Download className="h-4 w-4" />
                <span>Order details saved</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={onContinueShopping} 
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Home className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
