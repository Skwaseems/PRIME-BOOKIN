import {useSelector} from 'react-redux';

import {RootState} from '../store';

export const dishQty = (id: number): number => {
  const cart = useSelector((state: RootState) => state.cartSlice);
  const ifDishInCart = cart.list.find((dish) => dish.id === id);
  const qty = ifDishInCart ? ifDishInCart.quantity ?? 0 : 0;
  return qty;
};
