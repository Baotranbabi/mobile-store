const OpenAI = require("openai");
const Product = require("../models/Product");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const askChatbot = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Vui lòng nhập câu hỏi" });
    }

    const products = await Product.find()
      .select("name brand category price oldPrice stock description")
      .limit(30);

    const productContext = products
      .map((item) => {
        return `Tên: ${item.name}
Thương hiệu: ${item.brand}
Danh mục: ${item.category}
Giá: ${item.price}
Giá cũ: ${item.oldPrice || 0}
Kho: ${item.stock}
Mô tả: ${item.description || "Không có"}`;
      })
      .join("\n---\n");

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5",
      input: [
        {
          role: "system",
          content:
            "Bạn là chatbot tư vấn bán hàng cho website Bảo Trân Mobile. Trả lời bằng tiếng Việt, ngắn gọn, thân thiện. Chỉ tư vấn dựa trên danh sách sản phẩm được cung cấp. Nếu khách hỏi mua hàng, hãy gợi ý sản phẩm phù hợp và nhắc khách thêm vào giỏ hàng hoặc để lại số điện thoại.",
        },
        {
          role: "user",
          content: `Danh sách sản phẩm hiện có:\n${productContext}\n\nCâu hỏi của khách: ${message}`,
        },
      ],
    });

    res.json({
      reply: response.output_text,
      products: [],
    });
  } catch (error) {
    console.log("Lỗi OpenAI chatbot:", error);

    res.status(500).json({
      message: "Lỗi chatbot AI",
      error: error.message,
    });
  }
};

module.exports = { askChatbot };