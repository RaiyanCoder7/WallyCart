
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

interface AddressForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
}

const CheckoutPage = () => {
  const { cartItems, total, clearCart } = useCart();
  const navigate = useNavigate();

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const [form, setForm] = useState<AddressForm>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deliveryFee = total >= 499 ? 0 : 40;
  const grandTotal = total + deliveryFee;

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  
  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    if (isSubmitting) return;

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!/^\d{6}$/.test(form.pincode)) {
      setError("Enter a valid 6-digit PIN code.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: {
            name: form.fullName.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            address: `${form.address.trim()}, ${form.city.trim()}, ${form.pincode.trim()}`,
          },
          items: cartItems.map((item) => ({
            productId: String(item.id),
            quantity: item.quantity,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const validationMessage = Array.isArray(result.errors)
          ? result.errors
            .map((issue: { message: string }) => issue.message)
            .join(" ")
          : "";

        throw new Error(
          validationMessage ||
            result.message ||
            "Unable to place your order. Please try again."
        );
      }

      if (!result.success || !result.data?._id) {
        throw new Error(
          "The server response did not confirm order creation."
        );
      }

      if (!result.accessToken) {
        throw new Error("Order created, but the access token is missing.");
      }

      sessionStorage.setItem(
        "wallycart-last-order-access-token",
        result.accessToken
      );

      sessionStorage.setItem(
        "wallycart-last-order-id",
        result.data._id
      );

      clearCart();

      navigate("/order-success", {
        state: { order: result.data },
      });
    } catch (err: unknown) {
      if (err instanceof TypeError) {
        setError(
          "Unable to connect to the server. Check that the backend is running."
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while placing your order."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="checkout-page">
        <div className="checkout-empty">
          <h2>Your cart is empty</h2>
          <p>Add products before proceeding to checkout.</p>
          <Link to="/products" className="checkout-button">
            Browse Products
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-heading">
          <Link to="/cart" className="checkout-back">
            ← Back to Cart
          </Link>

          <h1>Checkout</h1>
          <p>Almost there! Confirm your delivery details.</p>
        </div>

        <form
          className="checkout-layout"
          onSubmit={handleSubmit}
        >
          <section className="checkout-form-card">
            <h2>Delivery Information</h2>

            <div className="checkout-field">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="checkout-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="checkout-field">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                required
              />
            </div>

            <div className="checkout-field">
              <label htmlFor="address">Full Address</label>
              <textarea
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="House number, street, area"
                rows={4}
                required
              />
            </div>

            <div className="checkout-two-columns">
              <div className="checkout-field">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Your city"
                  required
                />
              </div>

              <div className="checkout-field">
                <label htmlFor="pincode">PIN Code</label>
                <input
                  id="pincode"
                  name="pincode"
                  inputMode="numeric"
                  maxLength={6}
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="6-digit PIN"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="checkout-error" role="alert">
                {error}
              </p>
            )}
          </section>

          <aside className="checkout-summary">
            <h2>Order Summary</h2>

            <div className="checkout-items">
              {cartItems.map((item) => (
                <div
                  className="checkout-item"
                  key={item.id}
                >
                  <div className="checkout-item-info">
                    <span>{item.name}</span>
                    <small>Qty: {item.quantity}</small>
                  </div>

                  <strong>
                    ₹{item.price * item.quantity}
                  </strong>
                </div>
              ))}
            </div>

            <div className="checkout-divider" />

            <div className="checkout-price-row">
              <span>Subtotal</span>
              <span>₹{total}</span>
            </div>

            <div className="checkout-price-row">
              <span>Delivery</span>
              <span>
                {deliveryFee === 0
                  ? "FREE"
                  : `₹${deliveryFee}`}
              </span>
            </div>

            <div className="checkout-divider" />

            <div className="checkout-grand-total">
              <span>Total</span>
              <strong>₹{grandTotal}</strong>
            </div>

            <button
              type="submit"
              className="checkout-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Placing Order..." : "Place Order"}
            </button>

            <p className="checkout-note">
              Demo checkout · No payment will be processed.
            </p>
          </aside>
        </form>
      </div>
    </main>
  );
};

export default CheckoutPage;