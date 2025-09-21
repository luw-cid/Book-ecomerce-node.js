const Product = require('../models/productModel');

/**
 * Tạo sản phẩm
 */
async function createProduct (data) {
    const product = new Product(data);
    return await product.save();
};

/**
 * Lấy danh sách sản phẩm (có filter và phân trang)
 */
async function getProducts ({ filter = {}, page = 1, limit = 10}) {
    const skip = (page - 1) * limit;
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
 * Cập nhật sản phẩm
 */
async function updateProduct(productId, data) {
    return await Product.findByIdAndUpdate(productId, data, {new: true });
}
/**
 * Xóa sản phẩm
 */
async function deleteProduct(productId) {
  return await Product.findByIdAndDelete(productId);
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
    createProduct,
    getProducts,
    getProductById,
    searchProducts,
    updateProduct,
    deleteProduct,
    getProductsByTag,
    getNewProducts,
    getBestSellerProducts,
    getFlashSaleProducts
}