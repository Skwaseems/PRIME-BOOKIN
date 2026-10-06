type ProductType = {
  id: number;
  name: string;
  quantity: number;
  price: number;
};

type OrderStatus = 'shipping' | 'delivered' | 'canceled';

export type OrderType = {
  id: number;
  date: string;
  time: string;
  status: OrderStatus;
  total: number;
  discount: number;
  delivery: number;
  products: ProductType[];
};
