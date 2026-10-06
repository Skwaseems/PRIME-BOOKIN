import React, {useState} from 'react';

import {hooks} from '../hooks';
import {Routes} from '../routes';
import {svg} from '../assets/svg';
import {DishType} from '../types';
import {components} from '../components';
import {actions} from '../store/actions';

export const Dish: React.FC = () => {
  const navigate = hooks.useNavigate();
  const dispatch = hooks.useDispatch();
  const location = hooks.useLocation();

  const dish: DishType = location.state.dish;

  const [opacity, setOpacity] = useState<number>(0);

  const {getDishQty} = hooks.useCartHandler();
  const {addToWishlist, removeFromWishlist, ifInWishlist} =
    hooks.useWishlistHandler();

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor('#F6F9F9', '#F6F9F9', dispatch);

  const renderHeader = (): JSX.Element => {
    return (
      <components.Header
        showGoBack={true}
        showBasket={true}
      />
    );
  };

  const renderImage = (): JSX.Element => {
    return (
      <section style={{position: 'relative', marginBottom: 30}}>
        <img
          src={dish.image}
          alt={dish.name}
          style={{
            width: '100%',
            height: 'auto',
          }}
        />
        {dish.isNew && (
          <img
            alt={dish.name}
            src={require('../assets/icons/14.png')}
            style={{
              width: 58.09,
              height: 'auto',
              position: 'absolute',
              top: 21,
              left: 20,
            }}
          />
        )}
        {dish.isHot && (
          <img
            alt='Hot'
            src={require('../assets/icons/15.png')}
            style={{
              width: 24,
              left: 0,
              top: 0,
              marginLeft: 20,
              marginTop: 20,
              height: 'auto',
              position: 'absolute',
            }}
          />
        )}
        <button
          style={{
            position: 'absolute',
            top: 25,
            right: 23,
            borderRadius: 2,
          }}
          onClick={(event) => {
            ifInWishlist(dish.id ?? 0)
              ? removeFromWishlist(dish, event)
              : addToWishlist(dish, event);
          }}
        >
          <svg.HeartBigSvg dish={dish} />
        </button>
      </section>
    );
  };

  const renderDetails = (): JSX.Element => {
    return (
      <section className='container'>
        <div
          className='row-center-space-between'
          style={{marginBottom: 12}}
        >
          <h3
            className='number-of-lines-1'
            style={{textTransform: 'capitalize'}}
          >
            {dish.name}
          </h3>
          <span
            className='t16'
            style={{marginLeft: 14, whiteSpace: 'nowrap'}}
          >
            {dish.kcal} kcal - {dish.weight}g
          </span>
        </div>
        <p className='t16'>{dish.description}</p>
      </section>
    );
  };

  const renderButtons = (): JSX.Element => {
    return (
      <section style={{padding: 20}}>
        <div
          className='row-center-space-between'
          style={{
            backgroundColor: 'var(--white-color)',
            borderRadius: 10,
            paddingLeft: 20,
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontFamily: 'DM Sans',
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            ${dish.price}
          </span>
          <div className='row-center'>
            <button
              style={{padding: '23px 20px', borderRadius: 4}}
              onClick={() => {
                dispatch(actions.removeFromCart(dish));
              }}
            >
              <svg.MinusSvg />
            </button>
            <div style={{marginLeft: 4, marginRight: 4}}>
              <span
                className='t14'
                style={{fontWeight: 700, color: 'var(--text-color)'}}
              >
                {getDishQty(dish.id ?? 0)}
              </span>
            </div>

            <button
              style={{padding: '23px 20px', borderRadius: 4}}
              onClick={() => {
                dispatch(actions.addToCart(dish));
              }}
            >
              <svg.PlusSvg />
            </button>
          </div>
        </div>
        <components.Button
          text='+ Add to cart'
          onClick={() => {
            dispatch(actions.addToCart(dish));
          }}
          containerStyle={{marginBottom: 10}}
        />
        <components.Button
          text='Reviews'
          colorScheme='secondary'
          onClick={() => {
            navigate(Routes.Reviews);
          }}
        />
      </section>
    );
  };

  const renderContent = (): JSX.Element => {
    return (
      <main className='scrollable'>
        {renderImage()}
        {renderDetails()}
        {renderButtons()}
      </main>
    );
  };

  return (
    <div
      id='screen'
      style={{opacity}}
    >
      {renderHeader()}
      {renderContent()}
    </div>
  );
};
