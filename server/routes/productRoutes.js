const express = require("express");

const {
  getProductById,
  getProducts,
  getFeaturedProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router();

router.get("/", getProducts);
router.get("/featured", getFeaturedProducts);

router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.get("/detail/:id", getProductById);

router.get("/:slug", getProductBySlug);

module.exports = router;