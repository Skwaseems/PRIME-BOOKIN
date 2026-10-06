import {useDispatch as useDispatchRedux} from 'react-redux';
import {useNavigate as useNavigateRedux} from 'react-router-dom';
import {useLocation as useLocationRedux} from 'react-router-dom';

import {Action} from 'redux';
import {RootState} from '../store';
import {ThunkDispatch} from 'redux-thunk';

import {useGetMenu} from './useGetMenu';
import {useGetOrders} from './useGetOrders';
import {useGetDishes} from './useGetDishes';
import {useGetReviews} from './useGetReviews';
import {useGetCarousel} from './useGetCarousel';
import {useGetPromocodes} from './useGetPromocodes';
import {useGetNotifications} from './useGetNotifications';

import {useOpacity} from './useOpacity';
import {useThemeColor} from './useThemeColor';
import {useScrollToTop} from './useScrollToTop';

import {useCartHandler} from './useCartHandler';
import {useWishlistHandler} from './useWishlistHandler';

export const useNavigate = () => useNavigateRedux();
export const useDispatch = () =>
  useDispatchRedux<ThunkDispatch<RootState, void, Action>>();
export const useLocation = () => useLocationRedux();

export const hooks = {
  useGetMenu,
  useOpacity,
  useNavigate,
  useDispatch,
  useLocation,
  useGetDishes,
  useGetOrders,
  useGetReviews,
  useThemeColor,
  useCartHandler,
  useGetCarousel,
  useScrollToTop,
  useGetPromocodes,
  useWishlistHandler,
  useGetNotifications,
};
