const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Brand = require("../models/Brand");

dotenv.config();

const csvPath =
  process.argv[2] ||
  path.join("D:", "Webnangcao", "dulieudoan", "wc-product-export-7-7-2026-1783418582701.csv");

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      value += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(value);
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }

  const headers = rows.shift();
  return rows.map((cells) =>
    headers.reduce((item, header, index) => {
      item[header.trim()] = (cells[index] || "").trim();
      return item;
    }, {})
  );
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toNumber(value) {
  const number = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(number) ? number : 0;
}

function getBrand(name, categoryText) {
  const text = `${name} ${categoryText}`.toLowerCase();
  if (text.includes("iphone") || text.includes("ipad") || text.includes("apple")) return "Apple";
  if (text.includes("samsung") || text.includes("galaxy")) return "Samsung";
  if (text.includes("oppo")) return "OPPO";
  if (text.includes("xiaomi") || text.includes("redmi")) return "Xiaomi";
  if (text.includes("blackberry")) return "Blackberry";
  if (text.includes("huawei")) return "Huawei";
  return "Khác";
}

function firstCategory(categoryText) {
  return String(categoryText || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)[0] || "Điện thoại";
}

async function importProducts() {
  if (!fs.existsSync(csvPath)) {
    throw new Error(`Không tìm thấy file CSV: ${csvPath}`);
  }

  await connectDB();

  const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
  const products = rows
    .filter((row) => row["Tên"])
    .map((row, index) => {
      const name = row["Tên"];
      const category = firstCategory(row["Danh mục"]);
      const oldPrice = toNumber(row["Giá bán thường"]);
      const salePrice = toNumber(row["Giá khuyến mãi"]);
      const price = salePrice || oldPrice || 0;
      const discount =
        oldPrice > 0 && salePrice > 0 && oldPrice > salePrice
          ? Math.round(((oldPrice - salePrice) / oldPrice) * 100)
          : 0;
      const images = String(row["Hình ảnh"] || "")
        .split(",")
        .map((image) => image.trim())
        .filter(Boolean);

      return {
        name,
        slug: `${slugify(name)}-${row["ID"] || index}`,
        brand: getBrand(name, row["Danh mục"]),
        category,
        price,
        oldPrice,
        discount,
        stock: toNumber(row["Kho"]) || 10,
        images,
        description: row["Mô tả ngắn"] || row["Mô tả"] || "Sản phẩm nhập từ WooCommerce.",
        specs: {},
        isFeatured: row["Nhãn nổi bật?"] === "1" || index < 10,
        isNew: index < 10,
      };
    });

  const categories = [...new Set(products.map((product) => product.category))]
    .filter(Boolean)
    .map((name) => ({ name, slug: slugify(name) }));
  const brands = [...new Set(products.map((product) => product.brand))]
    .filter(Boolean)
    .map((name) => ({ name, slug: slugify(name), description: `Sản phẩm thương hiệu ${name}` }));

  await Product.deleteMany();
  await Category.deleteMany();
  await Brand.deleteMany();

  await Product.insertMany(products);
  await Category.insertMany(categories);
  await Brand.insertMany(brands);

  console.log(`Imported ${products.length} products`);
  console.log(`Imported ${categories.length} categories`);
  console.log(`Imported ${brands.length} brands`);
  await mongoose.connection.close();
}

importProducts().catch(async (error) => {
  console.error("Import failed:", error.message);
  await mongoose.connection.close();
  process.exit(1);
});
