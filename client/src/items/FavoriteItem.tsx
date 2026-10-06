import React from 'react';
import {useSelector} from 'react-redux';

import {hooks} from '../hooks';
import {svg} from '../assets/svg';
import {RootState} from '../store';
import type {DishType} from '../types';
import {components} from '../components';
import {actions} from '../store/actions';

type Props = {
  dish: DishType;
};

export const FavoriteItem: React.FC<Props> = ({dish}) => {
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();

  const wishlist = useSelector((state: RootState) => state.wishlistSlice);

  const ifInWishlist = wishlist.list.find((item) => item.id === dish.id);

  const cartHandler = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    console.log('Added to cart:', dish);
    event.stopPropagation();
    dispatch(actions.addToCart(dish));
  };

  const wishlistHandler = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.stopPropagation();
    if (ifInWishlist) {
      dispatch(actions.removeFromWishlist(dish));
    } else {
      dispatch(actions.addToWishlist(dish));
    }
  };

  return (
    <li
      style={{
        padding: 14,
        paddingTop: 8,
        borderRadius: 10,
        position: 'relative',
        backgroundColor: 'var(--white-color)',
      }}
      onClick={() => navigate(`/dish/${dish.id}`, {state: {dish}})}
    >
      <img
        src={dish.image}
        alt={dish.name}
        style={{width: '100%', marginBottom: 10}}
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
      <button
        onClick={wishlistHandler}
        style={{
          position: 'absolute',
          right: 0,
          bottom: 72 - 15,
          padding: 15,
          borderRadius: 10,
        }}
      >
        <svg.HeartSvg dish={dish} />
      </button>
      <components.Name
        dish={dish}
        containerStyle={{marginBottom: 3}}
      />
      <components.Price dish={dish} />
      <button
        onClick={cartHandler}
        style={{
          position: 'absolute',
          padding: 14,
          right: 0,
          bottom: 0,
          borderRadius: 10,
        }}
      >
        <svg.PlusSvg />
      </button>
    </li>
  );
};
