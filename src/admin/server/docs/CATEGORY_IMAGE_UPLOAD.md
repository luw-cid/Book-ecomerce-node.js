# Category Image Upload Guide

## Tính năng Upload Hình Ảnh Category

### Backend Setup

#### 1. Middleware Upload
File: `source/admin/server/middlewares/uploadMiddleware.js`

- Hỗ trợ upload hình ảnh từ thiết bị
- Định dạng cho phép: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`
- Kích thước tối đa: 5MB
- Thư mục lưu trữ: `source/admin/server/uploads/images/categories/`

#### 2. API Endpoint
```
POST /categories/upload-image
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body:**
```
FormData {
  image: File
}
```

**Response:**
```json
{
  "success": true,
  "message": "Upload hình ảnh thành công",
  "imageUrl": "/uploads/images/categories/category-1234567890-123456789.jpg",
  "filename": "category-1234567890-123456789.jpg"
}
```

### Frontend Features

#### 1. Upload từ Thiết Bị
- Click vào nút "Upload from device"
- Chọn file hình ảnh từ máy tính
- Hình ảnh sẽ được upload lên server tự động
- Preview hiển thị ngay sau khi upload thành công

#### 2. Nhập URL
- Nhập trực tiếp URL hình ảnh từ internet
- Hỗ trợ preview hình ảnh

#### 3. Quản lý Hình Ảnh
- Xem preview hình ảnh trước khi lưu
- Xóa hình ảnh đã chọn (nút X ở góc trên bên phải)
- Thay đổi hình ảnh bất cứ lúc nào

### Validation

**Backend:**
- Kiểm tra định dạng file
- Kiểm tra kích thước file
- Kiểm tra quyền admin

**Frontend:**
- Validate định dạng file trước khi upload
- Validate kích thước file (max 5MB)
- Hiển thị lỗi chi tiết nếu có

### File Structure
```
source/admin/server/
├── uploads/
│   └── images/
│       └── categories/
│           ├── category-1699000000000-123456789.jpg
│           ├── category-1699000000001-987654321.png
│           └── ...
```

### Static File Serving
Hình ảnh được serve qua URL:
```
http://localhost:4000/uploads/images/categories/{filename}
```

### Security
- Chỉ admin mới được upload
- Validate file type và size
- Tên file được generate unique để tránh trùng lặp
- Không cho phép upload file nguy hiểm

### Usage Example

#### Upload từ thiết bị:
1. Mở dialog "Add New Category" hoặc "Edit Category"
2. Click vào "Upload from device"
3. Chọn file từ máy tính
4. Đợi upload hoàn tất
5. Preview sẽ hiển thị
6. Click "Create Category" hoặc "Update Category"

#### Nhập URL:
1. Mở dialog "Add New Category" hoặc "Edit Category"
2. Nhập URL hình ảnh vào ô "Or enter URL"
3. Preview sẽ hiển thị
4. Click "Create Category" hoặc "Update Category"

### Error Handling

**Common Errors:**
- "Chỉ chấp nhận file hình ảnh (.jpg, .jpeg, .png, .gif, .webp)!" - Sai định dạng file
- "Kích thước file không được vượt quá 5MB" - File quá lớn
- "Vui lòng chọn file hình ảnh" - Không có file được chọn
- "Lỗi khi upload hình ảnh" - Lỗi server

### Notes
- Hình ảnh mặc định sẽ được sử dụng nếu không upload
- Có thể cập nhật hình ảnh bất cứ lúc nào
- Upload mới sẽ thay thế upload cũ
- Hình ảnh được lưu trữ vĩnh viễn trên server
