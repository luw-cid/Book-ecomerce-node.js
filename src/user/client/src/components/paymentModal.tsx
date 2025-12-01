import { useState, useEffect } from "react";
import { X, Copy, CheckCircle, Loader2, Clock, Mail, Download } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { formatCurrency } from "../utils/formatCurrency";
import axios from "axios";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    orderId: string;
    orderNumber: string;
    total: number;
    yourName: string;
    yourEmail: string;
    yourAddress: string;
    yourPhone: string;
  };
  onPaymentSuccess: () => void;
}

interface QRData {
  qrUrl: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  content: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export function PaymentModal({ isOpen, onClose, orderData, onPaymentSuccess }: PaymentModalProps) {
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [countdown, setCountdown] = useState(5 * 60); // 5 minutes
  const [error, setError] = useState("");

  console.log("PaymentModal render - isOpen:", isOpen, "orderData:", orderData);

  useEffect(() => {
    console.log("PaymentModal useEffect - isOpen:", isOpen, "orderData:", orderData);
    if (!isOpen || !orderData?.orderId) {
      console.log("Exiting useEffect early");
      return;
    }

    console.log("Starting QR generation and timers");
    // Generate QR when modal opens
    generateQR();

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-check payment status
    const checkInterval = setInterval(async () => {
      await checkPaymentStatus(true);
    }, 5000); // Check every 5 seconds

    // Cleanup intervals when modal closes
    return () => {
      clearInterval(countdownInterval);
      clearInterval(checkInterval);
    };
  }, [isOpen, orderData.orderId]);

  const generateQR = async () => {
    try {
      setIsLoading(true);
      setError("");

      // VietQR API
      const response = await axios.post(`${API_URL}/payments/generate-qr`, {
        orderId: orderData.orderId
      });

      if (response.data.success) {
        setQrData(response.data.data);
      } else {
          throw new Error(response.data.message || "Failed to generate QR code");
      }
    } catch (err: any) {
      console.error("Error generating QR:", err);
      setError(err.response?.data?.message || err.message || "Failed to generate QR code");
    } finally {
      setIsLoading(false);
    }
  };

  const checkPaymentStatus = async (isAuto = false) => {
    if (!isAuto) setIsChecking(true);
    
    try {
      const response = await axios.post(`${API_URL}/payments/check-status`, {
        orderId: orderData.orderId
      });

      if (response.data.data.paid) {
        setIsCompleted(true);
        // Gọi callback sau 2 giây để user kịp nhìn thấy màn hình success
        setTimeout(() => {
          onPaymentSuccess();
        }, 2000);
      } else if (!isAuto) {
        alert("Payment not received yet. Please try again in a few moments.");
      }
    } catch (err: any) {
      console.error("Error checking payment:", err);
      if (!isAuto) {
        alert(err.response?.data?.message || "Failed to check payment status");
      }
    } finally {
      if (!isAuto) setIsChecking(false);
    }
  };

  const handelCancel = async () => {
    if (confirm('Cancel this order?')) {
      try {
        await axios.post(`${API_URL}/payments/cancel-order`, {
          orderId: orderData.orderId,
          reason: 'User cancelled'
        });
        alert('Order cancelled successfully');
        onClose();
      } catch (error) {
        console.error("Error cancelling order:", error);
        alert('Failed to cancel order');
      }
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  // Success screen after payment confirmed
  if (isCompleted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-[100] flex items-center justify-center p-4" style={{ zIndex: 9999, backdropFilter: 'blur(4px)' }}>
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardContent className="pt-8 pb-6">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Confirmed!</h1>
              <p className="text-gray-600">Thank you for your purchase</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 mb-1">Order Number</div>
              <div className="text-lg font-semibold text-gray-900">{orderData.orderNumber}</div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>Confirmation email will be sent</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Download className="h-4 w-4" />
                <span>Order details saved</span>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              Redirecting to home page...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-[100] flex items-center justify-center p-4" style={{ zIndex: 9999, backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto relative z-[101]">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Payment Information</h2>
            <p className="text-sm text-gray-600">Order: {orderData.orderNumber}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-blue-600">
              <Clock className="h-5 w-5" />
              <span className="font-semibold">{formatTime(countdown)}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handelCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Generating QR code...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-red-500 text-5xl mb-4">❌</div>
              <p className="text-red-600 font-medium">{error}</p>
              <Button onClick={generateQR} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Recipient Info & QR Code */}
              <div className="space-y-6">
                {/* Recipient Information */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="bg-blue-600 rounded-full p-1">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    Your Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-semibold text-gray-900">{orderData.yourName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-semibold text-gray-900">{orderData.yourEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-semibold text-gray-900">{orderData.yourPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Address:</span>
                      <span className="font-semibold text-gray-900">{orderData.yourAddress}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-blue-300">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="text-xl font-bold text-blue-600">
                        {formatCurrency(orderData.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center">
                  <h3 className="font-semibold text-gray-900 mb-3">Scan QR Code to Pay</h3>
                  <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-gray-200">
                    <img 
                      src={qrData?.qrUrl} 
                      alt="QR Code" 
                      className="w-64 h-64"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-3 text-center">
                    Open your banking app and scan this QR code
                  </p>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Payment will be automatically confirmed
                  </p>
                </div>
              </div>

              {/* Right Column - Bank Transfer Details & Actions */}
              <div className="space-y-4">
                {/* Bank Transfer Information */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Or transfer manually:</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                      <div>
                        <div className="text-xs text-gray-600">Bank</div>
                        <div className="font-semibold">{qrData?.bankName}</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                      <div>
                        <div className="text-xs text-gray-600">Account Number</div>
                        <div className="font-semibold text-lg">{qrData?.accountNumber}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(qrData?.accountNumber || '')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded border">
                      <div>
                        <div className="text-xs text-gray-600">Account Name</div>
                        <div className="font-semibold">{qrData?.accountName}</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded border border-blue-200">
                      <div>
                        <div className="text-xs text-blue-600">Amount</div>
                        <div className="text-xl font-bold text-blue-600">
                          {formatCurrency(qrData?.amount || 0)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(qrData?.amount.toString() || '')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded border border-yellow-200">
                      <div className="flex-1">
                        <div className="text-xs text-yellow-700">Transfer Content</div>
                        <div className="font-bold text-yellow-900">
                          {qrData?.content}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(qrData?.content || '')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
                    ⚠️ Please enter the <span className="font-bold">EXACT</span> transfer content for automatic confirmation
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4 border-t">
                  <Button
                    onClick={() => checkPaymentStatus(false)}
                    disabled={isChecking}
                    className="w-full"
                    variant="default"
                  >
                    {isChecking ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        I've Completed the Transfer
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handelCancel}
                    variant="outline"
                    className="w-full text-red-600 hover:bg-red-50"
                  >
                    Cancel Order
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}