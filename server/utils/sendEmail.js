const nodemailer = require("nodemailer");

const sendOrderEmail = async (toEmail, order) => {
  if (!toEmail) return;

  const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000,
});

  const itemsHtml = order.items
    ?.map(
      (item) => `
        <li>
          ${item.name} - SL: ${item.quantity} - 
          ${Number(item.price || 0).toLocaleString("vi-VN")}đ
        </li>
      `
    )
    .join("");

  await transporter.sendMail({
    from: `"Bao Tran Mobile" <${process.env.EMAIL_FROM}>`,
    to: toEmail,
    subject: `Xác nhận đơn hàng ${order.orderCode || order._id}`,
    html: `
      <h2>Cảm ơn bạn đã đặt hàng tại Bao Tran Mobile</h2>
      <p><b>Mã đơn hàng:</b> ${order.orderCode || order._id}</p>
      <p><b>Khách hàng:</b> ${order.customerInfo?.fullName || ""}</p>
      <p><b>Số điện thoại:</b> ${order.customerInfo?.phone || ""}</p>
      <p><b>Địa chỉ:</b> ${order.customerInfo?.address || ""}</p>
      <p><b>Thanh toán:</b> ${
        order.paymentMethod === "BANK"
          ? "Chuyển khoản ngân hàng"
          : "Thanh toán khi nhận hàng"
      }</p>

      <h3>Sản phẩm</h3>
      <ul>${itemsHtml}</ul>

      <h3>Tổng tiền: ${Number(order.totalPrice || 0).toLocaleString(
        "vi-VN"
      )}đ</h3>
    `,
  });
};

module.exports = sendOrderEmail;