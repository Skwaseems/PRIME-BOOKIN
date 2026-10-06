import React from 'react';
import {Dispatch} from 'redux';

import {DishType} from '../types';
import {actions} from '../store/actions';

export const cartHandler = (
  dish: DishType,
  dispatch: Dispatch,
  event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
) => {
  event.stopPropagation();
  dispatch(actions.addToCart(dish));
};
