import { useState } from "react";
import products from "./data/products";
import ProductList from "./components/ProductList";
import AROverlay from "./components/AROverlay";
import Cart from "./components/Cart";
import ChatBot from "./components/ChatBot";
import Navbar from "./components/Navbar";
import "./index.css"; // Your global styles

function App() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const addToCart = (product) => {
    setCartItems((prev) => [...prev, product]);
  };

  const handleChat = (msg) => {
    const reply = getBotReply(msg);
    setChatMessages((prev) => [...prev, { user: msg, bot: reply }]);
  };

  const getBotReply = (msg) => {
    msg = msg.toLowerCase();
    if (msg.includes("healthy")) return "Try Organic Apple or Low-Fat Milk!";
    if (msg.includes("offer")) return "Bread has BOGO. Chocolate has ₹10 off!";
    if (msg.includes("milk")) return "Low-Fat Milk is available at ₹25!";
    if (msg.includes("recommend")) return "Looking for a treat? Go for Sugar-Free Dark Chocolate.";
    if (msg.includes("hello") || msg.includes("hi")) return "Hi there! Need help finding something?";
    if (msg.includes("cart")) return "Check the Cart section for all added items.";
    return "I can help you find offers, healthy products, or assist with shopping!";
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        <div className="main-grid">
          <div className="section">
            <h2 className="section-title blue">Products</h2>
            <ProductList products={products} onClick={handleProductClick} />
          </div>

          <div className="section">
            <h2 className="section-title purple">Smart Preview</h2>
            <AROverlay product={selectedProduct} addToCart={addToCart} />
          </div>

          <div className="section">
            <h2 className="section-title green">Cart & Assistant</h2>
            <Cart items={cartItems} />
            <ChatBot onSend={handleChat} messages={chatMessages} />
          </div>
        </div>
      </main>

      <footer className="footer">
        © 2025 WallyCart. All rights reserved.
      </footer>
    </div>
  );
}

export default App;