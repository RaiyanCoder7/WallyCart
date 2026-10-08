import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaMinus,
  FaPlus,
  FaShoppingCart,
  FaCheckCircle,
} from "react-icons/fa";

import products from "../data/products";
import { useCart } from "../context/CartContext";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const product = products.find(
    (item) => item.id === Number(id)
  );

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product not found</h2>
        <p>The product you're looking for doesn't exist.</p>

        <button
          type="button"
          onClick={() => navigate("/products")}
        >
          Back to Products
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }

    setAdded(true);
  };

  return (
    <div className="product-details-page">

      <button
        type="button"
        className="back-button"
        onClick={() => navigate("/products")}
      >
        <FaArrowLeft />
        Back to Products
      </button>

      <div className="product-details">

        {/* Product Image */}
        <div className="product-details-image">
          <img
            src={product.image}
            alt={product.name}
          />

          <span className="details-offer">
            {product.offer}
          </span>
        </div>

        {/* Product Information */}
        <div className="product-details-info">

          <span className="details-category">
            {product.category}
          </span>

          <h1>{product.name}</h1>

          <div className="details-price">
            ₹{product.price}
          </div>

          <div className="details-rating">
            <FaCheckCircle />
            Available in WallyCart
          </div>

          <p className="details-description">
            Discover this everyday essential from WallyCart.
            Explore its details, choose your quantity,
            and add it to your shopping cart.
          </p>

          <div className="details-divider" />

          <div className="quantity-section">
            <span>Quantity</span>

            <div className="quantity-control">
              <button
                type="button"
                onClick={() =>
                  setQuantity((prev) => Math.max(1, prev - 1))
                }
                disabled={quantity === 1}
                aria-label="Decrease quantity"
              >
                <FaMinus />
              </button>

              <strong>{quantity}</strong>

              <button
                type="button"
                onClick={() =>
                  setQuantity((prev) => prev + 1)
                }
                aria-label="Increase quantity"
              >
                <FaPlus />
              </button>
            </div>
          </div>

          <div className="details-total">
            <span>Total</span>
            <strong>₹{product.price * quantity}</strong>
          </div>

          <button
            type="button"
            className="details-add-button"
            onClick={handleAddToCart}
          >
            {added ? <FaCheckCircle /> : <FaShoppingCart />}

            {added ? "Added to Cart" : "Add to Cart"}
          </button>

          {added && (
            <button
              type="button"
              className="view-cart-button"
              onClick={() => navigate("/cart")}
            >
              View Cart
            </button>
          )}

          <div className="details-benefits">
            <div>
              <FaCheckCircle />
              Easy quantity selection
            </div>

            <div>
              <FaCheckCircle />
              Cart updates instantly
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;