import * as React from 'react';
import {useSelector} from 'react-redux';

import {DishType} from '../../types';
import {RootState} from '../../store';

type Props = {
  dish: DishType;
  style?: React.CSSProperties;
};

export const HeartSvg: React.FC<Props> = ({dish, style}) => {
  const wishlist = useSelector((state: RootState) => state.wishlistSlice);

  const ifInWishlist = wishlist.list.find((item) => item.id === dish.id);

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={16}
      height={16}
      fill='none'
      style={style}
    >
      <path
        fill={ifInWishlist ? 'var(--accent-color)' : 'transparent'}
        stroke={ifInWishlist ? 'var(--accent-color)' : 'var(--text-color)'}
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M13.893 3.073a3.667 3.667 0 0 0-5.186 0L8 3.78l-.707-.707A3.668 3.668 0 0 0 2.107 8.26l.706.707L8 14.153l5.187-5.186.706-.707a3.667 3.667 0 0 0 0-5.187v0Z'
      />
    </svg>
  );
};
