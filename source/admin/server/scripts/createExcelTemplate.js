// scripts/createExcelTemplate.js
const ExcelJS = require('exceljs');
const path = require('path');

async function createTemplate() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Products');

    // Định nghĩa các cột
    worksheet.columns = [
        { header: 'Tên sản phẩm *', key: 'name', width: 40 },
        { header: 'Tác giả *', key: 'author', width: 25 },
        { header: 'Nhà xuất bản', key: 'publisher', width: 25 },
        { header: 'Mô tả *', key: 'description', width: 50 },
        { header: 'Giá bán *', key: 'price', width: 15 },
        { header: 'Giá gốc', key: 'originalPrice', width: 15 },
        { header: 'Tồn kho', key: 'stock', width: 12 },
        { header: 'Category ID *', key: 'category', width: 25 },
        { header: 'Hình ảnh (URL, phân cách bởi dấu phẩy)', key: 'images', width: 50 },
        { header: 'Tags (phân cách bởi dấu phẩy)', key: 'tags', width: 30 },
        { header: 'Sản phẩm mới (Có/Không)', key: 'newProduct', width: 20 },
        { header: 'Bestseller (Có/Không)', key: 'isBestseller', width: 20 },
        { header: 'Flash Sale (Có/Không)', key: 'isFlashSale', width: 20 },
        { header: 'Đang hoạt động (Có/Không)', key: 'isActive', width: 22 },
    ];

    // Style cho header
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Thêm dữ liệu mẫu
    worksheet.addRow({
        name: 'Đắc Nhân Tâm',
        author: 'Dale Carnegie',
        publisher: 'NXB Tổng Hợp TPHCM',
        description: 'Đắc nhân tâm của Dale Carnegie là quyển sách nổi tiếng nhất',
        price: 120000,
        originalPrice: 150000,
        stock: 100,
        category: '673e0a1b2c3d4e5f6a7b8c9d',
        images: 'https://example.com/dac-nhan-tam.jpg',
        tags: 'kỹ năng sống,bestseller',
        newProduct: 'Không',
        isBestseller: 'Có',
        isFlashSale: 'Không',
        isActive: 'Có'
    });

    worksheet.addRow({
        name: 'Nhà Giả Kim',
        author: 'Paulo Coelho',
        publisher: 'NXB Hội Nhà Văn',
        description: 'Tất cả những trải nghiệm trong chuyến phiêu du',
        price: 85000,
        originalPrice: 100000,
        stock: 150,
        category: '673e0a1b2c3d4e5f6a7b8c9d',
        images: 'https://example.com/nha-gia-kim.jpg',
        tags: 'văn học,bestseller',
        newProduct: 'Không',
        isBestseller: 'Có',
        isFlashSale: 'Không',
        isActive: 'Có'
    });

    // Lưu file
    const filePath = path.join(__dirname, '../data/template-import-products.xlsx');
    await workbook.xlsx.writeFile(filePath);
    console.log('✅ Đã tạo file template:', filePath);
}

createTemplate().catch(console.error);
