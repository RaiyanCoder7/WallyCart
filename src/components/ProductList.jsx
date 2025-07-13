const ProductList = ({ products, onClick }) => {
  return (
    <div className="product-grid">
      {products.map((product) => (
        <div
          key={product.id}
          onClick={() => onClick(product)}
          className="product-card"
        >
          <img
            src={product.image}
            alt={product.name}
            className="product-image"
          />
          <h3 className="product-name">{product.name}</h3>
          <p className="product-price">₹{product.price}</p>
          <span className="product-offer">{product.offer}</span>
        </div>
      ))}
    </div>
  );
};

export default ProductList;