
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginAdmin } from "../services/adminService";
import "../styles/AdminLoginPage.css";

function AdminLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await loginAdmin(email, password);
      navigate("/admin", { replace: true });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <Link to="/" className="admin-back-link">
          ← Back to WallyCart
        </Link>

        <div className="admin-login-heading">
          <div className="admin-brand-mark">W</div>
          <p className="admin-eyebrow">WALLYCART ADMINISTRATION</p>
          <h1>Welcome back.</h1>
          <p className="admin-description">
            Sign in to manage orders and monitor your store.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-field">
            <label htmlFor="admin-email">Admin email</label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="admin-field">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your admin password"
            />
          </div>

          {error && (
            <p className="admin-login-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="admin-login-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in securely"}
            {!isSubmitting && <span aria-hidden="true"> →</span>}
          </button>
        </form>

        <div className="admin-security-note">
          <span aria-hidden="true">◆</span>
          Restricted access · Authorized administrator only
        </div>
      </section>
    </main>
  );
}

export default AdminLoginPage;