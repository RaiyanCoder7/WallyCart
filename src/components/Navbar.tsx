import { Link, NavLink } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";

import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { totalItems } = useCart();

  return (
    <nav className="navbar">
      <div>
        <Link to="/" className="navbar-title">
          🛒 WallyCart
        </Link>

        <p className="navbar-subtitle">
          Smarter Shopping, Healthier Choices
        </p>
      </div>

      <div className="navbar-links">
        <NavLink to="/" end>
          Home
        </NavLink>

        <NavLink to="/products">
          Products
        </NavLink>

        <NavLink to="/cart" className="cart-nav-link">
          <FaShoppingCart />

          <span>Cart</span>

          <span className="cart-badge">
            {totalItems}
          </span>
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;