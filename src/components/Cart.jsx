import { FaShoppingCart } from "react-icons/fa";

const Cart = ({ items }) => {
  const isEmpty = items.length === 0;
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="cart-container">
      <div className="cart-header">
        <FaShoppingCart className="cart-icon" />
        <h2>Your Cart</h2>
      </div>

      {isEmpty ? (
        <div className="cart-empty">🛒 Your cart is empty.</div>
      ) : (
        <>
          <ul className="cart-items">
            {items.map((item, index) => (
              <li key={index} className="cart-item">
                <span>{item.name}</span>
                <span>₹{item.price}</span>
              </li>
            ))}
          </ul>

          <div className="cart-total">
            <span>Total: ₹{total}</span>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;