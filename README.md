# Bảo Trân Mobile - Website Thương Mại Điện Tử

## 1. Giới thiệu

Bảo Trân Mobile là website thương mại điện tử bán điện thoại và phụ kiện, được xây dựng theo mô hình MERN Stack.

Website được phát triển dựa trên giao diện tham khảo từ website WordPress Bảo Trân Mobile, sau đó chuyển thành mã nguồn ReactJS, NodeJS, ExpressJS và MongoDB để phù hợp với môn Lập trình Web nâng cao.

## 2. Công nghệ sử dụng

### Frontend
- ReactJS
- HTML, CSS, JavaScript
- Axios
- Lucide React

### Backend
- NodeJS
- ExpressJS
- Mongoose
- Dotenv
- CORS
- Nodemailer
- OpenAI API

### Database
- MongoDB Atlas
- MongoDB Compass

## 3. Cấu trúc thư mục

```txt
mobile-store
├── server
│   ├── config
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── seed
│   ├── server.js
│   └── package.json
│
├── client-customer
│   ├── public
│   ├── src
│   └── package.json
│
├── client-admin
│   ├── public
│   ├── src
│   └── package.json
│
└── README.md

4. Chức năng chính
Trang khách hàng
Xem danh sách sản phẩm
Xem chi tiết sản phẩm
Tìm kiếm sản phẩm
Lọc sản phẩm theo thương hiệu, danh mục
Thêm sản phẩm vào giỏ hàng
Chọn số lượng sản phẩm
Đặt hàng
Thanh toán khi nhận hàng
Thanh toán chuyển khoản bằng QR code
Nhận email xác nhận đơn hàng
Chatbot AI tư vấn mua hàng
Xem trang giới thiệu và tin công nghệ
Trang quản trị
Đăng nhập admin
Quản lý sản phẩm
Thêm, sửa, xóa sản phẩm
Ẩn/hiện sản phẩm ở trang người dùng
Quản lý đơn hàng
Cập nhật trạng thái đơn hàng
Xóa đơn hàng
Quản lý khách hàng
Xem thống kê tổng đơn hàng, doanh thu, sản phẩm, khách hàng

5. Cài đặt project
Bước 1: Cài backend
cd D:\Webnangcao\mobile-store\server
npm install
Tạo file .env trong thư mục server:
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/baotranmobile
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5
Chạy backend:
npm.cmd run dev
Backend chạy tại:
http://localhost:5000

Bước 2: Cài frontend khách hàng
cd D:\Webnangcao\mobile-store\client-customer
npm install
npm.cmd start
Trang khách hàng chạy tại:
http://localhost:5173

Bước 3: Cài frontend admin
cd D:\Webnangcao\mobile-store\client-admin
npm install
npm.cmd start
Trang admin chạy tại:
http://localhost:3000

6. API chính
Sản phẩm
GET    /api/products
GET    /api/products?admin=true
GET    /api/products/detail/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
Đơn hàng
GET    /api/orders
POST   /api/orders
PUT    /api/orders/:id/status
DELETE /api/orders/:id
Khách hàng
GET  /api/customers
POST /api/customers
Admin
POST /api/admin/login
Chatbot AI
POST /api/chatbot

7. Database
Database sử dụng MongoDB với các collection chính:
admins
products
categories
orders
customers
Dữ liệu sản phẩm được import từ file CSV xuất từ WooCommerce WordPress.

8. Tài khoản admin mẫu
Email: admin@gmail.com
Password: 123456

9. Hướng deploy online
Thứ tự deploy:
MongoDB Atlas
→ Backend Render/Railway
→ Frontend Customer Vercel/Netlify
→ Frontend Admin Vercel/Netlify
Sau khi deploy backend, cần đổi baseURL trong frontend:
baseURL: "https://your-backend-url.onrender.com/api"

10. Ghi chú

Không đưa file .env lên GitHub.
Khi deploy cần khai báo biến môi trường trên hosting.
Nếu frontend không lấy được dữ liệu, kiểm tra lại backend, MongoDB URI và CORS.
Nếu gửi mail lỗi, kiểm tra Gmail App Password.
Nếu chatbot lỗi, kiểm tra OPENAI_API_KEY.

11. Tác giả

Sinh viên thực hiện: Trương Bảo Trân
Môn học: Lập trình Web nâng cao
Đề tài: Website thương mại điện tử Bảo Trân Mobile