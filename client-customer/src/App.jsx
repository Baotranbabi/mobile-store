import React, { useEffect, useRef, useState } from "react";
import productApi from "./api/productApi";
import orderApi from "./api/orderApi";
import "./styles.css";
import customerApi from "./api/customerApi";
import chatbotApi from "./api/chatbotApi";
import {
  Smartphone,
  Watch,
  Newspaper,
  Headphones,
  ShieldCheck,
  Zap,
  Clock3,
  PackageCheck,
  ChevronRight,
  Search,
  PhoneCall,
  Globe2,
} from "lucide-react";

function App() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [dealIndex, setDealIndex] = useState(0);
  const [activePage, setActivePage] = useState("home");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [showPopup, setShowPopup] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "bot",
      text: "Xin chào, Bảo Trân Mobile có thể tư vấn sản phẩm nào cho bạn?",
    },
  ]);
  const audioRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [currentCustomer, setCurrentCustomer] = useState(() => {
    const savedCustomer = localStorage.getItem("currentCustomer");
    return savedCustomer ? JSON.parse(savedCustomer) : null;
  });

  const [authMode, setAuthMode] = useState("login");

  const [authForm, setAuthForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    address: "",
  });
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [checkoutInfo, setCheckoutInfo] = useState({
    gender: "Anh",
    fullName: "",
    phone: "",
    email: "",
    address: "",
    note: "",
    paymentMethod: "COD",
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await productApi.getAll();
        setProducts(response.data);
      } catch (error) {
        console.log("Lỗi lấy sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const closePopup = () => {
    setShowPopup(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };
  const addToCart = (product) => {
    const existedProduct = cart.find((item) => item._id === product._id);

    if (existedProduct) {
      const newCart = cart.map((item) =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      );

      setCart(newCart);
    } else {
      setCart([
        ...cart,
        {
          _id: product._id,
          name: product.name,
          image: product.images?.[0],
          price: product.price,
          quantity: 1,
        },
      ]);
    }

    alert("Đã thêm sản phẩm vào giỏ hàng");
  };
  const addDetailToCart = () => {
    if (!selectedProduct) return;

    const existedProduct = cart.find(
      (item) => item._id === selectedProduct._id,
    );

    if (existedProduct) {
      const newCart = cart.map((item) =>
        item._id === selectedProduct._id
          ? { ...item, quantity: item.quantity + detailQuantity }
          : item,
      );

      setCart(newCart);
    } else {
      setCart([
        ...cart,
        {
          _id: selectedProduct._id,
          name: selectedProduct.name,
          image: selectedProduct.images?.[0],
          price: selectedProduct.price,
          quantity: detailQuantity,
        },
      ]);
    }

    alert("Đã thêm sản phẩm vào giỏ hàng");
  };
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const increaseQuantity = (id) => {
    const newCart = cart.map((item) =>
      item._id === id ? { ...item, quantity: item.quantity + 1 } : item,
    );

    setCart(newCart);
  };

  const decreaseQuantity = (id) => {
    const newCart = cart
      .map((item) =>
        item._id === id ? { ...item, quantity: item.quantity - 1 } : item,
      )
      .filter((item) => item.quantity > 0);

    setCart(newCart);
  };

  const removeFromCart = (id) => {
    const newCart = cart.filter((item) => item._id !== id);
    setCart(newCart);
  };

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const handleCheckoutChange = (e) => {
    const { name, value } = e.target;

    setCheckoutInfo({
      ...checkoutInfo,
      [name]: value,
    });
  };
  const handleCheckout = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Giỏ hàng đang trống");
      return;
    }

    if (
      !checkoutInfo.fullName ||
      !checkoutInfo.phone ||
      !checkoutInfo.address
    ) {
      alert("Vui lòng nhập đầy đủ họ tên, số điện thoại và địa chỉ");
      return;
    }

    const orderData = {
      customerInfo: {
        fullName: `${checkoutInfo.gender} ${checkoutInfo.fullName}`,
        phone: checkoutInfo.phone,
        email: checkoutInfo.email,
        address: checkoutInfo.address,
        note: checkoutInfo.note,
      },
      items: cart.map((item) => ({
        product: item._id,
        quantity: item.quantity,
      })),
      paymentMethod: checkoutInfo.paymentMethod,
    };

    try {
      await orderApi.create(orderData);

      alert("Đặt hàng thành công");

      setCart([]);
      setCheckoutInfo({
        gender: "Anh",
        fullName: "",
        phone: "",
        email: "",
        address: "",
        note: "",
        paymentMethod: "COD",
      });

      setActivePage("home");
    } catch (error) {
      console.log("Lỗi đặt hàng:", error);
      alert(
        error.response?.data?.message || "Đặt hàng thất bại, vui lòng thử lại",
      );
    }
  };
  const openProductDetail = async (id) => {
    try {
      const response = await productApi.getById(id);
      setSelectedProduct(response.data);
      setDetailQuantity(1);
      setActivePage("detail");
    } catch (error) {
      console.log("Lỗi lấy chi tiết sản phẩm:", error);
      alert("Không lấy được chi tiết sản phẩm");
    }
  };

  const closeProductDetail = () => {
    setSelectedProduct(null);
    setActivePage("products");
  };
  const handleSearch = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (!searchKeyword.trim()) {
        const response = await productApi.getAll();
        setProducts(response.data);
        setActivePage("products");
        return;
      }

      const response = await productApi.search(searchKeyword);
      setProducts(response.data);
      setSelectedProduct(null);
      setActivePage("products");
    } catch (error) {
      console.log("Lỗi tìm kiếm sản phẩm:", error);
      alert("Không tìm kiếm được sản phẩm");
    } finally {
      setLoading(false);
    }
  };
  const featuredProducts = products.slice(0, 10);
  const handleAuthChange = (e) => {
    const { name, value } = e.target;

    setAuthForm({
      ...authForm,
      [name]: value,
    });
  };
  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;

      if (authMode === "login") {
        response = await customerApi.login({
          email: authForm.email,
          password: authForm.password,
        });
      } else {
        response = await customerApi.register(authForm);
      }

      const customer = response.data.customer;

      setCurrentCustomer(customer);
      localStorage.setItem("currentCustomer", JSON.stringify(customer));

      setCheckoutInfo({
        ...checkoutInfo,
        fullName: customer.fullName || "",
        phone: customer.phone || "",
        email: customer.email || "",
        address: customer.address || "",
      });

      alert(
        authMode === "login" ? "Đăng nhập thành công" : "Đăng ký thành công",
      );

      setActivePage("home");
    } catch (error) {
      console.log("Lỗi tài khoản:", error);
      alert(error.response?.data?.message || "Thao tác thất bại");
    }
  };
  const handleLogoutCustomer = () => {
    setCurrentCustomer(null);
    localStorage.removeItem("currentCustomer");
    alert("Đã đăng xuất");
  };
  const filteredProducts =
    selectedCategory === "Tất cả"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  const homeCategories = [
    { name: "Điện thoại iPhone", icon: Smartphone },
    { name: "Điện thoại Samsung", icon: Smartphone },
    { name: "Điện thoại OPPO", icon: Smartphone },
    { name: "Blackberry", icon: Smartphone },
    { name: "Phụ kiện", icon: Headphones },
    { name: "Smartwatch", icon: Watch },
    { name: "Tin công nghệ", icon: Newspaper },
  ];
  const bannerImages = [
    "/assets/iphone.webp",
    "/assets/banner1.png",
    "/assets/deal.webp",
  ];
  useEffect(() => {
    if (bannerImages.length === 0) return;

    const timer = setInterval(() => {
      setCurrentBanner((prev) =>
        prev === bannerImages.length - 1 ? 0 : prev + 1,
      );
    }, 4000);

    return () => clearInterval(timer);
  }, [bannerImages.length]);

  const dealProducts = products.slice(0, 10);
  useEffect(() => {
    if (dealProducts.length <= 5) return;

    const timer = setInterval(() => {
      setDealIndex((prev) => (prev >= dealProducts.length - 5 ? 0 : prev + 1));
    }, 3500);

    return () => clearInterval(timer);
  }, [dealProducts.length]);

  const newsPosts = [
    {
      id: 1,
      title: "Nghịch lý iPhone Air: Mỏng nhẹ nhưng vẫn được quan tâm",
      image: "/assets/banner1.png",
      date: "24/07/2026",
      excerpt:
        "iPhone Air thu hút người dùng nhờ thiết kế mỏng nhẹ, hiệu năng ổn định và khả năng tối ưu trải nghiệm hằng ngày.",
    },
    {
      id: 2,
      title: "Sự thật iPhone 17 Pro Max phải mua sau khi lau bằng khăn ướt",
      image: "/assets/iphone.webp",
      date: "24/07/2026",
      excerpt:
        "Dòng iPhone mới tiếp tục gây chú ý với camera nâng cấp, pin tốt hơn và nhiều tính năng hỗ trợ người dùng.",
    },
    {
      id: 3,
      title: "Có nên mua điện thoại cũ trong năm 2026?",
      image: "/assets/deal.webp",
      date: "24/07/2026",
      excerpt:
        "Điện thoại cũ là lựa chọn tiết kiệm nếu biết kiểm tra pin, màn hình, camera và nguồn gốc sản phẩm.",
    },
  ];
  const sendChatMessage = async (quickMessage) => {
    const text = quickMessage || chatInput;

    if (!text.trim()) return;

    setChatMessages((prev) => [...prev, { sender: "user", text }]);

    setChatInput("");
    setChatLoading(true);

    try {
      const response = await chatbotApi.ask(text);

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: response.data.reply || "Mình chưa có câu trả lời phù hợp.",
        },
      ]);
    } catch (error) {
      console.log("Lỗi chatbot:", error);

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Xin lỗi, chatbot đang gặp lỗi kết nối. Bạn thử lại sau nhé.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    sendChatMessage();
  };

  return (
    <div>
      <audio ref={audioRef} src="/assets/bao-tran-popup-music.mp3" autoPlay />

      {showPopup && (
        <div className="popup-backdrop">
          <div className="flatsome-popup promo-popup">
            <button className="popup-close" onClick={closePopup}>
              ×
            </button>
            <img src="/assets/bao-tran-popup-sale.jpg" alt="Khuyến mãi" />
          </div>
        </div>
      )}

      <header className="site-header">
        <div className="header-top">
          <div className="container header-top-inner">
            <a className="header-logo" href="/">
              <img
                src="/assets/bao-tran-logo-pastel.png"
                alt="Bao Tran Mobile"
              />
            </a>

            <div className="header-contact">
              <div className="contact-item">
                <Globe2 className="contact-icon" size={28} strokeWidth={1.8} />
                <div>
                  <p>Hỏi đáp</p>
                  <strong>Tư vấn trực tuyến</strong>
                </div>
              </div>

              <div className="contact-item">
                <PhoneCall className="contact-icon" size={28} strokeWidth={1.8} />
                <div>
                  <p>Tổng đài</p>
                  <strong>0989.898989</strong>
                </div>
              </div>

              <div className="contact-item">
                <Clock3 className="contact-icon" size={28} strokeWidth={1.8} />
                <div>
                  <p>Giờ làm việc</p>
                  <strong>8:30-21:00</strong>
                </div>
              </div>
            </div>

            <form className="header-search" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              <button type="submit">⌕</button>
            </form>
          </div>
        </div>

        <nav className="main-nav">
          <div className="container main-nav-inner">
            <a href="#home" onClick={() => setActivePage("home")}>
              Trang chủ
            </a>
            <div className="nav-dropdown">
              <button className="nav-link">
                THƯƠNG HIỆU <span>⌄</span>
              </button>

              <div className="dropdown-menu">
                {[
                  "Điện thoại OPPO",
                  "Điện thoại iPhone",
                  "Điện thoại LG",
                  "Điện thoại Samsung",
                  "Blackberry",
                ].map((category) => (
                  <button
                    type="button"
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setActivePage("products");
                      window.location.hash = "products";
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            <a href="#products" onClick={() => setActivePage("products")}>
              Sản phẩm
            </a>
            <a href="#about" onClick={() => setActivePage("about")}>
              Giới thiệu
            </a>
            <a href="#cart" onClick={() => setActivePage("cart")}>
              Giỏ hàng ({cartCount})
            </a>
            <a href="#account" onClick={() => setActivePage("account")}>
              {currentCustomer ? currentCustomer.fullName : "Tài khoản"}
            </a>
            <a href="#news" onClick={() => setActivePage("news")}>
              Tin công nghệ
            </a>
          </div>
        </nav>
      </header>

      {activePage === "home" && (
        <>
          <section className="home-hero-layout">
            <div className="container hero-layout-grid">
              <aside className="home-category-panel">
                <h3>Danh mục</h3>

                {homeCategories.map((category) => {
                  const Icon = category.icon;

                  return (
                    <button
                      key={category.name}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(category.name);
                        setActivePage("products");
                        window.location.hash = "products";
                      }}
                    >
                      <Icon size={18} />
                      {category.name}
                      <ChevronRight size={17} />
                    </button>
                  );
                })}
              </aside>

              <div className="hero-main-banner">
                <button
                  type="button"
                  className="banner-arrow banner-prev"
                  onClick={() =>
                    setCurrentBanner(
                      currentBanner === 0
                        ? bannerImages.length - 1
                        : currentBanner - 1,
                    )
                  }
                >
                  ‹
                </button>

                <div
                  className="banner-track"
                  style={{
                    transform: `translateX(-${currentBanner * 100}%)`,
                  }}
                >
                  {bannerImages.map((banner, index) => (
                    <div className="banner-slide" key={index}>
                      <img src={banner} alt={`Banner ${index + 1}`} />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="banner-arrow banner-next"
                  onClick={() =>
                    setCurrentBanner(
                      currentBanner === bannerImages.length - 1
                        ? 0
                        : currentBanner + 1,
                    )
                  }
                >
                  ›
                </button>

                <div className="banner-dots">
                  {bannerImages.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      className={currentBanner === index ? "active" : ""}
                      onClick={() => setCurrentBanner(index)}
                    />
                  ))}
                </div>
              </div>

              <aside className="hero-side-banners">
                <img src="/assets/banner2.png" alt="Khuyến mãi 1" />
                <img src="/assets/banner3.png" alt="Khuyến mãi 2" />
                <img src="/assets/banner4.jpeg" alt="Khuyến mãi 3" />
              </aside>
            </div>
          </section>

          <section className="criteria-section">
            <div className="container criteria-grid">
              <div className="criteria-card">
                <div>
                  <h3>Chăm sóc nhanh</h3>
                  <p>Tiếp nhận xử lý nhanh mọi trường hợp</p>
                </div>
                <Zap size={34} />
              </div>

              <div className="criteria-card">
                <div>
                  <h3>Bảo hành</h3>
                  <p>Trọn đời dành cho iPhone - iPad sau sửa chữa</p>
                </div>
                <ShieldCheck size={34} />
              </div>

              <div className="criteria-card">
                <div>
                  <h3>Thay lấy ngay</h3>
                  <p>Thời gian thay nhanh chỉ 40 - 90 phút</p>
                </div>
                <Clock3 size={34} />
              </div>

              <div className="criteria-card">
                <div>
                  <h3>Linh kiện chính hãng</h3>
                  <p>Cam kết chất lượng linh kiện thay thế</p>
                </div>
                <PackageCheck size={34} />
              </div>
            </div>
          </section>
          <section className="daily-deal-section">
            <div className="container">
              <div className="daily-deal-head">
                <h2>GIÁ SỐC MỖI NGÀY</h2>

                <div className="deal-controls">
                  <button
                    type="button"
                    onClick={() =>
                      setDealIndex(
                        dealIndex === 0
                          ? Math.max(0, dealProducts.length - 5)
                          : dealIndex - 1,
                      )
                    }
                  >
                    ‹
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setDealIndex(
                        dealIndex >= Math.max(0, dealProducts.length - 5)
                          ? 0
                          : dealIndex + 1,
                      )
                    }
                  >
                    ›
                  </button>
                </div>
              </div>

              <div className="deal-carousel">
                <div
                  className="deal-track"
                  style={{
                    transform: `translateX(calc(-${dealIndex} * ((100% - 56px) / 5 + 14px)))`,
                  }}
                >
                  {dealProducts.map((product) => (
                    <div className="deal-card" key={product._id}>
                      <span className="deal-label">Hot</span>

                      {product.discount > 0 && (
                        <span className="deal-discount">
                          -{product.discount}%
                        </span>
                      )}

                      <img
                        src={product.images?.[0] || "/assets/no-image.png"}
                        alt={product.name}
                        onClick={() => openProductDetail(product._id)}
                      />

                      <h3 onClick={() => openProductDetail(product._id)}>
                        {product.name}
                      </h3>

                      <del>{product.oldPrice?.toLocaleString("vi-VN")}đ</del>
                      <strong>{product.price?.toLocaleString("vi-VN")}đ</strong>

                      <button type="button" onClick={() => addToCart(product)}>
                        Thêm vào giỏ
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="section" id="products">
            <div className="container">
              <h2 className="flatsome-title">
                <span>Điện thoại bán chạy</span>
              </h2>

              {loading ? (
                <p className="loading-text">Đang tải sản phẩm...</p>
              ) : (
                <div className="product-grid">
                  {featuredProducts.map((product) => (
                    <div className="product-card" key={product._id}>
                      {product.discount > 0 && (
                        <span className="sale-badge">-{product.discount}%</span>
                      )}

                      <button
                        className="product-image"
                        type="button"
                        onClick={() => openProductDetail(product._id)}
                      >
                        <img
                          src={product.images?.[0] || "/assets/no-image.png"}
                          alt={product.name}
                        />
                      </button>

                      <button
                        className="product-name"
                        type="button"
                        onClick={() => openProductDetail(product._id)}
                      >
                        {product.name}
                      </button>

                      <div className="price-row">
                        {product.oldPrice > 0 && (
                          <del>{product.oldPrice.toLocaleString("vi-VN")}đ</del>
                        )}

                        <strong>
                          {product.price?.toLocaleString("vi-VN")}đ
                        </strong>
                      </div>

                      <button
                        className="add-cart-btn"
                        onClick={() => addToCart(product)}
                      >
                        Thêm vào giỏ
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}
      {activePage === "products" && (
        <section className="section all-products-page" id="all-products">
          <div className="container">
            <h2 className="flatsome-title">
              <span>Tất cả sản phẩm</span>
            </h2>

            {loading ? (
              <p className="loading-text">Đang tải sản phẩm...</p>
            ) : (
              <div className="product-grid">
                {filteredProducts.map((product) => (
                  <div className="product-card" key={product._id}>
                    {product.discount > 0 && (
                      <span className="sale-badge">-{product.discount}%</span>
                    )}

                    <button
                      className="product-image"
                      type="button"
                      onClick={() => openProductDetail(product._id)}
                    >
                      <img
                        src={product.images?.[0] || "/assets/no-image.png"}
                        alt={product.name}
                      />
                    </button>

                    <button
                      className="product-name"
                      type="button"
                      onClick={() => openProductDetail(product._id)}
                    >
                      {product.name}
                    </button>

                    <div className="price-row">
                      {product.oldPrice > 0 && (
                        <del>{product.oldPrice.toLocaleString("vi-VN")}đ</del>
                      )}

                      <strong>{product.price?.toLocaleString("vi-VN")}đ</strong>
                    </div>

                    <button
                      className="add-cart-btn"
                      onClick={() => addToCart(product)}
                    >
                      Thêm vào giỏ
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {activePage === "detail" && selectedProduct && (
        <section className="product-detail-section">
          <div className="container product-detail">
            <div className="product-detail-image">
              <img
                src={selectedProduct.images?.[0] || "/assets/no-image.png"}
                alt={selectedProduct.name}
              />
            </div>

            <div className="product-detail-info">
              <button
                className="back-btn"
                onClick={() => setActivePage("home")}
              >
                Quay lại
              </button>

              <h1>{selectedProduct.name}</h1>

              <div className="detail-price">
                {selectedProduct.oldPrice > 0 && (
                  <del>{selectedProduct.oldPrice.toLocaleString("vi-VN")}đ</del>
                )}

                <strong>
                  {selectedProduct.price?.toLocaleString("vi-VN")}đ
                </strong>
              </div>

              <p>Danh mục: {selectedProduct.category}</p>
              <p>Thương hiệu: {selectedProduct.brand}</p>
              <p>Kho còn: {selectedProduct.stock}</p>

              <div className="product-description">
                <h3>Mô tả sản phẩm</h3>
                <p>{selectedProduct.description || "Chưa có mô tả"}</p>
              </div>

              <div className="detail-buy-row">
                <div className="detail-quantity">
                  <button
                    type="button"
                    onClick={() =>
                      setDetailQuantity(Math.max(1, detailQuantity - 1))
                    }
                  >
                    -
                  </button>

                  <span>{detailQuantity}</span>

                  <button
                    type="button"
                    onClick={() => setDetailQuantity(detailQuantity + 1)}
                  >
                    +
                  </button>
                </div>

                <button
                  className="add-cart-btn detail-add-cart"
                  onClick={addDetailToCart}
                >
                  Thêm vào giỏ
                </button>
              </div>
            </div>
          </div>
          <div className="container product-extra-detail">
            <div className="detail-tabs">
              <button className="active">Description</button>
              <button>Reviews (0)</button>
              <button>Thông tin chuyển khoản</button>
            </div>

            <div className="detail-tab-content">
              <img
                className="detail-large-image"
                src={selectedProduct.images?.[0] || "/assets/no-image.png"}
                alt={selectedProduct.name}
              />

              <h3>Thông số kỹ thuật</h3>

              <table className="spec-table">
                <tbody>
                  <tr>
                    <td>Danh mục</td>
                    <td>{selectedProduct.category || "Đang cập nhật"}</td>
                  </tr>
                  <tr>
                    <td>Thương hiệu</td>
                    <td>{selectedProduct.brand || "Đang cập nhật"}</td>
                  </tr>
                  <tr>
                    <td>Bộ nhớ</td>
                    <td>512 GB</td>
                  </tr>
                  <tr>
                    <td>Tình trạng</td>
                    <td>Máy chính hãng, bảo hành 12 tháng</td>
                  </tr>
                  <tr>
                    <td>Kết nối</td>
                    <td>Wi-Fi, Bluetooth, 4G/5G</td>
                  </tr>
                  <tr>
                    <td>Phụ kiện</td>
                    <td>Sạc, cáp, hộp tùy theo từng sản phẩm</td>
                  </tr>
                  <tr>
                    <td>Thông tin chung</td>
                    <td>{selectedProduct.description || "Đang cập nhật"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
      {activePage === "about" && (
        <section className="content-page">
          <div className="container content-layout">
            <main className="content-main">
              <p className="breadcrumb">Trang chủ » Giới thiệu</p>

              <h1>GIỚI THIỆU</h1>

              <p>
                Xin chào bạn đã đến với <strong>Bảo Trân Mobile</strong>,
                website thương mại điện tử chuyên cung cấp điện thoại, phụ kiện
                và các dịch vụ hỗ trợ khách hàng.
              </p>

              <p>
                Bảo Trân Mobile được xây dựng với mục tiêu mang đến trải nghiệm
                mua sắm nhanh chóng, rõ ràng và tiện lợi. Khách hàng có thể xem
                sản phẩm, thêm vào giỏ hàng, đặt hàng trực tuyến và nhận thông
                báo xác nhận qua email.
              </p>

              <p>
                Website tập trung vào các dòng sản phẩm như iPhone, Samsung,
                OPPO, Blackberry, phụ kiện và smartwatch. Mỗi sản phẩm đều có
                thông tin giá, hình ảnh, danh mục, thương hiệu và mô tả chi
                tiết.
              </p>

              <p>
                Với đồ án lập trình web nâng cao, hệ thống được phát triển theo
                mô hình MERN Stack gồm ReactJS cho giao diện, NodeJS Express cho
                backend và MongoDB để lưu trữ dữ liệu.
              </p>

              <p>
                Chúng tôi cam kết đem đến sản phẩm chính hãng, giá cả cạnh
                tranh, bảo hành rõ ràng và hỗ trợ khách hàng nhanh chóng.
              </p>

              <p>Trân trọng,</p>
              <p>
                <strong>Admin Bảo Trân Mobile</strong>
              </p>
            </main>

            <aside className="content-sidebar">
              <img
                className="sidebar-banner"
                src="/assets/banner2.png"
                alt="Bảo hành"
              />

              <div className="latest-posts">
                <h3>BÀI VIẾT MỚI NHẤT</h3>

                {newsPosts.slice(0, 3).map((post) => (
                  <div className="latest-post-item" key={post.id}>
                    <img src={post.image} alt={post.title} />
                    <p>{post.title}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>
      )}

      {activePage === "news" && (
        <section className="content-page">
          <div className="container content-layout">
            <main className="content-main">
              <p className="breadcrumb">Trang chủ » Tin công nghệ</p>

              <h1>TIN CÔNG NGHỆ</h1>

              <div className="news-list">
                {newsPosts.map((post) => (
                  <article className="tech-news-card" key={post.id}>
                    <img src={post.image} alt={post.title} />

                    <div>
                      <span>{post.date}</span>
                      <h2>{post.title}</h2>
                      <p>{post.excerpt}</p>
                      <button type="button">Xem thêm</button>
                    </div>
                  </article>
                ))}
              </div>
            </main>

            <aside className="content-sidebar">
              <img
                className="sidebar-banner"
                src="/assets/banner3.png"
                alt="Khuyến mãi"
              />

              <div className="latest-posts">
                <h3>BÀI VIẾT MỚI NHẤT</h3>

                {newsPosts.slice(0, 3).map((post) => (
                  <div className="latest-post-item" key={post.id}>
                    <img src={post.image} alt={post.title} />
                    <p>{post.title}</p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>
      )}
      {activePage === "cart" && (
        <section className="cart-page">
          <div className="container">
            <h2 className="flatsome-title">
              <span>Giỏ hàng</span>
            </h2>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <p>Giỏ hàng của bạn đang trống.</p>

                <button onClick={() => setActivePage("products")}>
                  Tiếp tục mua hàng
                </button>
              </div>
            ) : (
              <div className="cart-layout">
                <div className="cart-list">
                  {cart.map((item) => (
                    <div className="cart-row" key={item._id}>
                      <img
                        src={item.image || "/assets/no-image.png"}
                        alt={item.name}
                      />

                      <div className="cart-info">
                        <h3>{item.name}</h3>
                        <p>{item.price.toLocaleString("vi-VN")}đ</p>
                      </div>

                      <div className="cart-quantity">
                        <button onClick={() => decreaseQuantity(item._id)}>
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => increaseQuantity(item._id)}>
                          +
                        </button>
                      </div>

                      <strong>
                        {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                      </strong>

                      <button
                        className="remove-cart-btn"
                        onClick={() => removeFromCart(item._id)}
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>

                <aside className="cart-summary">
                  <h3>Cộng giỏ hàng</h3>

                  <div className="summary-line">
                    <span>Tạm tính</span>
                    <strong>{cartTotal.toLocaleString("vi-VN")}đ</strong>
                  </div>

                  <div className="summary-line total">
                    <span>Tổng tiền</span>
                    <strong>{cartTotal.toLocaleString("vi-VN")}đ</strong>
                  </div>

                  <button
                    className="checkout-btn"
                    onClick={() => setActivePage("checkout")}
                  >
                    Tiến hành thanh toán
                  </button>

                  <button
                    className="continue-btn"
                    onClick={() => setActivePage("products")}
                  >
                    Tiếp tục mua hàng
                  </button>
                </aside>
              </div>
            )}
          </div>
        </section>
      )}
      {activePage === "checkout" && (
        <section className="checkout-page">
          <div className="container">
            <h2 className="flatsome-title">
              <span>Thông tin đặt hàng</span>
            </h2>

            <div className="checkout-layout">
              <form className="checkout-form" onSubmit={handleCheckout}>
                <h3>Thông tin người mua</h3>

                <div className="gender-row">
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="Anh"
                      checked={checkoutInfo.gender === "Anh"}
                      onChange={handleCheckoutChange}
                    />
                    Anh
                  </label>

                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="Chị"
                      checked={checkoutInfo.gender === "Chị"}
                      onChange={handleCheckoutChange}
                    />
                    Chị
                  </label>
                </div>

                <input
                  name="fullName"
                  placeholder="Họ và tên"
                  value={checkoutInfo.fullName}
                  onChange={handleCheckoutChange}
                />

                <input
                  name="phone"
                  placeholder="Số điện thoại"
                  value={checkoutInfo.phone}
                  onChange={handleCheckoutChange}
                />

                <input
                  name="email"
                  placeholder="Email nhận xác nhận đơn hàng"
                  value={checkoutInfo.email}
                  onChange={handleCheckoutChange}
                />

                <textarea
                  name="address"
                  placeholder="Địa chỉ nhận hàng"
                  value={checkoutInfo.address}
                  onChange={handleCheckoutChange}
                />

                <textarea
                  name="note"
                  placeholder="Ghi chú đơn hàng"
                  value={checkoutInfo.note}
                  onChange={handleCheckoutChange}
                />

                <h3>Hình thức thanh toán</h3>

                <div className="payment-methods">
                  <label>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={checkoutInfo.paymentMethod === "COD"}
                      onChange={handleCheckoutChange}
                    />
                    Thanh toán khi nhận hàng
                  </label>

                  <label>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="BANK"
                      checked={checkoutInfo.paymentMethod === "BANK"}
                      onChange={handleCheckoutChange}
                    />
                    Chuyển khoản ngân hàng
                  </label>
                </div>

                {checkoutInfo.paymentMethod === "BANK" && (
                  <div className="qr-box">
                    <p>Quét mã QR để chuyển khoản</p>
                    <img src="/assets/qr-code.png" alt="QR chuyển khoản" />
                    <strong>Nội dung: BAOTRAN + SĐT</strong>
                  </div>
                )}

                <button className="checkout-submit" type="submit">
                  Đặt hàng ngay
                </button>
              </form>

              <aside className="checkout-summary">
                <h3>Đơn hàng của bạn</h3>

                {cart.map((item) => (
                  <div className="checkout-item" key={item._id}>
                    <img
                      src={item.image || "/assets/no-image.png"}
                      alt={item.name}
                    />
                    <div className="checkout-item-info">
                      <p>{item.name}</p>

                      <div className="checkout-item-meta">
                        <span>Số lượng: {item.quantity}</span>
                        <strong>
                          {(item.price * item.quantity).toLocaleString("vi-VN")}
                          đ
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="checkout-total">
                  <span>Tổng tiền:</span>
                  <strong>{cartTotal.toLocaleString("vi-VN")}đ</strong>
                </div>
              </aside>
            </div>
          </div>
        </section>
      )}
      {activePage === "account" && (
        <section className="account-page">
          <div className="container account-box">
            {currentCustomer ? (
              <>
                <h2>Thông tin tài khoản</h2>
                <p>Họ tên: {currentCustomer.fullName}</p>
                <p>Email: {currentCustomer.email}</p>
                <p>SĐT: {currentCustomer.phone}</p>
                <p>Địa chỉ: {currentCustomer.address}</p>

                <button className="logout-btn" onClick={handleLogoutCustomer}>
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <h2>
                  {authMode === "login" ? "Đăng nhập" : "Đăng ký tài khoản"}
                </h2>

                <form className="auth-form" onSubmit={handleAuthSubmit}>
                  {authMode === "register" && (
                    <>
                      <input
                        name="fullName"
                        placeholder="Họ và tên"
                        value={authForm.fullName}
                        onChange={handleAuthChange}
                      />

                      <input
                        name="phone"
                        placeholder="Số điện thoại"
                        value={authForm.phone}
                        onChange={handleAuthChange}
                      />

                      <input
                        name="address"
                        placeholder="Địa chỉ"
                        value={authForm.address}
                        onChange={handleAuthChange}
                      />
                    </>
                  )}

                  <input
                    name="email"
                    placeholder="Email"
                    value={authForm.email}
                    onChange={handleAuthChange}
                  />

                  <input
                    name="password"
                    type="password"
                    placeholder="Mật khẩu"
                    value={authForm.password}
                    onChange={handleAuthChange}
                  />

                  <button type="submit">
                    {authMode === "login" ? "Đăng nhập" : "Đăng ký"}
                  </button>
                </form>

                <button
                  className="switch-auth-btn"
                  onClick={() =>
                    setAuthMode(authMode === "login" ? "register" : "login")
                  }
                >
                  {authMode === "login"
                    ? "Chưa có tài khoản? Đăng ký"
                    : "Đã có tài khoản? Đăng nhập"}
                </button>
              </>
            )}
          </div>
        </section>
      )}

      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <h3>Về chúng tôi</h3>
            <a href="/#">Giới thiệu</a>
            <a href="/#">Hợp tác</a>
            <a href="/#">Tuyển dụng</a>
            <a href="/#">Chính sách bảo hành</a>
          </div>

          <div>
            <h3>Dịch vụ - Giải đáp</h3>
            <a href="/#">Bảo hành sửa chữa</a>
            <a href="/#">Đào tạo dạy nghề</a>
            <a href="/#">Sửa chữa Macbook</a>
          </div>

          <div>
            <h3>Thông tin liên hệ</h3>
            <p>Bảo Trân Mobile</p>
            <p>Địa chỉ: TP Hồ Chí Minh</p>
            <strong>Hotline: 0999999999</strong>
          </div>

          <div>
            <h3>Mạng xã hội</h3>
            <p>Fanpage Bảo Trân Mobile</p>
          </div>
        </div>

        <div className="copyright">Copyright © 2026 Bao Tran Mobile</div>
      </footer>

      <div className="floating-contact">
        <a href="tel:0999999999">☎</a>
        <a href="/#zalo">Z</a>
        <a href="mailto:baotranmobile@gmail.com">✉</a>
        <a href="/#map">●</a>
      </div>

      <div className="chatbot-widget">
        <button
          className="chatbot-toggle"
          onClick={() => {
            setChatOpen(true);
            setChatExpanded(false);
          }}
        >
          <img src="/assets/bao-tran-chatbot-logo.jpg" alt="Chatbot" />
        </button>

        <div
          className={`chatbot-panel ${chatOpen ? "open" : ""} ${
            chatExpanded ? "expanded" : ""
          }`}
        >
          <header>
            <strong>Hỗ trợ mua hàng</strong>

            <div className="chatbot-actions">
              <button
                type="button"
                onClick={() => setChatExpanded(!chatExpanded)}
                title={chatExpanded ? "Thu nhỏ" : "Phóng to"}
              >
                {chatExpanded ? "−" : "□"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setChatOpen(false);
                  setChatExpanded(false);
                }}
                title="Đóng"
              >
                ×
              </button>
            </div>
          </header>

          <div className="chatbot-messages">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={
                  msg.sender === "user" ? "user-message" : "bot-message"
                }
              >
                {msg.text}
              </div>
            ))}

            {chatLoading && <div className="bot-message">Đang tư vấn...</div>}
          </div>

          <div className="chatbot-quick">
            <button
              type="button"
              onClick={() => sendChatMessage("Tư vấn iPhone")}
            >
              iPhone
            </button>

            <button
              type="button"
              onClick={() => sendChatMessage("Tư vấn Samsung")}
            >
              Samsung
            </button>

            <button
              type="button"
              onClick={() => sendChatMessage("Shop có trả góp không?")}
            >
              Trả góp
            </button>
          </div>

          <form id="chatbotForm" onSubmit={handleChatSubmit}>
            <input
              id="chatbotInput"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
            />
            <button type="submit">Gửi</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
