const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Admin = require("../models/Admin");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    const existedAdmin = await Admin.findOne({
      email: "admin@gmail.com",
    });

    if (existedAdmin) {
      console.log("Admin đã tồn tại");
      process.exit();
    }

    await Admin.create({
      fullName: "Quản trị viên",
      email: "admin@gmail.com",
      password: "123456",
      role: "admin",
    });

    console.log("Tạo admin thành công");
    process.exit();
  })
  .catch((error) => {
    console.log("Lỗi tạo admin:", error.message);
    process.exit(1);
  });