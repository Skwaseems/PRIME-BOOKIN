import React from 'react';

import {DishType} from '../types';

type Props = {
  dish: DishType;
  containerStyle?: React.CSSProperties;
};

export const Name: React.FC<Props> = ({dish, containerStyle}) => {
  return (
    <span
      style={{...containerStyle}}
      className='t14 number-of-lines-1'
    >
      {dish.name}
    </span>
  );
};
