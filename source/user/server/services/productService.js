const Product = require('../models/productModel');

/**
 * Lấy danh sách sản phẩm với các tùy chọn lọc, sắp xếp và phân trang
 * @param {Object} options - Các tùy chọn để lọc và sắp xếp sản phẩm
 * @param {Object} options.filter - Điều kiện lọc (category, price range, tags, etc.)
 * @param {string} options.searchQuery - Từ khóa tìm kiếm trong tên và mô tả
 * @param {string} options.sortBy - Trường để sắp xếp (price, name, createdAt)
 * @param {string} options.sortOrder - Thứ tự sắp xếp (asc/desc)
 * @param {number} options.page - Số trang
 * @param {number} options.limit - Số sản phẩm trên mỗi trang
 */
async function getProducts({ 
    filter = {}, 
    searchQuery = '', 
    sortBy = 'createdAt', 
    sortOrder = 'desc',
    page = 1, 
    limit = 10,
    priceRange = {}
}) {
    try {
        // Xây dựng query filter
        let query = {};

        // 1. Thêm điều kiện filter cơ bản
        if (filter.category) {
          query.category = filter.category;
        }
        if (filter.tags && filter.tags.length > 0) {
          query.tags = { $in: filter.tags };
        }
        if (filter.isNew !== undefined) {
          query.isNew = filter.isNew;
        }
        if (filter.isBestseller !== undefined) {
          query.isBestseller = filter.isBestseller;
        }
        if (filter.isFlashSale !== undefined) {
          query.isFlashSale = filter.isFlashSale;
        }

        // 2. Thêm điều kiện tìm kiếm theo từ khóa
        if (searchQuery) {
          query.$or = [
              { name: { $regex: searchQuery, $options: 'i' } },
              { description: { $regex: searchQuery, $options: 'i' } }
          ];
        }

        // 3. Thêm điều kiện lọc theo khoảng giá
        if (priceRange.min !== undefined || priceRange.max !== undefined) {
          query.price = {};
          if (priceRange.min !== undefined) {
              query.price.$gte = priceRange.min;
          }
          if (priceRange.max !== undefined) {
              query.price.$lte = priceRange.max;
          }
        }

        // 4. Tính toán skip cho phân trang
        const skip = (page - 1) * limit;

        // 5. Xây dựng sort object
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // 6. Thực hiện query với tất cả điều kiện
        const [products, total] = await Promise.all([
            Product.find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .populate("category")
                .populate("discount"),
            Product.countDocuments(query)
        ]);

        // 7. Trả về kết quả với metadata
        return {
            products,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            sortBy,
            sortOrder,
            filters: filter,
            searchQuery
        };
    } catch (error) {
        throw new Error(`Error getting products: ${error.message}`);
    }
}

/**
 * Lấy chi tiết sản phẩm theo ID
 */

async function getProductById (productId) {
    return await Product.findById(productId)
                        .populate("category")
                        .populate("discount");
}

/**
 * Tìm sản phẩm theo keyword (name, description)
 */
async function searchProducts(keyword, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  // Regex search (case-insensitive)
  const filter = {
    $or: [
      { name: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
    ]
  };

  const products = await Product.find(filter)
    .skip(skip)
    .limit(limit)
    .populate("category")
    .populate("discount");

  const total = await Product.countDocuments(filter);

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Lấy sản phẩm theo tag
 */
async function getProductsByTag(tag, limit = 10) {
  return await Product.find({ tags: tag })
    .limit(limit)
    .populate("category")
    .populate("discount");
}

/**
 * Lấy sản phẩm mới (isNew = true)
 */
async  function getNewProducts (limit = 10) {
    return await Product.find({ isNew: true}).limit(limit);
}

/**
 * Lấy sản phẩm bestseller (isBestseller = true)
 */
async  function getBestSellerProducts (limit = 10) {
    return await Product.find({ isBestseller: true}).limit(limit);
}

/**
 * Lấy sản phẩm flashSale (isFlashSale = true)
 */
async  function getFlashSaleProducts (limit = 10) {
    return await Product.find({ isFlashSale: true}).limit(limit);
}

module.exports = {
    getProducts,
    getProductById,
    searchProducts,
    getProductsByTag,
    getNewProducts,
    getBestSellerProducts,
    getFlashSaleProducts
}