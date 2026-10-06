import React from 'react';

import {hooks} from '../hooks';
import {svg} from '../assets/svg';
import {DishType} from '../types';

type Props = {
  dish: DishType;
  isLast: boolean;
};

export const MenuListItem: React.FC<Props> = ({dish, isLast}) => {
  const navigate = hooks.useNavigate();

  const {addToCart, getDishQty} = hooks.useCartHandler();
  const {ifInWishlist, addToWishlist, removeFromWishlist} =
    hooks.useWishlistHandler();

  const qty = getDishQty(dish.id ?? 0);

  return (
    <li
      style={{
        borderRadius: 10,
        padding: '14px 14px',
        backgroundColor: 'var(--white-color)',
        marginBottom: isLast ? 0 : 14,
        position: 'relative',
      }}
      className='row-center'
      onClick={() => navigate(`/dish/${dish.id}`, {state: {dish}})}
    >
      <img
        src={dish.image}
        alt={dish.name}
        style={{width: 117, height: 'auto', borderRadius: 10, marginRight: 10}}
      />
      {dish.isHot && (
        <img
          alt='Hot'
          src={require('../assets/icons/15.png')}
          style={{
            width: 18,
            left: 0,
            top: 0,
            marginLeft: 14,
            marginTop: 14,
            height: 'auto',
            position: 'absolute',
          }}
        />
      )}
      {dish.isNew && (
        <img
          alt='New'
          src={require('../assets/icons/14.png')}
          style={{
            width: 34,
            height: 'auto',
            margin: 14,
            left: 0,
            top: 0,
            position: 'absolute',
          }}
        />
      )}
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <span
          className='t14'
          style={{
            marginBottom: 4,
            display: 'block',
            color: 'var(--main-color)',
            textTransform: 'capitalize',
          }}
        >
          {dish.name}
        </span>
        <p
          className='number-of-lines-2 t10'
          style={{
            fontSize: 10,
            color: 'var(--text-color)',
            lineHeight: 1.5,
            marginBottom: 4,
          }}
        >
          {dish.description}
        </p>
        <span
          className='t10'
          style={{marginBottom: 8}}
        >
          {dish.kcal} kcal - {dish.weight}g
        </span>
        <span
          className='t14'
          style={{
            color: 'var(--main-color)',
          }}
        >
          ${dish.price}
        </span>
      </div>
      <button
        style={{
          padding: 14,
          position: 'absolute',
          right: 0,
          top: 0,
          borderRadius: 4,
        }}
        onClick={(event) => {
          ifInWishlist(dish.id ?? 0)
            ? removeFromWishlist(dish, event)
            : addToWishlist(dish, event);
        }}
      >
        <svg.HeartSvg dish={dish} />
      </button>
      {qty > 0 && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            height: 21,
            minWidth: 21,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: 14,
            borderRadius: 12,
            backgroundColor: 'var(--main-turquoise)',
          }}
        >
          <span
            className='t14'
            style={{color: 'var(--white-color)'}}
          >
            {qty}
          </span>
        </div>
      )}
      {qty === 0 && (
        <button
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            padding: 14,
            borderRadius: 4,
          }}
          onClick={(event) => {
            addToCart(dish, event);
          }}
        >
          <svg.AddSvg />
        </button>
      )}
    </li>
  );
};
