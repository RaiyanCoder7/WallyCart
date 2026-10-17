
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getProducts } from "../services/productService";
import { useCart } from "../context/CartContext";
import type { Product } from "../types";

const ProductsPage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");

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

  const categories = [
    "All",
    ...new Set(products.map((product) => product.category)),
  ];

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" ||
        product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    if (sortBy === "price-low") {
      result = [...result].sort((a, b) => a.price - b.price);
    }

    if (sortBy === "price-high") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    if (sortBy === "name") {
      result = [...result].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    return result;
  }, [products, search, selectedCategory, sortBy]);

  return (
    <div className="products-page">
      <section className="products-header">
        <div>
          <span className="section-eyebrow">
            THE WALLYCART COLLECTION
          </span>

          <h1>Explore products</h1>

          <p>
            Find everyday essentials and discover
            something you love.
          </p>
        </div>

        <div className="products-count">
          {loading ? "Loading products..." : `${filteredProducts.length} products`}
        </div>
      </section>

      <section className="products-toolbar">
        <div className="products-search">
          <span>⌕</span>

          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search products"
          />
        </div>

        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          aria-label="Sort products"
        >
          <option value="featured">Featured</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name">Name: A to Z</option>
        </select>
      </section>

      <div className="products-categories">
        {categories.map((category) => (
          <button
            type="button"
            key={category}
            className={
              selectedCategory === category
                ? "category-filter active"
                : "category-filter"
            }
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="products-empty">
          <p>Loading products...</p>
        </div>
      ) : error ? (
        <div className="products-empty">
          <h2>Unable to load products</h2>
          <p role="alert">{error}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="products-empty">
          <h2>No products found</h2>
          <p>
            Try another search or choose a different category.
          </p>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedCategory("All");
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="featured-product-grid">
          {filteredProducts.map((product) => (
            <article
              className="featured-product-card"
              key={product.id}
            >
              <button
                type="button"
                className="featured-product-image"
                onClick={() =>
                  navigate(`/products/${product.id}`)
                }
              >
                <img src={product.image} alt={product.name} />

                {product.offer && (
                  <span className="featured-offer">
                    {product.offer}
                  </span>
                )}
              </button>

              <div className="featured-product-info">
                <span className="product-category">
                  {product.category}
                </span>

                <button
                  type="button"
                  className="product-title-button"
                  onClick={() =>
                    navigate(`/products/${product.id}`)
                  }
                >
                  {product.name}
                </button>

                <div className="featured-product-bottom">
                  <strong>₹{product.price}</strong>

                  <button
                    type="button"
                    className="quick-add-button"
                    onClick={() => addToCart(product)}
                    aria-label={`Add ${product.name} to cart`}
                  >
                    +
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;