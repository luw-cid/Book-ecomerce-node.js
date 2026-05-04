# 🚀 Book E-Commerce Node.js

Nền tảng thương mại điện tử sách theo mô hình monorepo, tách riêng `user` và `admin`, bao gồm backend Node.js/Express, frontend React + Vite, xác thực JWT, realtime Socket.IO, upload ảnh, email và thanh toán tích hợp.

## ✨ Tổng Quan Nhanh

| Thành phần | Mô tả |
| --- | --- |
| `src/user` | Giao diện và backend cho khách hàng |
| `src/admin` | Giao diện và backend cho quản trị viên |
| Realtime | Bình luận, đánh giá và cập nhật theo thời gian thực |
| Tích hợp | Google login, Resend, SePay, MongoDB |

## 🎯 Tính Năng Nổi Bật

### 👤 Người dùng

- Đăng ký, đăng nhập, đăng xuất.
- Đăng nhập bằng Google.
- Tìm kiếm, lọc, sắp xếp và phân trang sản phẩm.
- Xem chi tiết sản phẩm, bình luận, đánh giá và realtime updates.
- Thêm vào giỏ hàng, thanh toán cho khách hoặc tài khoản đã đăng nhập.
- Áp dụng mã giảm giá, theo dõi đơn hàng, xem lịch sử đơn hàng.
- Gửi email xác nhận, khôi phục mật khẩu và tích điểm khách hàng thân thiết.
- Thanh toán trực tuyến qua SePay.

### 🛡️ Quản trị

- Đăng nhập admin bằng JWT.
- Dashboard thống kê doanh thu, đơn hàng, người dùng và sản phẩm.
- Quản lý sản phẩm, danh mục, đơn hàng, khách hàng và mã giảm giá.
- Xem chi tiết đơn hàng và cập nhật trạng thái.
- Tạo admin mặc định hoặc admin tùy chỉnh bằng script.

## 🧰 Công Nghệ Sử Dụng

| Nhóm | Công nghệ |
| --- | --- |
| Backend | Node.js, Express, MongoDB, Mongoose |
| Auth | JWT, Passport, express-session |
| Realtime | Socket.IO |
| Upload | Multer |
| Email | Resend |
| Thanh toán | SePay |
| Frontend | React, TypeScript, Vite, Radix UI, Recharts, Axios |

## 📁 Cấu Trúc Dự Án

```text
src/
  user/
    server/
    client/
  admin/
    server/
    client/
```

## ⚙️ Yêu Cầu Hệ Thống

- Node.js 18+.
- MongoDB Atlas hoặc MongoDB local.
- npm hoặc trình quản lý gói tương đương.

## 🧩 Cài Đặt

```bash
cd src/user/server
npm install

cd ../client
npm install

cd ../../admin/server
npm install

cd ../client
npm install
```

## 🔧 Cấu Hình Môi Trường

### 🔹 Backend người dùng: `src/user/server/.env`

```env
PORT=3000
URI_DB=mongodb+srv://your_mongo_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
API_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=onboarding@resend.dev

SEPAY_API_URL=https://my.sepay.vn/userapi
SEPAY_TOKEN=your_sepay_token
SEPAY_ACCOUNT_NUMBER=your_account_number
SEPAY_ACCOUNT_NAME=your_account_name
SEPAY_BANK_CODE=MB
SEPAY_WEBHOOK_SECRET=your_webhook_secret
```

### 🔸 Backend admin: `src/admin/server/.env`

```env
PORT=4000
URI_DB=mongodb+srv://your_mongo_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5000
NODE_ENV=development
```

### 🎨 Frontend người dùng: `src/user/client/.env`

```env
VITE_API_URL=http://localhost:3000
```

### 🎨 Frontend admin: `src/admin/client/.env`

```env
VITE_API_URL=http://localhost:4000
```

## ▶️ Chạy Dự Án

| Ứng dụng | Lệnh | Cổng |
| --- | --- | --- |
| User backend | `cd src/user/server && npm start` | `3000` |
| User frontend | `cd src/user/client && npm run dev` | `5173` |
| Admin backend | `cd src/admin/server && npm run dev` | `4000` |
| Admin frontend | `cd src/admin/client && npm run dev` | `5000` |

## 🧪 Script Hữu Ích

### 🔐 Admin backend

```bash
npm run seed:admin
npm run create:admin
npm run list:admins
```

Tài khoản admin mặc định sau khi seed:

- Email: `admin@bookstore.com`
- Password: `Admin@123`

## 📝 Ghi Chú

- Hãy đảm bảo MongoDB đang hoạt động và các biến môi trường đã được cấu hình đúng.
- CORS được cấu hình riêng cho từng frontend, vì vậy `FRONTEND_URL` và `VITE_API_URL` phải khớp với cổng đang chạy.
- Google login cần `API_URL`, `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET`.
- Thanh toán và email cần các khóa dịch vụ tương ứng.

## 📚 Tài Liệu Liên Quan

- Hệ thống xác thực admin: [src/admin/server/README_ADMIN_AUTH.md](src/admin/server/README_ADMIN_AUTH.md)
- Hướng dẫn UI admin: [src/admin/client/README.md](src/admin/client/README.md)
- Hướng dẫn UI người dùng: [src/user/client/README.md](src/user/client/README.md)
