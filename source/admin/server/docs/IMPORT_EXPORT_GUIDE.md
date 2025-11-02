# 📥 Hướng dẫn Import/Export Sản phẩm

## 🔹 Xuất sản phẩm ra Excel

### API Endpoint
```
GET /api/products/export
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Kết quả
- File Excel sẽ tự động download với tên: `products_YYYY-MM-DD.xlsx`
- Chứa tất cả sản phẩm hiện có trong hệ thống
- Bao gồm 17 cột thông tin chi tiết

---

## 🔹 Import sản phẩm từ JSON

### API Endpoint
```
POST /api/products/import
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json
```

### Body Request
```json
{
  "products": [
    {
      "name": "Tên sản phẩm",
      "author": "Tác giả",
      "publisher": "Nhà xuất bản",
      "description": "Mô tả sản phẩm",
      "price": 100000,
      "originalPrice": 120000,
      "stock": 50,
      "category": "CATEGORY_ID",
      "images": ["url1.jpg", "url2.jpg"],
      "tags": ["tag1", "tag2"],
      "newProduct": true,
      "isBestseller": false,
      "isFlashSale": false,
      "isActive": true
    }
  ]
}
```

### Response
```json
{
  "success": true,
  "message": "Import thành công 5/5 sản phẩm",
  "results": {
    "success": [
      { "index": 0, "name": "Sản phẩm 1", "id": "673e..." }
    ],
    "errors": [],
    "total": 5
  }
}
```

---

## 🔹 Import sản phẩm từ Excel

### API Endpoint
```
POST /api/products/import-excel
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: multipart/form-data
```

### Cách gửi request
Sử dụng form-data với key `file` và chọn file Excel (.xlsx hoặc .xls)

### Postman/Thunder Client
1. Chọn method: **POST**
2. URL: `http://localhost:4000/api/products/import-excel`
3. Tab **Headers**: 
   - `Authorization: Bearer YOUR_TOKEN`
4. Tab **Body**: 
   - Chọn **form-data**
   - Key: `file` (type: File)
   - Value: Chọn file Excel

### cURL Example
```bash
curl -X POST http://localhost:4000/api/products/import-excel \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@./data/template-import-products.xlsx"
```

### Response
```json
{
  "success": true,
  "message": "Import thành công 5/5 sản phẩm",
  "results": {
    "success": [...],
    "errors": [],
    "total": 5
  }
}
```

---

## 📋 Template Excel

### Tải template mẫu
File mẫu: `source/admin/server/data/template-import-products.xlsx`

### Cấu trúc file Excel (14 cột)

| Cột | Tên | Bắt buộc | Ví dụ |
|-----|-----|----------|-------|
| 1 | Tên sản phẩm | ✅ | Đắc Nhân Tâm |
| 2 | Tác giả | ✅ | Dale Carnegie |
| 3 | Nhà xuất bản | ❌ | NXB Tổng Hợp TPHCM |
| 4 | Mô tả | ✅ | Sách hay về... |
| 5 | Giá bán | ✅ | 120000 |
| 6 | Giá gốc | ❌ | 150000 |
| 7 | Tồn kho | ❌ | 100 |
| 8 | Category ID | ✅ | 673e0a1b2c3d4e5f6a7b8c9d |
| 9 | Hình ảnh | ❌ | url1.jpg,url2.jpg |
| 10 | Tags | ❌ | kỹ năng sống,bestseller |
| 11 | Sản phẩm mới | ❌ | Có / Không |
| 12 | Bestseller | ❌ | Có / Không |
| 13 | Flash Sale | ❌ | Có / Không |
| 14 | Đang hoạt động | ❌ | Có / Không (mặc định: Có) |

### Lưu ý quan trọng
- **Category ID**: Phải là ID hợp lệ từ collection `categories`
- **Hình ảnh**: Nhiều URL phân cách bằng dấu phẩy
- **Tags**: Nhiều tag phân cách bằng dấu phẩy
- **Boolean**: Dùng "Có" hoặc "Không" (hoặc true/false)
- **Dòng 1**: Là header, sẽ bị bỏ qua khi import
- **Slug**: Tự động tạo từ tên sản phẩm

---

## ⚙️ Tạo lại template

Chạy script để tạo file template mới:
```bash
cd source/admin/server
node scripts/createExcelTemplate.js
```

---

## 🚨 Xử lý lỗi

### Import thành công một phần
- Hệ thống sẽ import những dòng hợp lệ
- Trả về danh sách lỗi chi tiết cho từng dòng bị lỗi

### Các lỗi thường gặp
1. **Category không tồn tại**: Kiểm tra Category ID
2. **Thiếu trường bắt buộc**: name, author, description, price, category
3. **Định dạng file sai**: Chỉ chấp nhận .xlsx, .xls
4. **File quá lớn**: Giới hạn 10MB

---

## 📊 Giới hạn

- **Kích thước file**: Tối đa 10MB
- **Định dạng**: .xlsx, .xls
- **Số lượng**: Không giới hạn (nhưng nên chia nhỏ để dễ xử lý)
