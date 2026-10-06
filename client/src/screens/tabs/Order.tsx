import React, {useState} from 'react';
import {useSelector} from 'react-redux';

import {hooks} from '../../hooks';
import {items} from '../../items';
import {Routes} from '../../routes';
import {RootState} from '../../store';
import type {DishType} from '../../types';
import {components} from '../../components';

export const Order: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const [opacity, setOpacity] = useState<number>(0);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor('#F6F9F9', '#F6F9F9', dispatch);

  const navigate = hooks.useNavigate();

  const {menuLoading, menu} = hooks.useGetMenu();

  const {list, subtotal, delivery, total} = useSelector(
    (state: RootState) => state.cartSlice,
  );

  const renderDishes = (): JSX.Element => {
    return (
      <section style={{marginBottom: 20}}>
        <ul style={{paddingTop: 10}}>
          {list.map((dish: DishType, index: number, array: DishType[]) => {
            const isLast = index === array.length - 1;

            return (
              <items.OrderItem
                key={dish.id}
                isLast={isLast}
                dish={dish}
              />
            );
          })}
        </ul>
      </section>
    );
  };

  const renderSummary = (): JSX.Element => {
    return (
      <section
        style={{
          padding: 20,
          borderRadius: 10,
          marginBottom: 20,
          border: '1px solid var(--main-turquoise)',
        }}
      >
        <div
          className='row-center-space-between'
          style={{marginBottom: 13}}
        >
          <span
            className='t14'
            style={{color: 'var(--main-color)', fontWeight: 500}}
          >
            Subtotal
          </span>
          <span
            className='t14'
            style={{color: 'var(--main-color)'}}
          >
            ${subtotal.toFixed(2)}
          </span>
        </div>
        <div
          className='row-center-space-between'
          style={{
            paddingBottom: 13,
            marginBottom: 20,
            borderBottom: '1px solid #DBE9F5',
          }}
        >
          <span className='t14'>Delivery</span>
          <span className='t14'>${delivery}</span>
        </div>
        <div className='row-center-space-between'>
          <h4>Total</h4>
          <h4>${total.toFixed(2)}</h4>
        </div>
      </section>
    );
  };

  const renderButton = (): JSX.Element => {
    return (
      <components.Button
        text='Checkout'
        onClick={() => {
          navigate(Routes.Checkout);
        }}
      />
    );
  };

  const renderContent = (): JSX.Element | null => {
    if (list.length === 0 && !menuLoading) return null;

    return (
      <main className='container scrollable'>
        {renderDishes()}
        {renderSummary()}
        {renderButton()}
      </main>
    );
  };

  const renderEmpty = (): JSX.Element | null => {
    if (list.length === 0 && !menuLoading) {
      return (
        <main className='scrollable container'>
          <section
            style={{
              paddingTop: '5%',
              paddingBottom: '14%',
              borderRadius: 10,
              marginTop: 10,
              backgroundColor: 'var(--white-color)',
            }}
          >
            <img
              src='https://george-fx.github.io/dinehub_api/assets/images/02.jpg'
              alt='Empty cart'
              style={{
                width: 'calc(100% - 80px)',
                height: 'auto',
                marginBottom: 20,
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            />
            <h2
              style={{
                textAlign: 'center',
                textTransform: 'capitalize',
                marginBottom: 14,
              }}
            >
              Your cart is empty!
            </h2>
            <p
              className='t16'
              style={{textAlign: 'center'}}
            >
              Looks like you haven't made <br />
              your order yet.
            </p>
          </section>
        </main>
      );
    }

    return null;
  };

  const renderShopNowButton = (): JSX.Element | null => {
    if (list.length > 0 || menuLoading) return null;

    return (
      <section style={{padding: '20px 20px 0 20px '}}>
        <components.Button
          text='Shop now'
          onClick={() =>
            navigate(Routes.MenuList, {state: {menuName: menu[0].name}})
          }
        />
      </section>
    );
  };

  const renderLoading = (): JSX.Element | null => {
    if (menuLoading) return <components.Loader />;

    return null;
  };

  return (
    <div
      id='screen'
      style={{opacity}}
    >
      {renderEmpty()}
      {renderContent()}
      {renderLoading()}
      {renderShopNowButton()}
    </div>
  );
};
