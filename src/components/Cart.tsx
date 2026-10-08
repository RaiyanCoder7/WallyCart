import {
  FaShoppingCart,
  FaTrash,
} from "react-icons/fa";

import { useCart } from "../context/CartContext";

const Cart = () => {
  const {
    cartItems,
    updateQuantity,
    removeItem,
    totalItems,
    total,
  } = useCart();

  const isEmpty = cartItems.length === 0;

  return (
    <div className="cart-container">
      <div className="cart-header">
        <FaShoppingCart className="cart-icon" />

        <h2>
          Your Cart ({totalItems})
        </h2>
      </div>

      {isEmpty ? (
        <div className="cart-empty">
          Your cart is empty.
        </div>
      ) : (
        <>
          <ul className="cart-items">
            {cartItems.map((item) => (
              <li
                key={item.id}
                className="cart-item"
              >
                <div>
                  <strong>
                    {item.name}
                  </strong>

                  <p>
                    ₹{item.price} ×{" "}
                    {item.quantity}
                  </p>
                </div>

                <div className="cart-item-actions">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(
                        item.id,
                        -1
                      )
                    }
                    aria-label={`Decrease ${item.name} quantity`}
                  >
                    -
                  </button>

                  <span>
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(
                        item.id,
                        1
                      )
                    }
                    aria-label={`Increase ${item.name} quantity`}
                  >
                    +
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      removeItem(item.id)
                    }
                    aria-label={`Remove ${item.name}`}
                  >
                    <FaTrash />
                  </button>
                </div>

                <strong>
                  ₹
                  {item.price *
                    item.quantity}
                </strong>
              </li>
            ))}
          </ul>

          <div className="cart-total">
            <strong>
              Total: ₹{total}
            </strong>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;