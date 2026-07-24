const sendOrderEmail = async (toEmail, order) => {
  if (!toEmail) return;

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

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "Bao Tran Mobile",
        email: process.env.EMAIL_FROM,
      },
      to: [
        {
          email: toEmail,
          name: order.customerInfo?.fullName || "Khách hàng",
        },
      ],
      subject: `Xác nhận đơn hàng ${order.orderCode || order._id}`,
      htmlContent: `
        <h2>Cảm ơn bạn đã đặt hàng tại Bao Tran Mobile</h2>
        <p><b>Mã đơn hàng:</b> ${order.orderCode || order._id}</p>
        <p><b>Khách hàng:</b> ${order.customerInfo?.fullName || ""}</p>
        <p><b>SĐT:</b> ${order.customerInfo?.phone || ""}</p>
        <p><b>Địa chỉ:</b> ${order.customerInfo?.address || ""}</p>
        <p><b>Thanh toán:</b> ${
          order.paymentMethod === "BANK"
            ? "Chuyển khoản ngân hàng"
            : "Thanh toán khi nhận hàng"
        }</p>
        <h3>Sản phẩm</h3>
        <ul>${itemsHtml}</ul>
        <h3>Tổng tiền: ${Number(order.totalPrice || 0).toLocaleString("vi-VN")}đ</h3>
      `,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }
};

module.exports = sendOrderEmail;