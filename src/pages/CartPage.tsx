import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaShoppingBag,
  FaTrash,
} from "react-icons/fa";

import { useCart } from "../context/CartContext";

const CartPage = () => {
  const navigate = useNavigate();

  const {
    cartItems,
    updateQuantity,
    removeItem,
    totalItems,
  } = useCart();

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const deliveryFee = totalPrice >= 499 ? 0 : 40;
  const finalTotal = totalPrice + deliveryFee;

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart-page">
        <div className="empty-cart-icon">
          <FaShoppingBag />
        </div>

        <h1>Your cart is waiting</h1>

        <p>
          Looks like you haven't added anything yet.
          Let's find something for you.
        </p>

        <button
          type="button"
          className="checkout-button"
          onClick={() => navigate("/products")}
        >
          Explore Products
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">

      <button
        type="button"
        className="back-button"
        onClick={() => navigate("/products")}
      >
        <FaArrowLeft />
        Continue Shopping
      </button>

      <div className="cart-page-heading">
        <div>
          <span className="section-eyebrow">
            YOUR SELECTION
          </span>

          <h1>Shopping Cart</h1>

          <p>
            {totalItems} items in your cart
          </p>
        </div>
      </div>

      <div className="cart-page-layout">

        {/* Cart Items */}
        <section className="cart-list">

          {cartItems.map((item) => (
            <article
              className="cart-product-row"
              key={item.id}
            >
              <img
                src={item.image}
                alt={item.name}
              />

              <div className="cart-product-info">
                <span>{item.category}</span>

                <h3>{item.name}</h3>

                <strong>₹{item.price}</strong>
              </div>

              <div className="cart-product-actions">

                <div className="quantity-control">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.id, -1)
                    }
                    disabled={item.quantity <= 1}
                    aria-label={`Decrease ${item.name} quantity`}
                  >
                    −
                  </button>

                  <strong>{item.quantity}</strong>

                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.id, 1)
                    }
                    aria-label={`Increase ${item.name} quantity`}
                  >
                    +
                  </button>
                </div>

                <strong className="cart-line-total">
                  ₹{item.price * item.quantity}
                </strong>

                <button
                  type="button"
                  className="remove-cart-item"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Remove ${item.name} from cart`}
                >
                  <FaTrash />
                </button>

              </div>
            </article>
          ))}

        </section>

        {/* Order Summary */}
        <aside className="order-summary">

          <h2>Order Summary</h2>

          <div>
            <span>Subtotal ({totalItems} items)</span>
            <strong>₹{totalPrice}</strong>
          </div>

          <div>
            <span>Delivery Fee</span>
            <strong>
              {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
            </strong>
          </div>

          {deliveryFee > 0 && (
            <p className="delivery-note">
              Add ₹{499 - totalPrice} more for free delivery.
            </p>
          )}

          <div className="summary-total">
            <span>Total</span>
            <strong>₹{finalTotal}</strong>
          </div>

          <button
            type="button"
            className="checkout-button"
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout
          </button>

          <p className="summary-disclaimer">
            Delivery and order details will be confirmed
            during checkout.
          </p>

        </aside>

      </div>
    </div>
  );
};

export default CartPage;