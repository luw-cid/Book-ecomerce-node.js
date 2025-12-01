# 🧪 Payment System Test Guide

## ✅ Đã sửa các lỗi:

1. ✅ **sepayService.js** - Thiếu khai báo constants (SEPAY_TOKEN, SEPAY_ACCOUNT_NUMBER, etc.)
2. ✅ **sepayService.js** - Sửa tham chiếu process.env thành constants
3. ✅ **orderService.js** - Sửa typo `fullname` → `fullName` và `item.product` → `items.product`
4. ✅ **orderService.js** - Thêm `await` cho `generateOrderNumber()`
5. ✅ **.env** - Sửa comment `//` → `#` và `MBBank` → `MB`
6. ✅ **paymentController.js** - Thêm test webhook endpoint
7. ✅ **paymentRoute.js** - Thêm route `/webhook-test`

---

## 📋 **Backend Payment API Endpoints:**

### **1. Generate QR Code**
```http
POST http://localhost:3000/api/payments/generate-qr
Content-Type: application/json

{
  "orderId": "673092e7cc25a4f26bbbfa61"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "qrUrl": "https://img.vietqr.io/image/MB-0971578966-compact.png?amount=100000&addInfo=BOOKSTORE%20ORD1731234567890&accountName=PHAM%20TIEN%20LUC",
    "bankCode": "MB",
    "bankName": "MB Bank (Quân Đội)",
    "accountNumber": "0971578966",
    "accountName": "PHAM TIEN LUC",
    "amount": 100000,
    "content": "BOOKSTORE ORD1731234567890",
    "orderNumber": "ORD1731234567890"
  }
}
```

---

### **2. Check Payment Status**
```http
POST http://localhost:3000/api/payments/check-status
Content-Type: application/json

{
  "orderId": "673092e7cc25a4f26bbbfa61"
}
```

**Response (Chưa thanh toán):**
```json
{
  "success": true,
  "message": "Payment not found",
  "data": {
    "paid": false,
    "transaction": null
  }
}
```

**Response (Đã thanh toán):**
```json
{
  "success": true,
  "message": "Payment confirmed",
  "data": {
    "paid": true,
    "transaction": {
      "id": 123456,
      "amount_in": 100000,
      "transaction_content": "BOOKSTORE ORD1731234567890"
    }
  }
}
```

---

### **3. 🧪 Test Webhook (Development Only)**
```http
POST http://localhost:3000/api/payments/webhook-test
Content-Type: application/json

{
  "orderNumber": "ORD1731234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment confirmed for order ORD1731234567890",
  "data": {
    "orderNumber": "ORD1731234567890",
    "paymentStatus": "Paid",
    "note": "This is a test webhook - for development only"
  }
}
```

---

### **4. Sepay Webhook (External)**
```http
POST http://localhost:3000/api/payments/sepay-webhook
Content-Type: application/json
X-Sepay-Signature: abc123xyz...

{
  "id": 123456,
  "transaction_date": "2025-11-10 10:30:00",
  "account_number": "0971578966",
  "amount_in": 100000,
  "transaction_content": "BOOKSTORE ORD1731234567890",
  "reference_number": "FT25311012345",
  "bank_brand_name": "MB"
}
```

---

## 🧪 **Testing Workflow:**

### **Scenario 1: Test Full Flow (với mock data)**

#### **Step 1: Create Order**
```bash
# Giả sử bạn đã có order với ID: 673092e7cc25a4f26bbbfa61
```

#### **Step 2: Generate QR Code**
```bash
curl -X POST http://localhost:3000/api/payments/generate-qr \
  -H "Content-Type: application/json" \
  -d '{"orderId":"673092e7cc25a4f26bbbfa61"}'
```

**Expected:**
- ✅ Nhận được QR code URL
- ✅ Order number trong response

#### **Step 3: "Pay" bằng Test Webhook**
```bash
curl -X POST http://localhost:3000/api/payments/webhook-test \
  -H "Content-Type: application/json" \
  -d '{"orderNumber":"ORD1731234567890"}'
```

**Expected:**
- ✅ Order paymentStatus → "Paid"
- ✅ User earn loyalty points (nếu có user)
- ✅ Console log: "✅ TEST: Payment confirmed..."

#### **Step 4: Verify Payment Status**
```bash
curl -X POST http://localhost:3000/api/payments/check-status \
  -H "Content-Type: application/json" \
  -d '{"orderId":"673092e7cc25a4f26bbbfa61"}'
```

**Expected:**
- ✅ Response: `"paid": true`

---

### **Scenario 2: Test với Sepay Webhook thật (cần ngrok)**

#### **Step 1: Start ngrok**
```bash
ngrok http 3000
```

**Copy URL:** `https://abc-123.ngrok-free.app`

#### **Step 2: Configure Sepay Webhook**
- URL: `https://abc-123.ngrok-free.app/api/payments/sepay-webhook`
- Method: POST
- Content-Type: application/json

#### **Step 3: Create Order & Generate QR**
```bash
curl -X POST http://localhost:3000/api/payments/generate-qr \
  -H "Content-Type: application/json" \
  -d '{"orderId":"YOUR_ORDER_ID"}'
```

#### **Step 4: Chuyển khoản thật**
- Mở banking app
- Scan QR code từ step 3
- Nội dung: `BOOKSTORE ORD1731234567890` (từ QR)
- Số tiền: Đúng với order total
- Chuyển khoản

#### **Step 5: Wait for Webhook**
- Sepay sẽ tự động gọi webhook (2-30 giây)
- Check console log:
  ```
  📩 Received Sepay webhook: {...}
  ✅ Payment confirmed for order ORD1731234567890
  ```

#### **Step 6: Verify Order**
```bash
# Check order status in database
# paymentStatus should be "Paid"
```

---

## 🔍 **Debug Checklist:**

### **❌ Lỗi: "Order ID is required"**
**Cause:** Missing `orderId` in request body
**Solution:** 
```json
{
  "orderId": "YOUR_ACTUAL_ORDER_ID"
}
```

### **❌ Lỗi: "Order not found"**
**Cause:** Invalid order ID
**Solution:** Check order ID trong database MongoDB

### **❌ Lỗi: "Order already paid"**
**Cause:** Order đã được thanh toán rồi
**Solution:** Test với order khác hoặc reset order status

### **❌ Lỗi: "No order number found in transaction content"**
**Cause:** Webhook payload không có order number
**Solution:** Đảm bảo nội dung chuyển khoản có `ORD1234567890`

### **❌ Lỗi: "Amount mismatch"**
**Cause:** Số tiền chuyển không khớp order total
**Solution:** 
- Cho phép sai lệch < 1000đ
- Check order.total trong database

### **❌ Lỗi: Constants undefined (SEPAY_TOKEN, etc.)**
**Cause:** Đã fix! Constants đã được khai báo đầu file
**Solution:** Restart server

---

## 📊 **Environment Variables:**

Đảm bảo file `.env` có đầy đủ:

```env
# Sepay API Configuration
SEPAY_API_URL=https://my.sepay.vn/userapi
SEPAY_TOKEN=PZDJWDX9PUCVRATPTE3BKE7LQJ4LCXHWILTA8BMD82USYQG6GJKHOUTVSVW0YOQW
SEPAY_ACCOUNT_NUMBER=0971578966
SEPAY_ACCOUNT_NAME=PHAM TIEN LUC
SEPAY_BANK_CODE=MB
SEPAY_WEBHOOK_SECRET=D1254EEF59CBD
```

**Lưu ý:**
- ✅ `SEPAY_BANK_CODE=MB` (không phải `MBBank`)
- ✅ Comments dùng `#` (không phải `//`)
- ✅ Không có dấu cách thừa xung quanh `=`

---

## ✅ **Final Verification:**

### **1. Server Start Successfully**
```bash
cd source/user/server
node app.js
```

**Expected logs:**
```
Server running on port 3000
MongoDB connected successfully
```

### **2. Test Health Check**
```bash
curl http://localhost:3000/api/products
```

**Expected:** List of products

### **3. Test Generate QR**
```bash
curl -X POST http://localhost:3000/api/payments/generate-qr \
  -H "Content-Type: application/json" \
  -d '{"orderId":"YOUR_ORDER_ID"}'
```

**Expected:** QR code data

### **4. Test Webhook (Mock)**
```bash
curl -X POST http://localhost:3000/api/payments/webhook-test \
  -H "Content-Type: application/json" \
  -d '{"orderNumber":"ORD1731234567890"}'
```

**Expected:** Payment confirmed

---

## 🚀 **Next Steps:**

1. ✅ Test all endpoints với Postman/Thunder Client
2. ✅ Tạo order mới từ frontend
3. ✅ Test generate QR code
4. ✅ Test webhook-test endpoint
5. ✅ Setup ngrok nếu muốn test với Sepay thật
6. ✅ Integrate vào frontend checkout flow

---

## 📝 **Notes:**

- **Test Webhook** endpoint chỉ dùng cho development, KHÔNG được deploy lên production
- Với production, phải dùng webhook thật từ Sepay
- QR code được tạo từ VietQR (free service), không cần Sepay API token
- Sepay API token chỉ cần khi check payment status hoặc nhận webhook

---

## ⚠️ **Security Reminders:**

- ❌ KHÔNG commit file `.env` lên git
- ❌ KHÔNG expose test webhook endpoint ra production
- ✅ Verify webhook signature trong production
- ✅ Validate order amount trước khi confirm payment
- ✅ Log tất cả payment transactions
