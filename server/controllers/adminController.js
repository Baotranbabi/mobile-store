const Admin = require("../models/Admin");

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ message: "Email admin không tồn tại" });
    }

    if (admin.password !== password) {
      return res.status(401).json({ message: "Sai mật khẩu admin" });
    }

    res.json({
      message: "Đăng nhập admin thành công",
      admin: {
        _id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};

module.exports = {
  loginAdmin,
};