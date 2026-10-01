import type { Product } from "../types";

interface AROverlayProps {
  product: Product | null;
  addToCart: (product: Product) => void;
}

const AROverlay = ({
  product,
  addToCart,
}: AROverlayProps) => {
  if (!product) {
    return (
      <div className="ar-overlay empty-preview">
        👈 Select a product to preview it here with smart AR info.
      </div>
    );
  }

  return (
    <div className="ar-overlay">
      <img
        src={product.image}
        alt={product.name}
        className="ar-image"
      />

      <div className="ar-info">
        <h2>{product.name}</h2>

        <p>Price: ₹{product.price}</p>

        <p className="offer">{product.offer}</p>

        <p className="health-score">
          Health Score: {product.healthScore}
        </p>
      </div>

      <button
        onClick={() => addToCart(product)}
        className="add-cart-btn"
      >
        ➕ Add to Cart
      </button>
    </div>
  );
};

export default AROverlay;