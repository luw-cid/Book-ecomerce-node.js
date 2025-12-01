const Product = require('../models/productModel');
const Category = require('../models/categoryModel');

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
    priceRange = {},
    minRating = null
}) {
    try {
        // Xây dựng query filter
        let query = {};

        // 1. Thêm điều kiện filter cơ bản
        if (filter.category) {
          // Nếu filter.category là tên category (string), tìm category ID trước
          const category = await Category.findOne({ name: filter.category });
          if (category) {
            query.category = category._id;
          } else {
            // Nếu không tìm thấy category, vẫn có thể là ObjectId
            query.category = filter.category;
          }
        }
        if (filter.tags && filter.tags.length > 0) {
          query.tags = { $in: filter.tags };
        }
        if (filter.newProduct !== undefined) {
          query.newProduct = filter.newProduct; // Changed: isNew → newProduct
        }
        if (filter.isBestseller !== undefined) {
          query.isBestseller = filter.isBestseller;
        }
        if (filter.isFlashSale !== undefined) {
          query.isFlashSale = filter.isFlashSale;
        }

        if (filter.publisher) {
            query.publisher = filter.publisher;
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

        if (minRating !== null && minRating > 0) {
            query.rating = { $gte: minRating };
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
                .populate("category"),
                // .populate("discount"),
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
                        .populate("category");
                        // .populate("discount");
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
    .populate("category");
    // .populate("discount");

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
    .populate("category");
    // .populate("discount");
}

/**
 * Lấy sản phẩm mới (newProduct = true)
 */
async  function getNewProducts (limit = 10) {
    return await Product.find({ newProduct: true, isActive: true})
      .limit(limit)
      .populate("category");
      // .populate("discount");
}

/**
 * Lấy sản phẩm bestseller (isBestseller = true)
 */
async  function getBestSellerProducts (limit = 10) {
    return await Product.find({ isBestseller: true, isActive: true})
      .limit(limit)
      .populate("category");
      // .populate("discount");
}

/**
 * Lấy sản phẩm flashSale (isFlashSale = true)
 */
async  function getFlashSaleProducts (limit = 10) {
    return await Product.find({ isFlashSale: true, isActive: true})
      .limit(limit) 
      .populate("category");
      // .populate("discount");
}

/**
 * Tìm kiếm sản phẩm nâng cao
 * @param {Object} searchParams - Tham số tìm kiếm
 */
async function advancedSearch({
    keyword = '',
    category = null,
    author = null,
    publisher = null,
    minPrice = null,
    maxPrice = null,
    minRating = null,
    tags = [],
    newProduct = null,
    isBestseller = null,
    isFlashSale = null,
    inStock = null,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 10
}) {
    const query = { isActive: true };

    // 1. Tìm kiếm theo keyword
    if (keyword && keyword.trim()) {
        query.$or = [
            { name: { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } },
            { author: { $regex: keyword, $options: 'i' } },
            { publisher: { $regex: keyword, $options: 'i' } }
        ];
    }

    // 2. Filter theo category
    if (category) {
      // Nếu category là tên (string), tìm category ID trước
      const categoryDoc = await Category.findOne({ name: category });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        // Nếu không tìm thấy, có thể là ObjectId
        query.category = category;
      }
    }

    // 3. Filter theo author
    if (author) query.author = { $regex: author, $options: 'i' };

    // 4. Filter theo publisher
    if (publisher) query.publisher = { $regex: publisher, $options: 'i' };

    // 5. Filter theo price range
    if (minPrice !== null || maxPrice !== null) {
        query.price = {};
        if (minPrice !== null) query.price.$gte = minPrice;
        if (maxPrice !== null) query.price.$lte = maxPrice;
    }

    // 6. Filter theo rating
    if (minRating !== null) query.rating = { $gte: minRating };

    // 7. Filter theo tags
    if (tags && tags.length > 0) query.tags = { $in: tags };

    // 8. Filter theo flags
    if (newProduct !== null) query.newProduct = newProduct;
    if (isBestseller !== null) query.isBestseller = isBestseller;
    if (isFlashSale !== null) query.isFlashSale = isFlashSale;

    // 9. Filter theo stock
    if (inStock === true) {
        query.stock = { $gt: 0 };
    } else if (inStock === false) {
        query.stock = 0;
    }

    // 10. Sort
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // 11. Pagination
    const skip = (page - 1) * limit;

    // 12. Execute query
    const [products, total] = await Promise.all([
        Product.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .populate('category')
            .select('-__v'),
        Product.countDocuments(query)
    ]);

    return {
        products,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        hasMore: skip + products.length < total
    };
}

/**
 * Gợi ý tìm kiếm (autocomplete)
 */
async function searchSuggestions(keyword, limit = 5) {
    if (!keyword || keyword.trim() === '') {
        return [];
    }

    const products = await Product.find({
        isActive: true,
        $or: [
            { name: { $regex: keyword, $options: 'i' } },
            { author: { $regex: keyword, $options: 'i' } },
            { tags: { $regex: keyword, $options: 'i' } }
        ]
    })
    .select('name author slug')
    .limit(limit);

    return products.map(p => ({
        id: p._id,
        name: p.name,
        author: p.author,
        slug: p.slug
    }));
}

/**
 * Lấy sản phẩm liên quan
 */
async function getRelatedProducts(productId, limit = 4) {
    const product = await Product.findById(productId);
    if (!product) {
        throw new Error('Product not found');
    }

    const relatedProducts = await Product.find({
        _id: { $ne: productId },
        isActive: true,
        $or: [
            { category: product.category },
            { tags: { $in: product.tags } }
        ]
    })
    .limit(limit)
    .populate('category')
    .select('-__v');

    return relatedProducts;
}

/**
 * Lấy sản phẩm theo khoảng giá
 */
async function getProductsByPriceRange(minPrice, maxPrice, limit = 10) {
    const query = {
        isActive: true,
        price: { $gte: minPrice, $lte: maxPrice }
    };

    return await Product.find(query)
        .limit(limit)
        .populate('category')
        .sort({ price: 1 });
}

module.exports = {
    getProducts,
    getProductById,
    searchProducts,
    getProductsByTag,
    getNewProducts,
    getBestSellerProducts,
    getFlashSaleProducts,
    advancedSearch,
    searchSuggestions,
    getRelatedProducts,
    getProductsByPriceRange
}