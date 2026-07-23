const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Product = require("../models/Product");
const Brand = require("../models/Brand");
const Category = require("../models/Category");
const News = require("../models/News");

dotenv.config();

const imageBase = "https://images.unsplash.com";

const products = [
  {
    name: "iPhone 17 256GB | Chính hãng",
    slug: "iphone-17-256gb-chinh-hang",
    brand: "Apple",
    category: "Điện thoại",
    price: 24999000,
    oldPrice: 31490000,
    discount: 5,
    stock: 15,
    images: [`${imageBase}/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=900&q=80`],
    description: "iPhone chính hãng, bảo hành 12 tháng.",
    specs: { screen: "6.3 inch", ram: "8GB", storage: "256GB", battery: "All day", camera: "48MP" },
    isFeatured: true,
    isNew: true,
  },
  {
    name: "iPhone 17 Pro Max 1TB | Chính hãng",
    slug: "iphone-17-pro-max-1tb-chinh-hang",
    brand: "Apple",
    category: "Điện thoại",
    price: 50590000,
    oldPrice: 52990000,
    discount: 5,
    stock: 8,
    images: [`${imageBase}/photo-1603891128711-11b4b03bb138?auto=format&fit=crop&w=900&q=80`],
    description: "Phiên bản cao cấp, hiệu năng mạnh, camera chuyên nghiệp.",
    specs: { screen: "6.9 inch", ram: "12GB", storage: "1TB", battery: "4800mAh", camera: "48MP" },
    isFeatured: true,
    isNew: true,
  },
  {
    name: "iPhone 16 Pro Max 512GB",
    slug: "iphone-16-pro-max-512gb",
    brand: "Apple",
    category: "Điện thoại",
    price: 36890000,
    oldPrice: 40990000,
    discount: 10,
    stock: 12,
    images: [`${imageBase}/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=80`],
    description: "Máy mới fullbox, bảo hành chính hãng.",
    specs: { screen: "6.7 inch", ram: "8GB", storage: "512GB", battery: "4422mAh", camera: "48MP" },
    isFeatured: true,
  },
  {
    name: "OPPO Find X9 12GB 256GB màu đen",
    slug: "oppo-find-x9-12gb-256gb-mau-den",
    brand: "OPPO",
    category: "Điện thoại",
    price: 18990000,
    oldPrice: 22990000,
    discount: 22,
    stock: 18,
    images: [`${imageBase}/photo-1616348436168-de43ad0db179?auto=format&fit=crop&w=900&q=80`],
    description: "Thiết kế sang trọng, sạc nhanh, camera AI.",
    specs: { screen: "6.8 inch", ram: "12GB", storage: "256GB", battery: "5000mAh", camera: "50MP" },
    isFeatured: true,
  },
  {
    name: "Samsung Galaxy S25 Ultra 12GB 256GB",
    slug: "samsung-galaxy-s25-ultra-12gb-256gb",
    brand: "Samsung",
    category: "Điện thoại",
    price: 27280000,
    oldPrice: 30990000,
    discount: 12,
    stock: 10,
    images: [`${imageBase}/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=900&q=80`],
    description: "Màn hình đẹp, bút S Pen, camera zoom xa.",
    specs: { screen: "6.8 inch", ram: "12GB", storage: "256GB", battery: "5000mAh", camera: "200MP" },
    isFeatured: true,
    isNew: true,
  },
  {
    name: "Apple Watch Series 11 42mm GPS",
    slug: "apple-watch-series-11-42mm-gps",
    brand: "Apple",
    category: "Đồng hồ thông minh",
    price: 10990000,
    oldPrice: 11490000,
    discount: 4,
    stock: 20,
    images: [`${imageBase}/photo-1551816230-ef5deaed4a26?auto=format&fit=crop&w=900&q=80`],
    description: "Đồng hồ thông minh chính hãng Apple Việt Nam.",
    specs: { screen: "42mm", storage: "64GB", battery: "18 giờ" },
    isFeatured: true,
  },
];

const brands = [
  { name: "Apple", slug: "apple", description: "iPhone, iPad, Apple Watch chính hãng." },
  { name: "Samsung", slug: "samsung", description: "Điện thoại và đồng hồ Samsung chính hãng." },
  { name: "OPPO", slug: "oppo", description: "Điện thoại OPPO giá tốt." },
  { name: "Xiaomi", slug: "xiaomi", description: "Điện thoại và phụ kiện Xiaomi." },
];

const categories = [
  { name: "Điện thoại", slug: "dien-thoai" },
  { name: "Đồng hồ thông minh", slug: "dong-ho-thong-minh" },
  { name: "Phụ kiện", slug: "phu-kien" },
  { name: "Dịch vụ sửa chữa", slug: "dich-vu-sua-chua" },
];

const news = [
  {
    title: "Sự thật iPhone 17 Pro Max phai màu sau khi lau bằng khăn ướt",
    slug: "su-that-iphone-17-pro-max-phai-mau",
    thumbnail: `${imageBase}/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80`,
    excerpt: "Những lưu ý khi vệ sinh điện thoại cao cấp để giữ máy bền đẹp.",
    content: "Bài viết phân tích cách vệ sinh điện thoại và bảo quản thiết bị.",
  },
  {
    title: "Huawei Mate X7: điện thoại gập cao cấp mới nhất",
    slug: "huawei-mate-x7-dien-thoai-gap",
    thumbnail: `${imageBase}/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=900&q=80`,
    excerpt: "Xu hướng điện thoại gập tiếp tục phát triển trong năm nay.",
    content: "Bài viết giới thiệu xu hướng điện thoại gập và công nghệ màn hình mới.",
  },
];

const importData = async () => {
  await connectDB();
  await Product.deleteMany();
  await Brand.deleteMany();
  await Category.deleteMany();
  await News.deleteMany();
  await Product.insertMany(products);
  await Brand.insertMany(brands);
  await Category.insertMany(categories);
  await News.insertMany(news);
  console.log("Seed data imported successfully");
  await mongoose.connection.close();
};

importData().catch((error) => {
  console.error(error);
  process.exit(1);
});
