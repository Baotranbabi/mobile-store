const Product = require("../models/Product");

const getProducts = async (req, res) => {
  const { brand, category, search, admin } = req.query;
  const filter = {};

  if (brand) filter.brand = brand;
  if (category) filter.category = category;
  if (search) filter.name = { $regex: search, $options: "i" };
  if (admin !== "true") {
    filter.isVisible = { $ne: false };
  }

  if (admin === "true") {
    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
    return res.json(products);
  }

  const products = await Product.find(filter).lean();

  const hotKeywords = [
    "iphone 17",
    "iphone 16",
    "iphone 15",
    "iphone air",
    "galaxy s25",
    "galaxy s24",
    "oppo find x9",
    "oppo find",
    "xiaomi",
  ];

  const oldKeywords = ["blackberry", "nokia"];

  const getHotScore = (product) => {
    const name = product.name?.toLowerCase() || "";
    const brand = product.brand?.toLowerCase() || "";
    const category = product.category?.toLowerCase() || "";

    let score = 0;

    if (product.isFeatured) score += 100;
    if (product.isNew) score += 80;
    if (product.stock > 0) score += 20;
    if (product.price > 10000000) score += 10;

    hotKeywords.forEach((keyword, index) => {
      if (
        name.includes(keyword) ||
        brand.includes(keyword) ||
        category.includes(keyword)
      ) {
        score += 70 - index * 3;
      }
    });

    oldKeywords.forEach((keyword) => {
      if (
        name.includes(keyword) ||
        brand.includes(keyword) ||
        category.includes(keyword)
      ) {
        score -= 60;
      }
    });

    if (!product.price || product.price <= 0) score -= 80;

    return score;
  };

  products.sort((a, b) => {
    const scoreA = getHotScore(a);
    const scoreB = getHotScore(b);

    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }

    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  res.json(products);
};

const getFeaturedProducts = async (req, res) => {
  const products = await Product.find({ isFeatured: true }).limit(12);
  res.json(products);
};

const getProductBySlug = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
};
const createSlug = (text) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi lấy chi tiết sản phẩm",
      error: error.message,
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const data = req.body;

    const product = await Product.create({
      ...data,
      slug: data.slug || `${createSlug(data.name)}-${Date.now()}`,
      discount:
        data.oldPrice && data.price
          ? Math.round(((data.oldPrice - data.price) / data.oldPrice) * 100)
          : 0,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({
      message: "Thêm sản phẩm thất bại",
      error: error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const data = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...data,
        discount:
          data.oldPrice && data.price
            ? Math.round(((data.oldPrice - data.price) / data.oldPrice) * 100)
            : 0,
      },
      { new: true },
    );

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({
      message: "Cập nhật sản phẩm thất bại",
      error: error.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.json({ message: "Xóa sản phẩm thành công" });
  } catch (error) {
    res.status(500).json({
      message: "Xóa sản phẩm thất bại",
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getFeaturedProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
