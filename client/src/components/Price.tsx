import React from 'react';

import {DishType} from '../types';

type Props = {
  dish: DishType;
};

export const Price: React.FC<Props> = ({dish}) => {
  return (
    <div
      className='row-center'
      style={{gap: 7}}
    >
      <span
        className='t14'
        style={{fontWeight: 500, color: 'var(--main-color)'}}
      >
        ${dish.price}
      </span>
      <div style={{width: 1, height: 10, backgroundColor: '#D5DCE3'}} />
      <span className='t14'>{dish.weight}g</span>
    </div>
  );
};
