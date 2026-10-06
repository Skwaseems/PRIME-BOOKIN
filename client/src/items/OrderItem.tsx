import React from 'react';

import {hooks} from '../hooks';
import {svg} from '../assets/svg';
import type {DishType} from '../types';

type Props = {
  dish: DishType;
  isLast: boolean;
};

export const OrderItem: React.FC<Props> = ({dish, isLast}) => {
  const navigate = hooks.useNavigate();

  const {addToCart, removeFromCart, getDishQty} = hooks.useCartHandler();

  return (
    <li
      style={{
        backgroundColor: 'var(--white-color)',
        borderRadius: 10,
        paddingLeft: 12,
        display: 'flex',
        alignItems: 'center',
        height: 111,
        flexDirection: 'row',
        marginBottom: isLast ? 0 : 14,
        position: 'relative',
      }}
      onClick={() => navigate(`/dish/${dish.id}`, {state: {dish}})}
    >
      <img
        src={dish.image}
        alt={dish.name}
        style={{width: 87, height: 'auto', marginRight: 14}}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginRight: 'auto',
          height: '100%',
          justifyContent: 'center',
          gap: 3,
        }}
      >
        <span className='t14'>{dish.name}</span>
        <span
          className='t10'
          style={{marginBottom: 5}}
        >
          {dish.kcal} kcal - {dish.weight}g
        </span>
        <span
          className='t14'
          style={{color: 'var(--main-color)', fontWeight: 500}}
        >
          ${dish.price}
        </span>
      </div>
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          style={{padding: '14px 14px 4px 14px', borderRadius: 4}}
          onClick={(event) => {
            removeFromCart(dish, event);
          }}
        >
          <svg.RemoveSvg />
        </button>
        <span
          className='t12'
          style={{lineHeight: 1}}
        >
          {getDishQty(dish.id ?? 0)}
        </span>
        <button
          style={{padding: '4px 14px 14px 14px', borderRadius: 4}}
          onClick={(event) => {
            addToCart(dish, event);
          }}
        >
          <svg.AddSvg />
        </button>
      </div>
      {dish.isNew && (
        <img
          alt='New'
          src={require('../assets/icons/14.png')}
          style={{
            width: 34,
            left: 7,
            top: 7,
            height: 'auto',
            position: 'absolute',
          }}
        />
      )}
      {dish.isHot && (
        <img
          alt='Hot'
          src={require('../assets/icons/15.png')}
          style={{
            width: 34,
            left: 7,
            top: 7,
            height: 'auto',
            position: 'absolute',
          }}
        />
      )}
    </li>
  );
};
