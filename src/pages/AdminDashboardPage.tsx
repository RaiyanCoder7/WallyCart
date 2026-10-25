
import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
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

type Product = {
  _id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  offer: string;
  healthScore: number;
};

type ProductsResponse = {
  success: boolean;
  data: Product[];
  message?: string;
};

type ProductFormData = {
  name: string;
  category: string;
  price: string;
  image: string;
  offer: string;
  healthScore: string;
};

const emptyProductForm: ProductFormData = {
  name: "",
  category: "",
  price: "",
  image: "",
  offer: "",
  healthScore: "5",
};

const nextStatuses: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (date: string) =>
  new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  // Order management state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  // Product management state
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productError, setProductError] = useState("");
  const [productNotice, setProductNotice] = useState("");
  const [productForm, setProductForm] =
    useState<ProductFormData>(emptyProductForm);
  const [editingProductId, setEditingProductId] =
    useState<string | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [deletingProductId, setDeletingProductId] =
    useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch("/orders");

      if (response.status === 401 || response.status === 403) {
        navigate("/admin/login", { replace: true });
        return;
      }

      const result = (await response.json()) as OrdersResponse;

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

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductError("");

    try {
      const response = await apiFetch("/products");

      if (response.status === 401 || response.status === 403) {
        navigate("/admin/login", { replace: true });
        return;
      }

      const result = (await response.json()) as ProductsResponse;

      if (!response.ok || !result.success || !Array.isArray(result.data)) {
        throw new Error(result.message || "Unable to load products.");
      }

      setProducts(result.data);
    } catch (err) {
      setProductError(
        err instanceof Error ? err.message : "Unable to load products."
      );
    } finally {
      setProductsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const updateStatus = async (
    orderId: string,
    status: OrderStatus
  ) => {
    setError("");
    setNotice("");
    setUpdatingId(orderId);

    try {
      const response = await apiFetch(`/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.status === 401 || response.status === 403) {
        navigate("/admin/login", { replace: true });
        return;
      }

      const result = (await response.json()) as {
        success: boolean;
        message?: string;
        data?: Order;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update order status.");
      }

      if (result.data) {
        setOrders((current) =>
          current.map((order) =>
            order._id === orderId ? result.data! : order
          )
        );
      } else {
        await loadOrders();
      }

      setNotice(`Order status updated to ${status}.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update order status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const logout = async () => {
    setError("");

    try {
      const response = await apiFetch("/admin/logout", {
        method: "POST",
      });

      const result = (await response.json()) as {
        success: boolean;
        message?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Admin logout failed.");
      }

      navigate("/admin/login", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Admin logout failed."
      );
    }
  };

  const resetProductForm = () => {
    setProductForm({ ...emptyProductForm });
    setEditingProductId(null);
  };

  const startEditingProduct = (product: Product) => {
    setEditingProductId(product._id);
    setProductForm({
      name: product.name,
      category: product.category,
      price: String(product.price),
      image: product.image,
      offer: product.offer ?? "",
      healthScore: String(product.healthScore),
    });
    setProductError("");
    setProductNotice("");
  };

  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProductError("");
    setProductNotice("");

    const price = Number(productForm.price);
    const healthScore = Number(productForm.healthScore);

    if (
      productForm.name.trim().length < 2 ||
      productForm.category.trim().length < 2 ||
      !productForm.image.trim() ||
      !Number.isFinite(price) ||
      price <= 0 ||
      !Number.isFinite(healthScore) ||
      healthScore < 0 ||
      healthScore > 10
    ) {
      setProductError(
        "Enter a valid name, category, image, positive price, and health score from 0 to 10."
      );
      return;
    }

    const payload = {
      name: productForm.name.trim(),
      category: productForm.category.trim(),
      price,
      image: productForm.image.trim(),
      offer: productForm.offer.trim(),
      healthScore,
    };

    setSavingProduct(true);

    try {
      const response = await apiFetch(
        editingProductId
          ? `/products/${editingProductId}`
          : "/products",
        {
          method: editingProductId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (response.status === 401 || response.status === 403) {
        navigate("/admin/login", { replace: true });
        return;
      }

      const result = (await response.json()) as {
        success: boolean;
        message?: string;
        data?: Product;
      };

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || "Unable to save product.");
      }

      setProductNotice(
        editingProductId
          ? "Product updated successfully."
          : "Product created successfully."
      );

      resetProductForm();
      await loadProducts();
    } catch (err) {
      setProductError(
        err instanceof Error ? err.message : "Unable to save product."
      );
    } finally {
      setSavingProduct(false);
    }
  };

  const deleteProduct = async (product: Product) => {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setProductError("");
    setProductNotice("");
    setDeletingProductId(product._id);

    try {
      const response = await apiFetch(`/products/${product._id}`, {
        method: "DELETE",
      });

      if (response.status === 401 || response.status === 403) {
        navigate("/admin/login", { replace: true });
        return;
      }

      const result = (await response.json()) as {
        success: boolean;
        message?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to delete product.");
      }

      setProducts((current) =>
        current.filter((item) => item._id !== product._id)
      );

      if (editingProductId === product._id) {
        resetProductForm();
      }

      setProductNotice("Product deleted successfully.");
    } catch (err) {
      setProductError(
        err instanceof Error ? err.message : "Unable to delete product."
      );
    } finally {
      setDeletingProductId(null);
    }
  };

  const totalRevenue = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((total, order) => total + order.totalAmount, 0);

  const awaitingFulfillment = orders.filter(
    (order) => order.status === "pending" || order.status === "confirmed"
  ).length;

  return (
    <main className="admin-dashboard">
      <div className="admin-container">
        <header className="admin-header">
          <div>
            <div className="admin-eyebrow">WallyCart / Store management</div>
            <h1 className="admin-title">Admin dashboard</h1>
            <p className="admin-subtitle">
              Manage orders, products, fulfillment, and store activity.
            </p>
          </div>

          <button
            type="button"
            className="admin-button admin-button-primary"
            onClick={() => void logout()}
          >
            Sign out
          </button>
        </header>

        {error && (
          <div className="admin-notice admin-error" role="alert">
            {error}
          </div>
        )}

        {notice && (
          <div className="admin-notice" role="status">
            {notice}
          </div>
        )}

        <section className="admin-metrics">
          <article className="admin-card">
            <div className="admin-metric-label">Total orders loaded</div>
            <div className="admin-metric-value">{orders.length}</div>
            <div className="admin-metric-note">
              Orders returned by the API
            </div>
          </article>

          <article className="admin-card">
            <div className="admin-metric-label">Revenue from loaded orders</div>
            <div className="admin-metric-value">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="admin-metric-note">
              Excludes cancelled orders
            </div>
          </article>

          <article className="admin-card">
            <div className="admin-metric-label">Awaiting fulfillment</div>
            <div className="admin-metric-value">
              {awaitingFulfillment}
            </div>
            <div className="admin-metric-note">
              Pending or confirmed orders
            </div>
          </article>
        </section>

        <section className="admin-card">
          <div className="admin-section-header">
            <div>
              <h2 className="admin-section-title">Recent orders</h2>
              <p className="admin-section-description">
                Review customer details and update order fulfillment status.
              </p>
            </div>

            <button
              type="button"
              className="admin-button"
              onClick={() => void loadOrders()}
              disabled={loading}
            >
              Refresh orders
            </button>
          </div>

          {loading ? (
            <div className="admin-empty">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="admin-empty">No orders found.</div>
          ) : (
            <div className="admin-orders">
              {orders.map((order) => (
                <article className="admin-order" key={order._id}>
                  <div className="admin-order-top">
                    <div>
                      <div className="admin-order-id">
                        Order #{order._id}
                      </div>
                      <div className="admin-muted">
                        {formatDate(order.createdAt)}
                      </div>
                    </div>

                    <span
                      className={`admin-status status-${order.status}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="admin-order-details">
                    <div>
                      <div className="admin-detail-label">Customer</div>
                      <div className="admin-detail-value">
                        {order.customer.fullName}
                        <br />
                        {order.customer.email}
                        <br />
                        {order.customer.phone}
                      </div>
                    </div>

                    <div>
                      <div className="admin-detail-label">Delivery address</div>
                      <div className="admin-detail-value">
                        {order.customer.address}
                        <br />
                        {order.customer.city}, {order.customer.pincode}
                      </div>
                    </div>
                  </div>

                  <div className="admin-order-items">
                    {order.items.map((item, index) => (
                      <div className="admin-order-item" key={`${item.name}-${index}`}>
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        <span>
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="admin-order-bottom">
                    <div>
                      <div className="admin-muted">
                        Subtotal: {formatCurrency(order.subtotal)}
                      </div>
                      <div className="admin-muted">
                        Delivery: {formatCurrency(order.deliveryFee)}
                      </div>
                      <div className="admin-total">
                        {formatCurrency(order.totalAmount)}
                      </div>
                    </div>

                    <div className="admin-status-control">
                      <label
                        className="admin-detail-label"
                        htmlFor={`status-${order._id}`}
                      >
                        Update status
                      </label>

                      {nextStatuses[order.status].length === 0 ? (
                        <span
                          className={`admin-status status-${order.status}`}
                        >
                          {order.status} — final
                        </span>
                      ) : (
                        <select
                          id={`status-${order._id}`}
                          className="admin-select"
                          value={order.status}
                          disabled={updatingId === order._id}
                          onChange={(event) =>
                            void updateStatus(
                              order._id,
                              event.target.value as OrderStatus
                            )
                          }
                        >
                          <option value={order.status}>
                            {order.status}
                          </option>
                          {nextStatuses[order.status].map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      )}

                      {updatingId === order._id && (
                        <span className="admin-muted">Updating...</span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="admin-card admin-products-section">
          <div className="admin-section-header">
            <div>
              <h2 className="admin-section-title">Product management</h2>
              <p className="admin-section-description">
                Add products, update pricing, and manage your storefront inventory.
              </p>
            </div>

            <button
              type="button"
              className="admin-button"
              onClick={() => void loadProducts()}
              disabled={productsLoading || savingProduct}
            >
              Refresh products
            </button>
          </div>

          {productError && (
            <div className="admin-notice admin-error" role="alert">
              {productError}
            </div>
          )}

          {productNotice && (
            <div className="admin-notice" role="status">
              {productNotice}
            </div>
          )}

          <form className="admin-product-form" onSubmit={saveProduct}>
            <div className="admin-product-form-header">
              <h3 className="admin-section-title">
                {editingProductId ? "Edit product" : "Add a product"}
              </h3>

              {editingProductId && (
                <button
                  type="button"
                  className="admin-button"
                  onClick={resetProductForm}
                  disabled={savingProduct}
                >
                  Cancel edit
                </button>
              )}
            </div>

            <div className="admin-product-fields">
              <label className="admin-product-field">
                <span>Product name</span>
                <input
                  required
                  minLength={2}
                  value={productForm.name}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      name: event.target.value,
                    })
                  }
                  placeholder="e.g. Organic Apple"
                />
              </label>

              <label className="admin-product-field">
                <span>Category</span>
                <input
                  required
                  minLength={2}
                  value={productForm.category}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      category: event.target.value,
                    })
                  }
                  placeholder="e.g. Fruits"
                />
              </label>

              <label className="admin-product-field">
                <span>Price (₹)</span>
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={productForm.price}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      price: event.target.value,
                    })
                  }
                  placeholder="31"
                />
              </label>

              <label className="admin-product-field">
                <span>Health score (0–10)</span>
                <input
                  required
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={productForm.healthScore}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      healthScore: event.target.value,
                    })
                  }
                />
              </label>

              <label className="admin-product-field admin-product-field-wide">
                <span>Image path or URL</span>
                <input
                  required
                  value={productForm.image}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      image: event.target.value,
                    })
                  }
                  placeholder="/apple.jpg or https://example.com/image.jpg"
                />
              </label>

              <label className="admin-product-field admin-product-field-wide">
                <span>Offer (optional)</span>
                <input
                  value={productForm.offer}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      offer: event.target.value,
                    })
                  }
                  placeholder="e.g. 10% off"
                />
              </label>
            </div>

            <div className="admin-product-form-actions">
              <button
                type="submit"
                className="admin-button admin-button-primary"
                disabled={savingProduct}
              >
                {savingProduct
                  ? "Saving..."
                  : editingProductId
                    ? "Save changes"
                    : "Add product"}
              </button>

              <button
                type="button"
                className="admin-button"
                onClick={resetProductForm}
                disabled={savingProduct}
              >
                Clear form
              </button>
            </div>
          </form>

          <div className="admin-products-list-header">
            <div>
              <h3 className="admin-section-title">Store products</h3>
              <p className="admin-section-description">
                {products.length} product
                {products.length === 1 ? "" : "s"} loaded
              </p>
            </div>
          </div>

          {productsLoading ? (
            <div className="admin-empty">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="admin-empty">
              No products found. Use the form above to add your first product.
            </div>
          ) : (
            <div className="admin-products-list">
              {products.map((product) => (
                <article className="admin-product" key={product._id}>
                  <div className="admin-product-info">
                    <div className="admin-product-image">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.visibility = "hidden";
                        }}
                      />
                    </div>

                    <div className="admin-product-copy">
                      <h4>{product.name}</h4>
                      <p>{product.category}</p>

                      <div className="admin-product-meta">
                        <span className="admin-product-price">
                          {formatCurrency(product.price)}
                        </span>
                        <span>Health score: {product.healthScore}/10</span>
                        {product.offer && <span>{product.offer}</span>}
                      </div>

                      <p className="admin-muted">
                        Image: {product.image}
                      </p>
                    </div>
                  </div>

                  <div className="admin-product-actions">
                    <button
                      type="button"
                      className="admin-button"
                      onClick={() => startEditingProduct(product)}
                      disabled={
                        savingProduct || deletingProductId !== null
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="admin-button admin-button-danger"
                      onClick={() => void deleteProduct(product)}
                      disabled={
                        savingProduct ||
                        deletingProductId === product._id
                      }
                    >
                      {deletingProductId === product._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
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