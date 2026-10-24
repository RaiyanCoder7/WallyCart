
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";
import "../styles/adminDashboardPage.css";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

type OrderItem = {
  name: string;
  price: number;
  quantity: number;
};

type Order = {
  _id: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
};

type OrdersResponse = {
  success: boolean;
  data: Order[];
  message?: string;
};

const nextStatuses: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch("/orders");
      const result = (await response.json()) as OrdersResponse;

      if (response.status === 401 || response.status === 403) {
        navigate("/admin/login", { replace: true });
        return;
      }

      if (!response.ok || !result.success || !Array.isArray(result.data)) {
        throw new Error(result.message || "Unable to load orders.");
      }

      setOrders(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  async function updateStatus(orderId: string, status: OrderStatus) {
    setUpdatingId(orderId);
    setError("");
    setNotice("");

    try {
      const response = await apiFetch(`/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const result = (await response.json()) as {
        success: boolean;
        message?: string;
        data?: Order;
      };

      if (response.status === 401 || response.status === 403) {
        navigate("/admin/login", { replace: true });
        return;
      }

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || "Unable to update order status.");
      }

      setOrders((current) =>
        current.map((order) =>
          order._id === orderId ? result.data! : order
        )
      );

      setNotice(`Order status updated to ${status}.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update order status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function logout() {
    try {
      const response = await apiFetch("/admin/logout", {
        method: "POST",
      });

      if (!response.ok) {
        setError("Logout failed. Please try again.");
        return;
      }

      navigate("/admin/login", { replace: true });
    } catch {
      setError("Could not contact the server to log out.");
    }
  }

  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );

  const awaitingFulfillment = orders.filter((order) =>
    ["pending", "confirmed", "shipped"].includes(order.status)
  ).length;

  return (
    <main className="admin-dashboard">
      <div className="admin-container">
        <header className="admin-header">
          <div>
            <p className="admin-eyebrow">WallyCart / Store management</p>
            <h1 className="admin-title">Admin dashboard</h1>
            <p className="admin-subtitle">
              Manage orders, track fulfillment, and monitor store activity.
            </p>
          </div>

          <div className="admin-status-control">
            <button
              type="button"
              onClick={() => void loadOrders()}
              disabled={loading}
              className="admin-button"
            >
              {loading ? "Refreshing..." : "↻ Refresh"}
            </button>

            <button
              type="button"
              onClick={() => void logout()}
              className="admin-button admin-button-primary"
            >
              Sign out
            </button>
          </div>
        </header>

        {error && (
          <div role="alert" className="admin-notice admin-error">
            {error}
          </div>
        )}

        {notice && (
          <div role="status" className="admin-notice">
            {notice}
          </div>
        )}

        <section className="admin-metrics" aria-label="Order statistics">
          <article className="admin-card">
            <p className="admin-metric-label">Total orders</p>
            <p className="admin-metric-value">{orders.length}</p>
            <p className="admin-metric-note">Orders recorded in your store</p>
          </article>

          <article className="admin-card">
            <p className="admin-metric-label">Total order value</p>
            <p className="admin-metric-value">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="admin-metric-note">
              Combined value of all loaded orders
            </p>
          </article>

          <article className="admin-card">
            <p className="admin-metric-label">Awaiting fulfillment</p>
            <p className="admin-metric-value">{awaitingFulfillment}</p>
            <p className="admin-metric-note">
              Pending, confirmed, or shipped
            </p>
          </article>
        </section>

        <section className="admin-card">
          <div className="admin-section-header">
            <div>
              <h2 className="admin-section-title">Recent orders</h2>
              <p className="admin-section-description">
                Review customer details and manage each order's progress.
              </p>
            </div>

            <span className="admin-status">
              {orders.length} {orders.length === 1 ? "order" : "orders"}
            </span>
          </div>

          {loading ? (
            <div className="admin-empty" role="status">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="admin-empty">No orders found.</div>
          ) : (
            <div className="admin-orders">
              {orders.map((order) => (
                <article key={order._id} className="admin-order">
                  <div className="admin-order-top">
                    <div>
                      <p className="admin-order-id">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <p className="admin-muted">
                        {new Date(order.createdAt).toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div>
                      <p className="admin-detail-label">Order total</p>
                      <p className="admin-total">
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="admin-order-details">
                    <div>
                      <p className="admin-detail-label">Customer</p>
                      <p className="admin-detail-value">
                        <strong>{order.customer.fullName}</strong>
                      </p>
                      <p className="admin-detail-value">
                        {order.customer.email}
                      </p>
                      <p className="admin-detail-value">
                        {order.customer.phone}
                      </p>
                      <p className="admin-detail-value">
                        {order.customer.address}, {order.customer.city} -{" "}
                        {order.customer.pincode}
                      </p>
                    </div>

                    <div>
                      <p className="admin-detail-label">Items ordered</p>
                      <div className="admin-order-items">
                        {order.items.map((item, index) => (
                          <div
                            key={`${item.name}-${index}`}
                            className="admin-order-item"
                          >
                            <span>
                              {item.name} × {item.quantity}
                            </span>
                            <strong>
                              {formatCurrency(item.price * item.quantity)}
                            </strong>
                          </div>
                        ))}
                      </div>

                      <p className="admin-muted">
                        Subtotal: {formatCurrency(order.subtotal)} · Delivery:{" "}
                        {formatCurrency(order.deliveryFee)}
                      </p>
                    </div>
                  </div>

                  <div className="admin-order-bottom">
                    <div>
                      <p className="admin-detail-label">Current status</p>
                      <span
                        className={`admin-status status-${order.status}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="admin-status-control">
                      <label
                        htmlFor={`status-${order._id}`}
                        className="admin-detail-value"
                      >
                        Update status
                      </label>

                      <select
                        id={`status-${order._id}`}
                        value=""
                        disabled={
                          updatingId === order._id ||
                          nextStatuses[order.status].length === 0
                        }
                        onChange={(event) => {
                          const value = event.target.value as OrderStatus;
                          if (value) void updateStatus(order._id, value);
                        }}
                        className="admin-select"
                      >
                        <option value="">
                          {updatingId === order._id
                            ? "Updating..."
                            : nextStatuses[order.status].length === 0
                              ? "No further changes"
                              : "Choose status"}
                        </option>

                        {nextStatuses[order.status].map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default AdminDashboardPage;