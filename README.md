# Book E-Commerce Node.js

Hệ thống thương mại điện tử sách được xây dựng theo mô hình monorepo, gồm 2 khu vực tách biệt:

- `user`: giao diện và backend cho khách hàng mua sắm.
- `admin`: giao diện và backend cho quản trị viên.

Backend sử dụng `Node.js`, `Express`, `MongoDB`, `JWT`, `Passport`, `Socket.IO` và các dịch vụ hỗ trợ như email, thanh toán và upload ảnh. Frontend được xây dựng bằng `React + Vite`.

## Tính năng chính

### Khu vực người dùng

- Đăng ký, đăng nhập, đăng xuất.
- Đăng nhập bằng Google.
- Xem danh sách sản phẩm, danh mục và chi tiết sản phẩm.
- Tìm kiếm, lọc, sắp xếp và phân trang sản phẩm.
- Đánh giá, bình luận và cập nhật theo thời gian thực bằng WebSocket.
- Thêm vào giỏ hàng, cập nhật số lượng, xóa sản phẩm.
- Thanh toán cho khách hoặc cho tài khoản đã đăng nhập.
- Áp dụng mã giảm giá.
- Theo dõi đơn hàng, xem lịch sử đơn hàng.
- Gửi email xác nhận và hỗ trợ khôi phục mật khẩu.
- Tích điểm khách hàng thân thiết.
- Tích hợp thanh toán trực tuyến qua SePay.

### Khu vực quản trị

- Đăng nhập admin bằng JWT.
- Dashboard thống kê doanh thu, đơn hàng, người dùng và sản phẩm.
- Quản lý sản phẩm, danh mục, đơn hàng, khách hàng và mã giảm giá.
- Xem danh sách đơn hàng, xem chi tiết và cập nhật trạng thái đơn hàng.
- Tạo admin mặc định hoặc admin tùy chỉnh bằng script.

## Công nghệ sử dụng

- Backend: Node.js, Express, MongoDB, Mongoose.
- Xác thực: JWT, Passport, express-session.
- Realtime: Socket.IO.
- Upload file: Multer.
- Email: Resend hoặc cấu hình email tùy môi trường.
- Thanh toán: SePay.
- Frontend: React, TypeScript, Vite, Tailwind/Radix UI, Recharts, Axios.

## Cấu trúc thư mục

```text
src/
	user/
		server/
		client/
	admin/
		server/
		client/
```

## Yêu cầu hệ thống

- Node.js 18+.
- MongoDB Atlas hoặc MongoDB local.
- npm hoặc trình quản lý gói tương đương.

## Cài đặt

Vì dự án gồm nhiều ứng dụng con, hãy cài dependency riêng cho từng thư mục.

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

## Cấu hình biến môi trường

Tạo file `.env` trong từng backend nếu chưa có và cấu hình tối thiểu như sau:

### `src/user/server/.env`

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

### `src/admin/server/.env`

```env
PORT=4000
URI_DB=mongodb+srv://your_mongo_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5000
NODE_ENV=development
```

### `src/user/client/.env`

```env
VITE_API_URL=http://localhost:3000
```

### `src/admin/client/.env`

```env
VITE_API_URL=http://localhost:4000
```

## Chạy dự án

Mở 4 terminal riêng để chạy 4 ứng dụng con.

### User backend

```bash
cd src/user/server
npm start
```

### User frontend

```bash
cd src/user/client
npm run dev
```

### Admin backend

```bash
cd src/admin/server
npm run dev
```

### Admin frontend

```bash
cd src/admin/client
npm run dev
```

## Cổng mặc định

- User backend: `http://localhost:3000`
- User frontend: `http://localhost:5173`
- Admin backend: `http://localhost:4000`
- Admin frontend: `http://localhost:5000`

## Script hữu ích

### Admin backend

```bash
npm run seed:admin
npm run create:admin
npm run list:admins
```

Thông tin admin mặc định sau khi seed:

- Email: `admin@bookstore.com`
- Password: `Admin@123`

### User backend

- `npm start`: khởi động server.

## Ghi chú

- Nếu chạy local, hãy đảm bảo MongoDB đang hoạt động và các biến môi trường đã được thiết lập đúng.
- Ứng dụng dùng CORS theo từng frontend riêng, vì vậy cần giữ đúng `FRONTEND_URL` và `VITE_API_URL` tương ứng.
- Nếu dùng Google login, phải khai báo đúng `API_URL`, `GOOGLE_CLIENT_ID` và `GOOGLE_CLIENT_SECRET`.
- Nếu dùng thanh toán hoặc email, cần bổ sung đúng khóa dịch vụ tương ứng.

## Tài liệu liên quan

- Hệ thống xác thực admin: [src/admin/server/README_ADMIN_AUTH.md](src/admin/server/README_ADMIN_AUTH.md)
- Hướng dẫn UI admin: [src/admin/client/README.md](src/admin/client/README.md)
- Hướng dẫn UI người dùng: [src/user/client/README.md](src/user/client/README.md)
