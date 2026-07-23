const Customer = require("../models/Customer");

const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, phone, password, address } = req.body;

    const existedCustomer = await Customer.findOne({ email });

    if (existedCustomer) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const customer = await Customer.create({
      fullName,
      email,
      phone,
      password,
      address,
    });

    res.status(201).json({
      message: "Đăng ký thành công",
      customer,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email });

    if (!customer) {
      return res.status(401).json({ message: "Email không tồn tại" });
    }

    if (customer.password !== password) {
      return res.status(401).json({ message: "Sai mật khẩu" });
    }

    res.json({
      message: "Đăng nhập thành công",
      customer,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi lấy danh sách khách hàng",
      error: error.message,
    });
  }
};

const createCustomer = async (req, res) => {
  try {
    const { fullName, phone, email, address } = req.body;

    const customer = await Customer.create({
      fullName,
      phone,
      email,
      address,
    });

    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({
      message: "Lỗi tạo khách hàng",
      error: error.message,
    });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getCustomers,
  createCustomer,
};