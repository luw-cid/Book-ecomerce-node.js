const axios = require('axios');
const crypto = require('crypto');

// Sepay API Configuration
const SEPAY_API_URL = process.env.SEPAY_API_URL || 'https://my.sepay.vn/userapi';
const SEPAY_TOKEN = process.env.SEPAY_TOKEN;
const SEPAY_ACCOUNT_NUMBER = process.env.SEPAY_ACCOUNT_NUMBER;
const SEPAY_ACCOUNT_NAME = process.env.SEPAY_ACCOUNT_NAME;
const SEPAY_BANK_CODE = process.env.SEPAY_BANK_CODE || 'MB';

const generateQRContent = (orderNumber, amount) => {
    const description = `BOOKSTORE ${orderNumber}`;

    // VietQR format
    const qrContent = {
        accountNo: SEPAY_ACCOUNT_NUMBER,
        accountName: SEPAY_ACCOUNT_NAME,
        acqId: SEPAY_BANK_CODE,
        amount: amount,
        addInfo: description,
        format: 'text',
        template: 'compact'
    };

    return qrContent;
};


// generate QR code URL from Sepay
const generateQRCodeURL = async (orderNumber, amount) => {
    try {
        const qrData = generateQRContent(orderNumber, amount);

        const qrUrl = `https://img.vietqr.io/image/${qrData.acqId}-${qrData.accountNo}-${qrData.template}.png?amount=${qrData.amount}&addInfo=${encodeURIComponent(qrData.addInfo)}&accountName=${encodeURIComponent(qrData.accountName)}`;
        
        return {
            qrUrl,
            bankCode: SEPAY_BANK_CODE,
            bankName: getBankName(SEPAY_BANK_CODE),
            accountNumber: SEPAY_ACCOUNT_NUMBER,
            accountName: SEPAY_ACCOUNT_NAME,
            amount: amount,
            content: qrData.addInfo,
            orderNumber: orderNumber
        };
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw error;
    }
};

/**
 * Get bank name from bank code
 */
const getBankName = (bankCode) => {
  const banks = {
    'MB': 'MB Bank (Quân Đội)',
    'VCB': 'Vietcombank',
    'TCB': 'Techcombank',
    'ACB': 'ACB',
    'VPB': 'VPBank',
    'TPB': 'TPBank',
    'STB': 'Sacombank',
    'CTG': 'VietinBank',
    'BID': 'BIDV',
    'AGR': 'Agribank'
  };
  
  return banks[bankCode] || bankCode;
};

/**
 * Check payment status từ Sepay API
 * Sepay sẽ gửi webhook khi có giao dịch mới
 */
const checkPaymentStatus = async (orderNumber, amount) => {
  try {
    if (!SEPAY_TOKEN) {
      console.warn('⚠️ Sepay token not configured - payment check disabled');
      return { 
        paid: false, 
        transaction: null,
        error: 'Sepay token not configured'
      };
    }
    
    console.log('🔍 Checking payment for:', orderNumber, 'Amount:', amount);
    console.log('📡 Sepay API URL:', SEPAY_API_URL);
    
    // Gọi Sepay API để check transactions
    const response = await axios.get(`${SEPAY_API_URL}/transactions/list`, {
      headers: {
        'Authorization': `Bearer ${SEPAY_TOKEN}`,
        'Content-Type': 'application/json'
      },
      params: {
        limit: 50, // Lấy 50 giao dịch gần nhất
        offset: 0
      },
      timeout: 10000 // 10 seconds timeout
    });
    
    console.log('✅ Sepay API response status:', response.status);
    console.log('📊 Response data:', JSON.stringify(response.data, null, 2));
    
    const transactions = response.data.transactions || response.data.data || [];
    
    if (!Array.isArray(transactions)) {
      console.warn('⚠️ Invalid transactions data:', transactions);
      return { 
        paid: false, 
        transaction: null,
        error: 'Invalid transactions data format'
      };
    }
    
    console.log(`📝 Found ${transactions.length} transactions`);
    
    // Tìm giao dịch match với order
    const matchedTransaction = transactions.find(tx => {
      const txContent = tx.transaction_content || tx.content || '';
      const txAmount = parseFloat(tx.amount_in || tx.amount || 0);
      
      console.log(`  💰 TX: ${txContent} | Amount: ${txAmount}`);
      
      // Check nội dung chuyển khoản có chứa order number
      const contentMatch = txContent.toUpperCase().includes(orderNumber.toUpperCase());
      
      // Check số tiền khớp (cho phép sai lệch 1000đ)
      const amountMatch = Math.abs(txAmount - amount) < 1000;
      
      if (contentMatch) {
        console.log(`  ✅ Content match! Amount match: ${amountMatch}`);
      }
      
      return contentMatch && amountMatch;
    });
    
    if (matchedTransaction) {
      console.log('✅ Payment found:', matchedTransaction);
    } else {
      console.log('❌ No matching payment found');
    }
    
    return {
      paid: !!matchedTransaction,
      transaction: matchedTransaction || null
    };
  } catch (error) {
    console.error('❌ Error checking payment status:');
    console.error('  Status:', error.response?.status);
    console.error('  Status Text:', error.response?.statusText);
    console.error('  Data:', error.response?.data);
    console.error('  Message:', error.message);
    
    // Return error info for debugging
    return { 
      paid: false, 
      transaction: null,
      error: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.message,
        data: error.response?.data
      }
    };
  }
};

/**
 * Verify Sepay webhook signature
 */
const verifyWebhookSignature = (payload, signature) => {
  try {
    const webhookSecret = process.env.SEPAY_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.warn('⚠️ Sepay webhook secret not configured');
      return true; // Tạm thời cho qua nếu chưa config
    }
    
    // Generate signature từ payload
    const hash = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return hash === signature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
};

module.exports = {
  generateQRCodeURL,
  checkPaymentStatus,
  verifyWebhookSignature,
  getBankName
};