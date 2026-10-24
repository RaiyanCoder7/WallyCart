import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import { CartProvider } from "./context/CartContext";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

import "./index.css";

function App() {
  return (
    <CartProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/products"
            element={<ProductsPage />}
          />
          <Route
            path="/products/:id"
            element={<ProductDetailsPage />}
          />
          <Route
            path="/cart"
            element={<CartPage />}
          />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route
            path="/order-success"
            element={<OrderSuccessPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
    </CartProvider>
  );
}

export default App;