import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaLeaf, FaAppleAlt, FaBreadSlice, FaCoffee } from "react-icons/fa";

import { useEffect, useState } from "react";
import { getProducts } from "../services/productService";
import type { Product } from "../types";

const categories = [
  {
    name: "Fruits",
    description: "Fresh everyday picks",
    icon: FaAppleAlt,
  },
  {
    name: "Bakery",
    description: "Freshly baked essentials",
    icon: FaBreadSlice,
  },
  {
    name: "Dairy",
    description: "Daily nutrition",
    icon: FaCoffee,
  },
  {
    name: "Snacks",
    description: "Treat yourself",
    icon: FaLeaf,
  },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProducts();

        if (!cancelled) {
          setProducts(data);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load products. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="home-page">

      {/* HERO */}
      <section className="home-hero">
        <div className="hero-content">
          <span className="hero-eyebrow">
            SMARTER EVERYDAY SHOPPING
          </span>

          <h1>
            Good food.
            <br />
            <span>Smart choices.</span>
          </h1>

          <p>
            Discover everyday essentials, explore thoughtful
            choices, and shop smarter without stretching
            your budget.
          </p>

          <button
            className="hero-button"
            onClick={() => navigate("/products")}
          >
            Explore Products
            <FaArrowRight />
          </button>

          <div className="hero-trust">
            <FaLeaf />
            Thoughtful choices for everyday living
          </div>
        </div>

        <div className="hero-visual">
          <img
            src="/apple.jpg"
            alt="Fresh organic apple"
          />

          <div className="hero-floating-card">
            <span>Today's pick</span>
            <strong>Fresh & simple</strong>
            <small>Everyday essentials</small>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="home-section">
        <div className="home-section-heading">
          <div>
            <span className="section-eyebrow">
              EXPLORE
            </span>
            <h2>Shop by category</h2>
            <p>Find what you need, faster.</p>
          </div>

          <button
            className="text-link"
            onClick={() => navigate("/products")}
          >
            View all <FaArrowRight />
          </button>
        </div>

        <div className="category-grid">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <button
                type="button"
                className="category-card"
                key={category.name}
                onClick={() => navigate("/products")}
              >
                <span className="category-icon">
                  <Icon />
                </span>

                <strong>{category.name}</strong>

                <small>{category.description}</small>
              </button>
            );
          })}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="home-section">
        <div className="home-section-heading">
          <div>
            <span className="section-eyebrow">
              HANDPICKED FOR YOU
            </span>
            <h2>Popular products</h2>
            <p>Everyday essentials worth adding to your cart.</p>
          </div>

          <button
            className="text-link"
            onClick={() => navigate("/products")}
          >
            Browse all <FaArrowRight />
          </button>
        </div>

        
        <div className="featured-product-grid">
          {loading ? (
            <p>Loading products...</p>
          ) : error ? (
            <div>
              <p role="alert">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          ) : products.length === 0 ? (
            <p>No products available right now.</p>
          ) : (
            
            products.map((product) => (
              <article
                className="featured-product-card"
                key={product.id}
              >
                <div
                  className="featured-product-image"
                  onClick={() => navigate(`/products/${product.id}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      navigate(`/products/${product.id}`);
                    }
                  }}
                >
                  <img src={product.image} alt={product.name} />
                </div>

                <div className="featured-product-info">
                  <span className="featured-product-category">
                    {product.category}
                  </span>

                  <h3>{product.name}</h3>

                  <div className="featured-product-bottom">
                    <strong>₹{product.price}</strong>

                    {product.offer && (
                      <span className="featured-product-offer">
                        {product.offer}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="featured-product-button"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    View product <FaArrowRight />
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

      </section>

      {/* SMART SHOPPING */}
      <section className="smart-shopping-banner">
        <div>
          <span className="section-eyebrow">
            SHOP WITH PURPOSE
          </span>

          <h2>
            Better choices.
            <br />
            Smarter shopping.
          </h2>

          <p>
            WallyCart is being built to help you discover
            products based on your preferences and budget.
          </p>
        </div>

        <button
          type="button"
          className="smart-shopping-button"
          onClick={() => navigate("/products")}
        >
          Start exploring <FaArrowRight />
        </button>
      </section>

    </div>
  );
};

export default HomePage;