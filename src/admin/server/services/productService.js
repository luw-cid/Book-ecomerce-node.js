// services/productService.js
const Product = require('../models/productModel');
const Category = require('../models/categoryModel'); // Import Category model
const Discount = require('../models/discountModel'); // Import Discount model
const Order = require('../models/orderModel'); // Import Order model để kiểm tra
const ExcelJS = require('exceljs');

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate slug từ tên sản phẩm
 */
const generateSlug = (name) => {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

// ==================== CRUD OPERATIONS ====================

/**
 * CREATE - Tạo sản phẩm mới
 */
const createProduct = async (data) => {
    // Tự động tạo slug nếu không có
    if (!data.slug && data.name) {
        data.slug = generateSlug(data.name);
    }
    
    // Kiểm tra slug đã tồn tại chưa
    const existingProduct = await Product.findOne({ slug: data.slug });
    if (existingProduct) {
        // Thêm timestamp vào slug để tránh trùng
        data.slug = `${data.slug}-${Date.now()}`;
    }
    
    // Đổi tên 'language' thành 'bookLanguage' để tránh conflict với MongoDB reserved keyword
    if (data.language !== undefined) {
        data.bookLanguage = data.language;
        delete data.language;
    }
    
    const product = new Product(data);
    return await product.save();
};

/**
 * READ - Lấy danh sách sản phẩm (có filter và phân trang)
 */
const getProducts = async ({ filter = {}, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' }) => {
    const skip = (page - 1) * limit;
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const products = await Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('category', 'name slug')
        .populate('discount', 'name value type');
        
    const total = await Product.countDocuments(filter);

    return {
        success: true,
        products,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
    };
};

/**
 * READ - Lấy chi tiết sản phẩm theo ID
 */
const getProductById = async (productId) => {
    return await Product.findById(productId)
        .populate('category', 'name slug description')
        .populate('discount', 'name value type startDate endDate');
};

/**
 * UPDATE - Cập nhật sản phẩm
 */
const updateProduct = async (productId, data) => {
    // Nếu update name, tự động update slug
    if (data.name && !data.slug) {
        data.slug = generateSlug(data.name);
        
        // Kiểm tra slug mới có trùng không (trừ chính nó)
        const existingProduct = await Product.findOne({ 
            slug: data.slug, 
            _id: { $ne: productId } 
        });
        if (existingProduct) {
            data.slug = `${data.slug}-${Date.now()}`;
        }
    }
    
    // Đổi tên 'language' thành 'bookLanguage' để tránh conflict với MongoDB reserved keyword
    // 'language' là reserved keyword trong MongoDB và gây conflict với update operations
    if (data.language !== undefined) {
        data.bookLanguage = data.language;
        delete data.language;
    }
    
    // Sử dụng findById + save() thay vì update operations để tránh conflict hoàn toàn
    const product = await Product.findById(productId);
    
    if (!product) {
        throw new Error('Product not found');
    }
    
    // Update tất cả fields
    Object.keys(data).forEach(key => {
        if (data[key] !== undefined) {
            product[key] = data[key];
        }
    });
    
    // Save với validation
    await product.save();
    
    // Return với populate
    return await Product.findById(productId)
        .populate('category discount');
};

/**
 * DELETE - Xóa sản phẩm (hard delete - xóa thật sự khỏi database)
 * Kiểm tra xem sản phẩm có đang được sử dụng trong orders không
 */
const deleteProduct = async (productId) => {
    // Kiểm tra sản phẩm có tồn tại không
    const product = await Product.findById(productId);
    if (!product) {
        throw new Error('Product not found');
    }

    // Kiểm tra xem sản phẩm có đang được sử dụng trong orders không
    const ordersWithProduct = await Order.find({
        'items.product': productId
    }).select('orderNumber orderStatus paymentStatus');

    if (ordersWithProduct.length > 0) {
        // Kiểm tra xem có orders đang pending/processing/shipped không
        const activeOrders = ordersWithProduct.filter(order => 
            order.orderStatus === 'Pending' || 
            order.orderStatus === 'Processing' || 
            order.orderStatus === 'Shipped'
        );

        if (activeOrders.length > 0) {
            // Tạo thông báo chi tiết với danh sách orders
            const orderDetails = activeOrders.map(order => 
                `Order ${order.orderNumber} (${order.orderStatus})`
            ).join(', ');
            
            const errorMessage = 
                `Cannot delete product "${product.name}". ` +
                `This product is being used in ${activeOrders.length} active order(s):\n` +
                `${orderDetails}\n\n` +
                `Please cancel or complete these orders first before deleting the product.`;
            
            throw new Error(errorMessage);
        }

        // Nếu chỉ có orders đã delivered/cancelled, cảnh báo nhưng vẫn cho phép xóa
        const completedOrders = ordersWithProduct.filter(order => 
            order.orderStatus === 'Delivered' || 
            order.orderStatus === 'Cancelled'
        );
        
        if (completedOrders.length > 0) {
            console.warn(
                `⚠️ Warning: Product "${product.name}" is referenced in ${completedOrders.length} completed/cancelled order(s), ` +
                `but proceeding with deletion...`
            );
        }
    }

    // Thực hiện hard delete
    const deletedProduct = await Product.findByIdAndDelete(productId);
    
    if (!deletedProduct) {
        throw new Error('Product not found');
    }

    console.log(`✅ Product "${deletedProduct.name}" (ID: ${productId}) has been permanently deleted.`);
    
    return deletedProduct;
};

// ==================== SEARCH ====================

/**
 * SEARCH - Tìm kiếm sản phẩm theo keyword
 */
const searchProducts = async (keyword, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const filter = {
        $or: [
            { name: { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } },
            { author: { $regex: keyword, $options: 'i' } },
            { publisher: { $regex: keyword, $options: 'i' } },
        ]
    };

    const products = await Product.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .populate('category', 'name slug')
        .populate('discount', 'name value type');

    const total = await Product.countDocuments(filter);

    return {
        success: true,
        products,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
        keyword
    };
};

// ==================== EXPORT/IMPORT ====================

/**
 * EXPORT - Xuất tất cả sản phẩm ra file Excel
 */
const exportProductsToExcel = async () => {
    const products = await Product.find()
        .populate('category', 'name')
        .populate('discount', 'name value type')
        .sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Products');

    // Định nghĩa các cột
    worksheet.columns = [
        { header: 'ID', key: '_id', width: 25 },
        { header: 'Tên sản phẩm', key: 'name', width: 40 },
        { header: 'Slug', key: 'slug', width: 40 },
        { header: 'Tác giả', key: 'author', width: 25 },
        { header: 'Nhà xuất bản', key: 'publisher', width: 25 },
        { header: 'Danh mục', key: 'category', width: 20 },
        { header: 'Giá bán', key: 'price', width: 15 },
        { header: 'Giá gốc', key: 'originalPrice', width: 15 },
        { header: 'Tồn kho', key: 'stock', width: 12 },
        { header: 'Đã bán', key: 'sold', width: 12 },
        { header: 'Đánh giá', key: 'rating', width: 12 },
        { header: 'Số đánh giá', key: 'reviewCount', width: 12 },
        { header: 'Sản phẩm mới', key: 'newProduct', width: 15 },
        { header: 'Bestseller', key: 'isBestseller', width: 15 },
        { header: 'Flash Sale', key: 'isFlashSale', width: 15 },
        { header: 'Đang hoạt động', key: 'isActive', width: 15 },
        { header: 'Ngày tạo', key: 'createdAt', width: 20 },
    ];

    // Style cho header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Thêm dữ liệu
    products.forEach(product => {
        worksheet.addRow({
            _id: product._id.toString(),
            name: product.name,
            slug: product.slug,
            author: product.author,
            publisher: product.publisher || '',
            category: product.category?.name || '',
            price: product.price,
            originalPrice: product.originalPrice || '',
            stock: product.stock,
            sold: product.sold,
            rating: product.rating,
            reviewCount: product.reviewCount,
            newProduct: product.newProduct ? 'Có' : 'Không',
            isBestseller: product.isBestseller ? 'Có' : 'Không',
            isFlashSale: product.isFlashSale ? 'Có' : 'Không',
            isActive: product.isActive ? 'Có' : 'Không',
            createdAt: product.createdAt.toLocaleDateString('vi-VN'),
        });
    });

    // Tạo buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
};

/**
 * IMPORT - Nhập nhiều sản phẩm từ file JSON
 */
const importProductsFromJSON = async (productsData) => {
    const results = {
        success: [],
        errors: [],
        total: productsData.length
    };

    for (let i = 0; i < productsData.length; i++) {
        try {
            const productData = productsData[i];
            
            // Tự động tạo slug nếu không có
            if (!productData.slug && productData.name) {
                productData.slug = generateSlug(productData.name);
            }
            
            // Kiểm tra slug đã tồn tại chưa
            const existingProduct = await Product.findOne({ slug: productData.slug });
            if (existingProduct) {
                // Thêm timestamp vào slug để tránh trùng
                productData.slug = `${productData.slug}-${Date.now()}`;
            }
            
            const product = new Product(productData);
            await product.save();
            
            results.success.push({
                index: i,
                name: product.name,
                id: product._id
            });
        } catch (error) {
            results.errors.push({
                index: i,
                name: productsData[i]?.name || 'Unknown',
                error: error.message
            });
        }
    }

    return {
        success: true,
        message: `Import thành công ${results.success.length}/${results.total} sản phẩm`,
        results
    };
};

/**
 * IMPORT - Nhập nhiều sản phẩm từ file Excel
 */
const importProductsFromExcel = async (filePath) => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const worksheet = workbook.getWorksheet(1); // Lấy sheet đầu tiên
    const productsData = [];
    
    // Bỏ qua dòng header (dòng 1)
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header
        
        const productData = {
            name: row.getCell(1).value,
            author: row.getCell(2).value,
            publisher: row.getCell(3).value,
            description: row.getCell(4).value,
            price: row.getCell(5).value,
            originalPrice: row.getCell(6).value,
            stock: row.getCell(7).value || 0,
            category: row.getCell(8).value, // Category ID
            images: row.getCell(9).value ? row.getCell(9).value.split(',').map(url => url.trim()) : [],
            tags: row.getCell(10).value ? row.getCell(10).value.split(',').map(tag => tag.trim()) : [],
            newProduct: row.getCell(11).value === 'Có' || row.getCell(11).value === true,
            isBestseller: row.getCell(12).value === 'Có' || row.getCell(12).value === true,
            isFlashSale: row.getCell(13).value === 'Có' || row.getCell(13).value === true,
            isActive: row.getCell(14).value === 'Có' || row.getCell(14).value === true || row.getCell(14).value === undefined
        };
        
        // Bỏ qua dòng trống
        if (productData.name) {
            productsData.push(productData);
        }
    });
    
    // Sử dụng lại logic import từ JSON
    return await importProductsFromJSON(productsData);
};

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    searchProducts,
    exportProductsToExcel,
    importProductsFromJSON,
    importProductsFromExcel
};