import adminApi from "./api/adminApi";
import customerApi from "./api/customerApi";
import { useEffect, useState } from "react";
import orderApi from "./api/orderApi";
import productApi from "./api/productApi";
import "./App.css";

function App() {
  const [customers, setCustomers] = useState([]);
  const [activePage, setActivePage] = useState("orders");

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [productSearchKeyword, setProductSearchKeyword] = useState("");
  const [productSort, setProductSort] = useState("newest");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  const [editingProductId, setEditingProductId] = useState(null);

  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    oldPrice: "",
    stock: "",
    category: "",
    brand: "",
    image: "",
    description: "",
  });
  const [admin, setAdmin] = useState(() => {
    const savedAdmin = localStorage.getItem("admin");
    return savedAdmin ? JSON.parse(savedAdmin) : null;
  });

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const loadOrders = async () => {
    try {
      const response = await orderApi.getAll();
      setOrders(response.data);
    } catch (error) {
      console.log("Lỗi lấy đơn hàng:", error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productApi.getAll();
      setProducts(response.data);
    } catch (error) {
      console.log("Lỗi lấy sản phẩm:", error);
    }
  };
  const loadCustomers = async () => {
    try {
      const response = await customerApi.getAll();
      setCustomers(response.data);
    } catch (error) {
      console.log("Lỗi lấy khách hàng:", error);
    }
  };

  useEffect(() => {
    loadOrders();
    loadProducts();
    loadCustomers();
  }, []);

  const handleChangeStatus = async (id, status) => {
    try {
      await orderApi.updateStatus(id, status);
      alert("Cập nhật trạng thái thành công");
      loadOrders();
    } catch (error) {
      console.log("Lỗi cập nhật trạng thái:", error);
      alert("Cập nhật thất bại");
    }
  };
  const handleDeleteOrder = async (id) => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa đơn hàng này?");

    if (!confirmDelete) return;

    try {
      await orderApi.delete(id);
      alert("Xóa đơn hàng thành công");
      loadOrders();
    } catch (error) {
      console.log("Lỗi xóa đơn hàng:", error);
      alert("Xóa đơn hàng thất bại");
    }
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;

    setProductForm({
      ...productForm,
      [name]: value,
    });
  };

  const resetProductForm = () => {
    setProductForm({
      name: "",
      price: "",
      oldPrice: "",
      stock: "",
      category: "",
      brand: "",
      image: "",
      description: "",
    });

    setEditingProductId(null);
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();

    if (!productForm.name || !productForm.price) {
      alert("Vui lòng nhập tên sản phẩm và giá bán");
      return;
    }

    const data = {
      name: productForm.name,
      price: Number(productForm.price),
      oldPrice: Number(productForm.oldPrice) || 0,
      stock: Number(productForm.stock) || 0,
      category: productForm.category,
      brand: productForm.brand,
      images: productForm.image ? [productForm.image] : [],
      description: productForm.description,
    };

    try {
      if (editingProductId) {
        await productApi.update(editingProductId, data);
        alert("Cập nhật sản phẩm thành công");
      } else {
        await productApi.create(data);
        alert("Thêm sản phẩm thành công");
      }

      resetProductForm();
      loadProducts();
    } catch (error) {
      console.log("Lỗi lưu sản phẩm:", error);
      alert("Lưu sản phẩm thất bại");
    }
  };

  const handleEditProduct = (product) => {
    setEditingProductId(product._id);

    setProductForm({
      name: product.name || "",
      price: product.price || "",
      oldPrice: product.oldPrice || "",
      stock: product.stock || "",
      category: product.category || "",
      brand: product.brand || "",
      image: product.images?.[0] || "",
      description: product.description || "",
    });

    setActivePage("products");
  };

  const handleDeleteProduct = async (id) => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa sản phẩm này?");

    if (!confirmDelete) return;

    try {
      await productApi.delete(id);
      alert("Xóa sản phẩm thành công");
      loadProducts();
    } catch (error) {
      console.log("Lỗi xóa sản phẩm:", error);
      alert("Xóa sản phẩm thất bại");
    }
  };
  const handleToggleProductVisible = async (product) => {
    try {
      await productApi.update(product._id, {
        isVisible: product.isVisible === false ? true : false,
      });

      alert(
        product.isVisible === false
          ? "Đã hiện sản phẩm"
          : "Đã ẩn sản phẩm khỏi trang người dùng",
      );

      loadProducts();
    } catch (error) {
      console.log("Lỗi ẩn/hiện sản phẩm:", error);
      alert("Cập nhật trạng thái hiển thị thất bại");
    }
  };
  const handleLoginChange = (e) => {
    const { name, value } = e.target;

    setLoginForm({
      ...loginForm,
      [name]: value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await adminApi.login(loginForm);

      localStorage.setItem("admin", JSON.stringify(response.data.admin));
      setAdmin(response.data.admin);

      alert("Đăng nhập admin thành công");
    } catch (error) {
      console.log("Lỗi đăng nhập admin:", error);
      alert(error.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin");
    setAdmin(null);
  };
  if (!admin) {
    return (
      <div className="login-page">
        <form className="login-box" onSubmit={handleLogin}>
          <h1>Đăng nhập Admin</h1>

          <input
            type="email"
            name="email"
            placeholder="Email admin"
            value={loginForm.email}
            onChange={handleLoginChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            value={loginForm.password}
            onChange={handleLoginChange}
          />

          <button type="submit">Đăng nhập</button>
        </form>
      </div>
    );
  }
  const filteredOrders =
    orderStatusFilter === "all"
      ? orders
      : orders.filter((order) => order.status === orderStatusFilter);

  const totalOrders = orders.length;

  const totalRevenue = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((total, order) => total + (order.totalPrice || 0), 0);

  const totalProducts = products.length;

  const totalCustomers = customers.length;

  const filteredProducts = products
    .filter((product) => {
      const keyword = productSearchKeyword.toLowerCase();

      return (
        product.name?.toLowerCase().includes(keyword) ||
        product.category?.toLowerCase().includes(keyword) ||
        product.brand?.toLowerCase().includes(keyword)
      );
    })
    .sort((a, b) => {
      if (productSort === "price-asc") {
        return (a.price || 0) - (b.price || 0);
      }

      if (productSort === "price-desc") {
        return (b.price || 0) - (a.price || 0);
      }

      if (productSort === "stock-asc") {
        return (a.stock || 0) - (b.stock || 0);
      }

      if (productSort === "stock-desc") {
        return (b.stock || 0) - (a.stock || 0);
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  return (
    <div className="admin-page">
      <aside className="sidebar">
        <h2>Admin</h2>

        <p className="admin-name">{admin.fullName}</p>

        <button onClick={() => setActivePage("orders")}>Đơn hàng</button>
        <button onClick={() => setActivePage("products")}>Sản phẩm</button>
        <button onClick={() => setActivePage("customers")}>Khách hàng</button>

        <button className="logout-btn" onClick={handleLogout}>
          Đăng xuất
        </button>
      </aside>

      <main className="admin-main">
        {activePage === "orders" && (
          <>
            <h1>Quản lý đơn hàng</h1>
            <div className="dashboard-stats">
              <div className="stat-card">
                <span>Tổng đơn hàng</span>
                <strong>{totalOrders}</strong>
              </div>

              <div className="stat-card">
                <span>Tổng doanh thu</span>
                <strong>{totalRevenue.toLocaleString("vi-VN")}đ</strong>
              </div>

              <div className="stat-card">
                <span>Tổng sản phẩm</span>
                <strong>{totalProducts}</strong>
              </div>

              <div className="stat-card">
                <span>Tổng khách hàng</span>
                <strong>{totalCustomers}</strong>
              </div>
            </div>
            <div className="order-filter">
              <button
                className={orderStatusFilter === "all" ? "active" : ""}
                onClick={() => setOrderStatusFilter("all")}
              >
                Tất cả
              </button>

              <button
                className={orderStatusFilter === "pending" ? "active" : ""}
                onClick={() => setOrderStatusFilter("pending")}
              >
                Chờ xác nhận
              </button>

              <button
                className={orderStatusFilter === "confirmed" ? "active" : ""}
                onClick={() => setOrderStatusFilter("confirmed")}
              >
                Đã xác nhận
              </button>

              <button
                className={orderStatusFilter === "shipping" ? "active" : ""}
                onClick={() => setOrderStatusFilter("shipping")}
              >
                Đang giao
              </button>

              <button
                className={orderStatusFilter === "completed" ? "active" : ""}
                onClick={() => setOrderStatusFilter("completed")}
              >
                Hoàn thành
              </button>

              <button
                className={orderStatusFilter === "cancelled" ? "active" : ""}
                onClick={() => setOrderStatusFilter("cancelled")}
              >
                Đã hủy
              </button>
            </div>

            <div className="order-list">
              {filteredOrders.map((order) => (
                <div className="order-card" key={order._id}>
                  <div className="order-head">
                    <div>
                      <h3>Mã đơn: {order.orderCode || order._id}</h3>
                      <p>Khách hàng: {order.customerInfo?.fullName}</p>
                      <p>SĐT: {order.customerInfo?.phone}</p>
                      <p>Địa chỉ: {order.customerInfo?.address}</p>

                      <p>
                        Thanh toán:{" "}
                        <strong>
                          {order.paymentMethod === "BANK"
                            ? "Chuyển khoản ngân hàng"
                            : "Thanh toán khi nhận hàng"}
                        </strong>
                      </p>
                    </div>

                    <div>
                      <strong>
                        {order.totalPrice?.toLocaleString("vi-VN")}đ
                      </strong>

                      <div className="order-actions">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleChangeStatus(order._id, e.target.value)
                          }
                        >
                          <option value="pending">Chờ xác nhận</option>
                          <option value="confirmed">Đã xác nhận</option>
                          <option value="shipping">Đang giao</option>
                          <option value="completed">Hoàn thành</option>
                          <option value="cancelled">Đã hủy</option>
                        </select>

                        <button
                          className="delete-order-btn"
                          onClick={() => handleDeleteOrder(order._id)}
                        >
                          Xóa đơn
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="order-items">
                    {order.items?.map((item, index) => (
                      <div className="order-item" key={index}>
                        <img
                          src={item.image || "/no-image.png"}
                          alt={item.name}
                        />
                        <span>{item.name}</span>
                        <span>Số lượng: {item.quantity}</span>
                        <strong>{item.price?.toLocaleString("vi-VN")}đ</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activePage === "products" && (
          <>
            <h1>Quản lý sản phẩm</h1>
            <div className="admin-search-box">
              <input
                type="text"
                placeholder="Tìm sản phẩm theo tên, danh mục, thương hiệu..."
                value={productSearchKeyword}
                onChange={(e) => setProductSearchKeyword(e.target.value)}
              />
              <select
                value={productSort}
                onChange={(e) => setProductSort(e.target.value)}
              >
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá thấp đến cao</option>
                <option value="price-desc">Giá cao đến thấp</option>
                <option value="stock-asc">Tồn kho thấp</option>
                <option value="stock-desc">Tồn kho cao</option>
              </select>

              {productSearchKeyword && (
                <button
                  type="button"
                  onClick={() => setProductSearchKeyword("")}
                >
                  Xóa tìm kiếm
                </button>
              )}
            </div>

            <form className="product-form" onSubmit={handleSubmitProduct}>
              <input
                name="name"
                placeholder="Tên sản phẩm"
                value={productForm.name}
                onChange={handleProductChange}
              />

              <input
                name="price"
                placeholder="Giá bán"
                value={productForm.price}
                onChange={handleProductChange}
              />

              <input
                name="oldPrice"
                placeholder="Giá cũ"
                value={productForm.oldPrice}
                onChange={handleProductChange}
              />

              <input
                name="stock"
                placeholder="Số lượng tồn kho"
                value={productForm.stock}
                onChange={handleProductChange}
              />

              <input
                name="category"
                placeholder="Danh mục"
                value={productForm.category}
                onChange={handleProductChange}
              />

              <input
                name="brand"
                placeholder="Thương hiệu"
                value={productForm.brand}
                onChange={handleProductChange}
              />

              <input
                name="image"
                placeholder="Link hình ảnh"
                value={productForm.image}
                onChange={handleProductChange}
              />

              <textarea
                name="description"
                placeholder="Mô tả sản phẩm"
                value={productForm.description}
                onChange={handleProductChange}
              />

              <button type="submit">
                {editingProductId ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}
              </button>

              {editingProductId && (
                <button type="button" onClick={resetProductForm}>
                  Hủy sửa
                </button>
              )}
            </form>

            <div className="product-table">
              {filteredProducts.length === 0 && (
                <p className="empty-text">Không tìm thấy sản phẩm phù hợp.</p>
              )}
              {filteredProducts.map((product) => (
                <div className="admin-product-row" key={product._id}>
                  <img
                    src={product.images?.[0] || "/no-image.png"}
                    alt={product.name}
                  />

                  <div>
                    <h3>{product.name}</h3>
                    <p>{product.price?.toLocaleString("vi-VN")}đ</p>
                    <p>Kho: {product.stock}</p>
                    <p>Danh mục: {product.category}</p>
                    <p>
                      Trạng thái:{" "}
                      <strong
                        style={{
                          color: product.isVisible === false ? "red" : "green",
                        }}
                      >
                        {product.isVisible === false ? "Đang ẩn" : "Đang hiện"}
                      </strong>
                    </p>
                  </div>

                  <div className="product-actions">
                    <button onClick={() => handleEditProduct(product)}>
                      Sửa
                    </button>

                    <button onClick={() => handleToggleProductVisible(product)}>
                      {product.isVisible === false ? "Hiện" : "Ẩn"}
                    </button>

                    <button onClick={() => handleDeleteProduct(product._id)}>
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activePage === "customers" && (
          <>
            <h1>Quản lý khách hàng</h1>

            <div className="customer-list">
              {customers.map((customer) => (
                <div className="customer-card" key={customer._id}>
                  <h3>{customer.fullName}</h3>
                  <p>SĐT: {customer.phone}</p>
                  <p>Email: {customer.email || "Chưa có"}</p>
                  <p>Địa chỉ: {customer.address}</p>
                  <p>
                    Ngày tạo:{" "}
                    {customer.createdAt
                      ? new Date(customer.createdAt).toLocaleDateString("vi-VN")
                      : "Chưa có"}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
