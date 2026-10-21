
import type { ApiProduct, Product } from "../types";

const API_BASE_URL = `${
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
}/api`;

interface ProductsResponse {
  success: boolean;
  data: ApiProduct[];
}

export const getProducts = async (): Promise<Product[]> => {
  const response = await fetch(`${API_BASE_URL}/products`);

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`);
  }

  const result: ProductsResponse = await response.json();

  if (!result.success || !Array.isArray(result.data)) {
    throw new Error("Invalid products response from the API.");
  }

  return result.data.map((product) => ({
    id: product._id,
    name: product.name,
    category: product.category,
    price: product.price,
    image: product.image,
    offer: product.offer,
    healthScore: product.healthScore,
  }));
};
