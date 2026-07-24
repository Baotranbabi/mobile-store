const Order = require("../models/Order");
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const sendOrderEmail = require("../utils/sendEmail");
const createOrder = async (req, res) => {
  try {
    const { customer, customerInfo, items, paymentMethod } = req.body;

    if (
      !customerInfo?.fullName ||
      !customerInfo?.phone ||
      !customerInfo?.address
    ) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ",
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "Giỏ hàng đang trống",
      });
    }

    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          message: `Không tìm thấy sản phẩm: ${item.name || item.product}`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Sản phẩm ${product.name} chỉ còn ${product.stock} sản phẩm`,
        });
      }

      totalPrice += product.price * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0] || item.image || "",
        price: product.price,
        quantity: item.quantity,
      });
    }

    const customerEmail =
      customerInfo.email || `${customerInfo.phone}@guest.com`;

    const savedCustomer = await Customer.findOneAndUpdate(
      {
        phone: customerInfo.phone,
      },
      {
        fullName: customerInfo.fullName,
        phone: customerInfo.phone,
        email: customerInfo.email || `${customerInfo.phone}@guest.com`,
        address: customerInfo.address,
      },
      {
        upsert: true,
        new: true,
      },
    );
    const orderCode = "DH" + Date.now().toString().slice(-6);

    const order = await Order.create({
      orderCode,
      customer: savedCustomer._id,
      customerInfo,
      items: orderItems,
      totalPrice,
      paymentMethod: paymentMethod || "COD",
    });
    if (customerInfo.email) {
      sendOrderEmail(customerInfo.email, order).catch((emailError) => {
        console.log("Lỗi gửi email:", emailError.message);
      });
    }

    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json({
      message: "Tạo đơn hàng thành công",
      order,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi tạo đơn hàng",
      error: error.message,
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer")
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    res.json({
      message: "Cập nhật trạng thái đơn hàng thành công",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    res.json({ message: "Xóa đơn hàng thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus,
  deleteOrder,
};
