import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import type {
  CartItem,
  Product,
} from "../types";

interface CartContextValue {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  updateQuantity: (id: number, change: number) => void;
  removeItem: (id: number) => void;
  totalItems: number;
  total: number;
}

const CartContext = createContext<
  CartContextValue | undefined
>(undefined);

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider = ({
  children,
}: CartProviderProps) => {
  const [cartItems, setCartItems] =
    useState<CartItem[]>(() => {
      try {
        const savedCart =
          localStorage.getItem("wallycart-cart");

        return savedCart
          ? (JSON.parse(savedCart) as CartItem[])
          : [];
      } catch {
        return [];
      }
    });

  useEffect(() => {
    localStorage.setItem(
      "wallycart-cart",
      JSON.stringify(cartItems)
    );
  }, [cartItems]);

  const addToCart = (product: Product): void => {
    setCartItems((prev) => {
      const existingItem = prev.find(
        (item) => item.id === product.id
      );

      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (
    id: number,
    change: number
  ): void => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity + change,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: number): void => {
    setCartItems((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const total = cartItems.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeItem,
        totalItems,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
};