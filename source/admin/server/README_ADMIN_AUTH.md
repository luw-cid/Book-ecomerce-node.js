# Admin Authentication System

Hệ thống xác thực đơn giản dành cho Admin của Book Store.

## 📋 Tính năng

- ✅ Đăng nhập Admin với JWT
- ✅ Middleware kiểm tra quyền admin
- ✅ Script tạo tài khoản admin tự động
- ✅ Script tạo tài khoản admin tùy chỉnh
- ✅ Token hết hạn sau 24 giờ
- ✅ Mã hóa mật khẩu với bcrypt

## 🚀 Cách sử dụng

### 1. Tạo tài khoản Admin mặc định

Chạy lệnh sau để tạo tài khoản admin mặc định:

```bash
npm run seed:admin
```

**Thông tin đăng nhập mặc định:**
- Email: `admin@bookstore.com`
- Password: `Admin@123`

⚠️ **LƯU Ý:** Nên đổi mật khẩu ngay sau khi đăng nhập lần đầu!

### 2. Tạo tài khoản Admin tùy chỉnh

Chạy lệnh sau và làm theo hướng dẫn:

```bash
npm run create:admin
```

Script sẽ hỏi bạn:
- Tên đầy đủ của admin
- Email
- Mật khẩu (tối thiểu 6 ký tự)
- Xác nhận mật khẩu

### 3. Xem danh sách Admin

```bash
npm run list:admins
```

## 📡 API Endpoints

### Đăng nhập Admin
```http
POST /auth/login
Content-Type: application/json

{
  "email": "admin@bookstore.com",
  "password": "Admin@123"
}
```

**Response thành công:**
```json
{
  "success": true,
  "message": "Đăng nhập admin thành công!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d5ec49f1b2c72b8c8e4f1a",
    "name": "Administrator",
    "email": "admin@bookstore.com",
    "admin": true
  }
}
```

### Xem profile Admin
```http
GET /auth/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "60d5ec49f1b2c72b8c8e4f1a",
    "email": "admin@bookstore.com",
    "admin": true
  }
}
```

## 🔐 Bảo mật

### JWT Token
- Token được mã hóa với `JWT_SECRET` trong file `.env`
- Token hết hạn sau 24 giờ
- Token chứa thông tin: `id`, `email`, `admin: true`

### Middleware

**authMiddleware** - Kiểm tra JWT token:
```javascript
const authMiddleware = require('./middlewares/authMiddleware');
router.get('/protected', authMiddleware, controller.someFunction);
```

**adminMiddleware** - Kiểm tra quyền admin:
```javascript
const { adminMiddleware } = require('./middlewares/roleMiddleware');
router.post('/admin-only', authMiddleware, adminMiddleware, controller.create);
```

## 📝 Ví dụ sử dụng trong routes

```javascript
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { adminMiddleware } = require('../middlewares/roleMiddleware');
const productController = require('../controllers/productController');

// Route công khai - không cần đăng nhập
router.get('/products', productController.getAll);

// Route chỉ admin - cần đăng nhập VÀ có quyền admin
router.post('/products', authMiddleware, adminMiddleware, productController.create);
router.put('/products/:id', authMiddleware, adminMiddleware, productController.update);
router.delete('/products/:id', authMiddleware, adminMiddleware, productController.delete);
```

## 🧪 Test API với Postman/Thunder Client

### 1. Đăng nhập Admin
```
POST http://localhost:4000/auth/login
Body (JSON):
{
  "email": "admin@bookstore.com",
  "password": "Admin@123"
}
```

### 2. Copy token từ response

### 3. Gọi API cần authentication
```
GET http://localhost:4000/auth/profile
Headers:
Authorization: Bearer <paste_token_here>
```

## ⚙️ Cấu hình

File `.env` cần có:
```env
JWT_SECRET=my_book-store_jwt_secret
URI_DB=mongodb+srv://...
PORT=4000
```

## 🛠️ Scripts có sẵn

- `npm start` - Chạy server production (port 4000)
- `npm run dev` - Chạy server với nodemon (auto-reload)
- `npm run seed:admin` - Tạo admin mặc định
- `npm run create:admin` - Tạo admin tùy chỉnh (interactive)
- `npm run list:admins` - Xem danh sách tất cả admin

## 📚 Database Schema

### User Model (Admin)
```javascript
{
  fullName: String,     // required
  email: String,        // required, unique
  password: String,     // hashed with bcrypt
  admin: Boolean,       // true cho admin account
  createdAt: Date,
  updatedAt: Date
}
```

## 🔄 Flow đăng nhập Admin

1. Frontend gửi POST request đến `/auth/login` với email và password
2. Backend kiểm tra:
   - Email tồn tại trong DB?
   - User có `admin: true`?
   - Password đúng?
3. Nếu OK, tạo JWT token chứa `{ id, email, admin: true }`
4. Trả về token cho frontend
5. Frontend lưu token (localStorage/sessionStorage)
6. Mỗi request sau gửi token trong header: `Authorization: Bearer <token>`
7. Backend verify token bằng authMiddleware
8. Backend kiểm tra quyền admin bằng adminMiddleware

## ❓ Troubleshooting

### Lỗi "Email đã được sử dụng"
- Admin với email này đã tồn tại
- Dùng email khác hoặc xóa admin cũ trong database

### Lỗi "Token không hợp lệ"
- Token đã hết hạn (24h)
- Token sai định dạng
- JWT_SECRET không khớp
→ Đăng nhập lại để lấy token mới

### Lỗi "Bạn không có quyền truy cập"
- User không có `admin: true` trong database
- Kiểm tra lại thông tin user trong MongoDB

