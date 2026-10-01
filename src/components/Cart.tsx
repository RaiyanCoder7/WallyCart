import { FaShoppingCart, FaTrash } from "react-icons/fa";
import type { Dispatch, SetStateAction } from "react";
import type { CartItem } from "../types";

interface CartProps {
  items: CartItem[];
  setCartItems: Dispatch<SetStateAction<CartItem[]>>;
}

const Cart = ({ items, setCartItems }: CartProps) => {
  const isEmpty = items.length === 0;

  const totalItems = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const updateQuantity = (id: number, change: number): void => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + change }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: number): void => {
    setCartItems((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  return (
    <div className="cart-container">
      <div className="cart-header">
        <FaShoppingCart className="cart-icon" />

        <h2>Your Cart ({totalItems})</h2>
      </div>

      {isEmpty ? (
        <div className="cart-empty">
          Your cart is empty.
        </div>
      ) : (
        <>
          <ul className="cart-items">
            {items.map((item) => (
              <li
                key={item.id}
                className="cart-item"
              >
                <div>
                  <strong>{item.name}</strong>

                  <p>
                    ₹{item.price} × {item.quantity}
                  </p>
                </div>

                <div className="cart-item-actions">
                  <button
                    onClick={() =>
                      updateQuantity(item.id, -1)
                    }
                    aria-label={`Decrease ${item.name} quantity`}
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() =>
                      updateQuantity(item.id, 1)
                    }
                    aria-label={`Increase ${item.name} quantity`}
                  >
                    +
                  </button>

                  <button
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.name}`}
                  >
                    <FaTrash />
                  </button>
                </div>

                <strong>
                  ₹{item.price * item.quantity}
                </strong>
              </li>
            ))}
          </ul>

          <div className="cart-total">
            <strong>Total: ₹{total}</strong>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;