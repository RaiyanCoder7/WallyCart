import type { Product } from "../types";

const products: Product[] = [
  {
    id: 1,
    name: "Organic Apple",
    category: "Fruits",
    price: 30,
    image: "/apple.jpg",
    offer: "10% off",
    healthScore: 9.2,
  },
  {
    id: 2,
    name: "Whole Wheat Bread",
    category: "Bakery",
    price: 40,
    image: "/bread.jpg",
    offer: "Buy 1 Get 1",
    healthScore: 8.5,
  },
  {
    id: 3,
    name: "Sugar-Free Dark Chocolate",
    category: "Snacks",
    price: 70,
    image: "/chocolate.jpg",
    offer: "Flat ₹10 off",
    healthScore: 8.9,
  },
  {
    id: 4,
    name: "Low-Fat Milk",
    category: "Dairy",
    price: 25,
    image: "/milk.jpg",
    offer: "5% off",
    healthScore: 9.0,
  },
];

export default products;