export interface Product {
  id: string | number;
  name: string;
  category: string;
  price: number;
  image: string;
  offer: string;
  healthScore: number;
}


export interface ApiProduct {
  _id: string;
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