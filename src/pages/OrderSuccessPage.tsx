
import {
  Link,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";

interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
}

interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface Order {
  _id: string;
  customer: Customer;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface OrderSuccessLocationState {
  order?: Order;
}

const OrderSuccessPage = () => {
  const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as OrderSuccessLocationState | null;

  const [order, setOrder] = useState<Order | null>(
    state?.order ?? null
  );
  const [isLoading, setIsLoading] = useState(!state?.order);
  const [error, setError] = useState("");

  useEffect(() => {
    // The checkout page already supplied the order.
    if (order?._id) {
      return;
    }

    // Retrieve the saved order ID and its secret access token.
    const savedOrderId = sessionStorage.getItem(
      "wallycart-last-order-id"
    );

    const savedOrderAccessToken = sessionStorage.getItem(
      "wallycart-last-order-access-token"
    );

    if (!savedOrderId || !savedOrderAccessToken) {
      setIsLoading(false);
      setError(
        "Order access information is missing. Please complete checkout again to view your order."
      );
      return;
    }

    const controller = new AbortController();

    const fetchOrder = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/orders/${encodeURIComponent(savedOrderId)}`,
          {
            headers: {
              "x-order-access-token": savedOrderAccessToken,
            },
            signal: controller.signal,
          }
        );

        const result = await response.json();

        if (
          !response.ok ||
          !result.success ||
          !result.data?._id
        ) {
          throw new Error(
            result.message || "Unable to retrieve your order."
          );
        }

        setOrder(result.data as Order);
      } catch (err: unknown) {
        if (
          err instanceof Error &&
          err.name === "AbortError"
        ) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to retrieve your order."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void fetchOrder();

    return () => controller.abort();
  }, [order?._id]);

  if (isLoading) {
    return (
      <main className="order-success-page">
        <div className="order-success-card">
          <h1>Loading your order...</h1>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="order-success-page">
        <div className="order-success-card">
          <h1>Order details unavailable</h1>

          <p className="success-description">
            {error || "We couldn't retrieve this order."}
          </p>

          <button
            type="button"
            className="success-home-button"
            onClick={() => navigate("/")}
          >
            Continue Shopping
          </button>
        </div>
      </main>
    );
  }

  // Prevent showing a false confirmation without an order.
  if (!order._id) {
    return <Navigate to="/products" replace />;
  }

  const orderDate = new Date(order.createdAt);

  return (
    <main className="order-success-page">
      <div className="order-success-card">
        <div className="success-icon" aria-hidden="true">
          ✓
        </div>

        <span className="success-label">
          Order Confirmed
        </span>

        <h1>Thank you for shopping with WallyCart!</h1>

        <p className="success-description">
          Your order has been created successfully. Keep your
          order ID for future reference.
        </p>

        <div className="success-order-details">
          <div>
            <span>Order ID</span>
            <strong>{order._id}</strong>
          </div>

          <div>
            <span>Order Date</span>
            <strong>
              {Number.isNaN(orderDate.getTime())
                ? "Date unavailable"
                : orderDate.toLocaleString("en-IN")}
            </strong>
          </div>

          <div>
            <span>Status</span>
            <strong>
              {order.status.charAt(0).toUpperCase() +
                order.status.slice(1)}
            </strong>
          </div>

          <div>
            <span>Items</span>
            <strong>
              {order.items.reduce(
                (count, item) => count + item.quantity,
                0
              )}{" "}
              items
            </strong>
          </div>
        </div>

        <section className="success-order-items">
          <h2>Order Summary</h2>

          {order.items.map((item, index) => (
            <div
              className="checkout-item"
              key={`${item.product}-${index}`}
            >
              <div className="checkout-item-info">
                <span>{item.name}</span>
                <small>
                  ₹{item.price.toFixed(2)} × {item.quantity}
                </small>
              </div>

              <strong>
                ₹{(item.price * item.quantity).toFixed(2)}
              </strong>
            </div>
          ))}

          <div className="checkout-divider" />

          <div className="checkout-price-row">
            <span>Subtotal</span>
            <span>₹{order.subtotal.toFixed(2)}</span>
          </div>

          <div className="checkout-price-row">
            <span>Delivery</span>
            <span>
              {order.deliveryFee === 0
                ? "FREE"
                : `₹${order.deliveryFee.toFixed(2)}`}
            </span>
          </div>

          <div className="checkout-divider" />

          <div className="checkout-grand-total">
            <span>Order Total</span>
            <strong>₹{order.totalAmount.toFixed(2)}</strong>
          </div>
        </section>

        <section className="success-delivery-details">
          <h2>Delivery Details</h2>

          <p>
            <strong>{order.customer.name}</strong>
          </p>

          <p>{order.customer.address}</p>
          <p>{order.customer.phone}</p>
          <p>{order.customer.email}</p>
        </section>

        <Link to="/" className="success-home-button">
          Continue Shopping
        </Link>

        <p className="checkout-note">
          Demo checkout · No payment was processed.
        </p>
      </div>
    </main>
  );
};

export default OrderSuccessPage;