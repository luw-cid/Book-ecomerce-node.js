const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const asyncHandle = require('express-async-handler');

/**
 * Payment routes
 */

// Generate QR code for bank transfer (public - không cần auth)
router.post('/generate-qr', asyncHandle(paymentController.generateQRCode));

// Check payment status manually (public)
router.post('/check-status', asyncHandle(paymentController.checkPaymentStatus));

// Sepay webhook (public - Sepay gọi vào)
router.post('/sepay-webhook', asyncHandle(paymentController.handleSepayWebhook));

// 🧪 TEST ENDPOINT - Manually confirm payment (Development only)
router.post('/webhook-test', asyncHandle(paymentController.testWebhook));

module.exports = router;