export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  offer: string;
  healthScore: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ChatMessage {
  user: string;
  bot: string;
}