const sepayService = require('../services/sepayService');
const orderService = require('../services/orderService');
const orderModel = require('../models/orderModel');
const asyncHandler = require('express-async-handler');
const AppError = require('../errors');

/**
 * Generate QR Code for bank transfer
 * POST /api/payment/generate-qr
 */
const generateQRCode = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      throw new AppError('Order ID is required', 400);
    }
    
    // Tìm order
    const order = await orderModel.findById(orderId);
    
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    
    // Check order status
    if (order.paymentStatus === 'Paid') {
      throw new AppError('Order already paid', 400);
    }
    
    // Generate QR code
    const qrData = await sepayService.generateQRCodeURL(
      order.orderNumber,
      order.total
    );
    
    res.status(200).json({
      success: true,
      data: qrData
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Check payment status manually
 * POST /api/payment/check-status
 */
const checkPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    if (!orderId) {
      throw new AppError('Order ID is required', 400);
    }
    
    const order = await orderModel.findById(orderId);
    
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    
    // Check với Sepay API
    const result = await sepayService.checkPaymentStatus(
      order.orderNumber,
      order.total
    );
    
    console.log('💳 Payment check result:', result);
    
    // Kiểm tra nếu có lỗi từ Sepay API
    if (result.error) {
      console.error('⚠️ Sepay API error:', result.error);
      
      // Lỗi 501 = endpoint không tồn tại hoặc không được hỗ trợ
      if (result.error.status === 501) {
        return res.status(200).json({
          success: false,
          message: 'Sepay API endpoint is not available. Please use the test webhook or wait for real webhook notification.',
          data: {
            paid: false,
            error: 'Sepay API returned 501 - Endpoint not implemented',
            suggestion: 'Use POST /api/payments/webhook-test with {"orderNumber": "' + order.orderNumber + '"} to manually confirm payment for testing'
          }
        });
      }
      
      // Các lỗi khác
      return res.status(200).json({
        success: false,
        message: 'Unable to check payment status from Sepay',
        data: {
          paid: false,
          error: result.error.message || 'Unknown error',
          errorDetails: result.error
        }
      });
    }
    
    // Nếu đã thanh toán, update order status
    if (result.paid && order.paymentStatus !== 'Paid') {
      await orderService.updatePaymentStatus(orderId, 'Paid', result.transaction);
      
      res.status(200).json({
        success: true,
        message: 'Payment confirmed',
        data: {
          paid: true,
          transaction: result.transaction
        }
      });
    } else {
      res.status(200).json({
        success: true,
        message: result.paid ? 'Payment already confirmed' : 'Payment not found',
        data: {
          paid: result.paid,
          transaction: result.transaction
        }
      });
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Sepay webhook receiver
 * POST /api/payment/sepay-webhook
 */
const handleSepayWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-sepay-signature'];
    const payload = req.body;
    
    console.log('📩 Received Sepay webhook:', payload);
    
    // Verify signature
    if (!sepayService.verifyWebhookSignature(payload, signature)) {
      console.warn('⚠️ Invalid webhook signature');
      throw new AppError('Invalid signature', 401);
    }
    
    // Extract transaction info
    const {
      transaction_content,
      amount_in,
      transaction_date
    } = payload;
    
    // Tìm order number trong nội dung chuyển khoản
    // Format: "BOOKSTORE ORD1234567890123"
    const orderNumberMatch = transaction_content.match(/ORD\d+/i);
    
    if (!orderNumberMatch) {
      console.warn('⚠️ No order number found in transaction content');
      return res.status(200).json({ success: true }); // Return 200 để Sepay không retry
    }
    
    const orderNumber = orderNumberMatch[0];
    
    // Tìm order
    const order = await orderModel.findOne({ orderNumber });
    
    if (!order) {
      console.warn(`⚠️ Order not found: ${orderNumber}`);
      return res.status(200).json({ success: true });
    }
    
    // Check amount
    const orderAmount = order.total;
    const paidAmount = parseFloat(amount_in);
    
    if (Math.abs(orderAmount - paidAmount) < 1000) {
      // Amount match → Update order status
      if (order.paymentStatus !== 'Paid') {
        // Tạo transaction data object
        const transactionData = {
          transactionId: payload.id || payload.transaction_id,
          transaction_content: transaction_content,
          transaction_date: transaction_date,
          amount_in: paidAmount,
          bank_brand_name: payload.bank_brand_name
        };
        
        await orderService.updatePaymentStatus(order._id, 'Paid', transactionData);
        
        console.log(`✅ Payment confirmed for order ${orderNumber}`);
        
        // TODO: Send confirmation email to customer
      }
    } else {
      console.warn(`⚠️ Amount mismatch: Expected ${orderAmount}, Got ${paidAmount}`);
    }
    
    // Always return 200 để Sepay không retry
    res.status(200).json({
      success: true,
      message: 'Webhook processed'
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    // Return 200 để Sepay không retry
    res.status(200).json({
      success: true,
      message: 'Webhook received'
    });
  }
};

/**
 * Cancel unpaid order
 * POST /api/payments/cancel-order
 */
const cancelOrder = async (req, res) => {
  try {
    const { orderId, reason } = req.body;

    if (!orderId) {
      throw new AppError('Order ID is required', 400);
    }

    const order = await orderModel.findById(orderId);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.paymentStatus === 'Paid') {
      throw new AppError('Cannot cancel paid order', 400);
    }

    // Xóa order khỏi database
    await orderModel.findByIdAndDelete(orderId);
    
    console.log(`🗑️  User cancelled order: ${order.orderNumber} - Reason: ${reason || 'User cancelled'}`);

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: {
        orderId: orderId,
        orderNumber: order.orderNumber
      }
    });
  } catch (error) {
    throw error;
  }
};

/**
 * 🧪 TEST WEBHOOK - Manually trigger payment confirmation (Development only)
 * POST /api/payments/webhook-test
 * Body: { "orderNumber": "ORD1234567890" }
 */
const testWebhook = async (req, res) => {
  try {
    const { orderNumber } = req.body;
    
    if (!orderNumber) {
      throw new AppError('Order number is required', 400);
    }
    
    const order = await orderModel.findOne({ orderNumber });
    
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    
    if (order.paymentStatus === 'Paid') {
      throw new AppError('Order already paid', 400);
    }
    
    // Simulate payment confirmation
    await orderService.updatePaymentStatus(order._id, 'Paid', {
      transactionId: 'TEST-' + Date.now(),
      transaction_content: `BOOKSTORE ${orderNumber}`,
      transaction_date: new Date(),
      amount_in: order.total,
      bank_brand_name: 'MB Bank (Test)'
    });
    
    console.log(`✅ TEST: Payment confirmed for order ${orderNumber}`);
    
    res.status(200).json({
      success: true,
      message: `Payment confirmed for order ${orderNumber}`,
      data: {
        orderNumber,
        paymentStatus: 'Paid',
        note: 'This is a test webhook - for development only'
      }
    });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateQRCode,
  checkPaymentStatus,
  handleSepayWebhook,
  cancelOrder,
  testWebhook
};