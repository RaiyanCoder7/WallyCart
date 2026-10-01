import { useEffect, useState } from "react";
import products from "./data/products";
import ProductList from "./components/ProductList";
import AROverlay from "./components/AROverlay";
import Cart from "./components/Cart";
import ChatBot from "./components/ChatBot";
import Navbar from "./components/Navbar";
import "./index.css";

function App() {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("wallycart-cart");

    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [chatMessages, setChatMessages] = useState([]);

  // Persist cart whenever it changes
  useEffect(() => {
    localStorage.setItem(
      "wallycart-cart",
      JSON.stringify(cartItems)
    );
  }, [cartItems]);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existingItem = prev.find(
        (item) => item.id === product.id
      );

      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleChat = (msg) => {
    const reply = getBotReply(msg);

    setChatMessages((prev) => [
      ...prev,
      { user: msg, bot: reply },
    ]);
  };

  const getBotReply = (msg) => {
    msg = msg.toLowerCase();

    if (msg.includes("healthy")) {
      return "Try Organic Apple or Low-Fat Milk!";
    }

    if (msg.includes("offer")) {
      return "Bread has BOGO. Chocolate has ₹10 off!";
    }

    if (msg.includes("milk")) {
      return "Low-Fat Milk is available at ₹25!";
    }

    if (msg.includes("recommend")) {
      return "Looking for a treat? Go for Sugar-Free Dark Chocolate.";
    }

    if (msg.includes("hello") || msg.includes("hi")) {
      return "Hi there! Need help finding something?";
    }

    if (msg.includes("cart")) {
      return "Check the Cart section for all added items.";
    }

    return "I can help you find offers, healthy products, or assist with shopping!";
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        <div className="main-grid">
          <div className="section">
            <h2 className="section-title blue">
              Products
            </h2>

            <ProductList
              products={products}
              onClick={handleProductClick}
            />
          </div>

          <div className="section">
            <h2 className="section-title purple">
              Smart Preview
            </h2>

            <AROverlay
              product={selectedProduct}
              addToCart={addToCart}
            />
          </div>

          <div className="section">
            <h2 className="section-title green">
              Cart & Assistant
            </h2>

            <Cart
              items={cartItems}
              setCartItems={setCartItems}
            />

            <ChatBot
              onSend={handleChat}
              messages={chatMessages}
            />
          </div>
        </div>
      </main>

      <footer className="footer">
        © 2026 WallyCart. All rights reserved.
      </footer>
    </div>
  );
}

export default App;