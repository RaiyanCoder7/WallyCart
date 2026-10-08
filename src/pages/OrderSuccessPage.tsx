
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const OrderSuccessPage = () => {
  const { cartItems, total } = useCart();

  return (
    <main className="order-success-page">
      <div className="order-success-card">
        <div className="success-icon">
          ✓
        </div>

        <span className="success-label">
          Demo Order Confirmation
        </span>

        <h1>Thank you for shopping with WallyCart!</h1>

        <p className="success-description">
          Your checkout form was submitted successfully.
          This is a frontend demo; no real order has been
          created or payment processed.
        </p>

        <div className="success-order-details">
          <div>
            <span>Items</span>
            <strong>{cartItems.length} products</strong>
          </div>

          <div>
            <span>Subtotal</span>
            <strong>₹{total}</strong>
          </div>
        </div>

        <Link to="/" className="success-home-button">
          Continue Shopping
        </Link>
      </div>
    </main>
  );
};

export default OrderSuccessPage;