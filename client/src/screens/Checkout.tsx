import React, {useState} from 'react';
import {useSelector} from 'react-redux';

import {hooks} from '../hooks';
import {Routes} from '../routes';
import {svg} from '../assets/svg';
import {RootState} from '../store';
import {components} from '../components';

export const Checkout: React.FC = () => {
  const dispatch = hooks.useDispatch();

  const {list, delivery, total, discount} = useSelector(
    (state: RootState) => state.cartSlice,
  );

  const navigate = hooks.useNavigate();

  const [opacity, setOpacity] = useState<number>(0);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor('#F6F9F9', '#F6F9F9', dispatch);

  const renderHeader = (): JSX.Element => {
    return (
      <components.Header
        title='Checkout'
        showGoBack={true}
      />
    );
  };

  const renderSummary = (): JSX.Element => {
    return (
      <section
        style={{
          padding: 20,
          borderRadius: 10,
          marginTop: 10,
          marginBottom: 14,
          border: '1px solid var(--main-turquoise)',
        }}
      >
        <div
          className='row-center-space-between'
          style={{
            paddingBottom: 20,
            marginBottom: 20,
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <span
            className='t18'
            style={{color: 'var(--main-color)', textTransform: 'capitalize'}}
          >
            My order
          </span>
          <span
            className='t18'
            style={{color: 'var(--main-color)'}}
          >
            ${total.toFixed(2)}
          </span>
        </div>
        <ul>
          {list.map((dish) => {
            return (
              <li
                key={dish.id}
                className='row-center-space-between'
                style={{marginBottom: 8}}
              >
                <span className='t14'>{dish.name}</span>
                <span className='t14'>
                  {dish.quantity} x ${dish.price}
                </span>
              </li>
            );
          })}
        </ul>
        <div
          className='row-center-space-between'
          style={{marginBottom: 8}}
        >
          <span className='t14'>Discount</span>
          <span className='t14'>- ${discount}</span>
        </div>
        <div className='row-center-space-between'>
          <span className='t14'>Delivery</span>
          <span className='t14'>${delivery}</span>
        </div>
      </section>
    );
  };

  const renderShippingDetails = (): JSX.Element => {
    return (
      <section
        style={{
          padding: 20,
          borderRadius: 10,
          marginBottom: 14,
          backgroundColor: 'var(--white-color)',
        }}
        className='row-center-space-between clickable'
      >
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <span
            className='t14 number-of-lines-1'
            style={{
              fontWeight: 500,
              marginBottom: 8,
              color: 'var(--main-color)',
              textTransform: 'capitalize',
            }}
          >
            Shipping details
          </span>
          <span className='t12 number-of-lines-1'>
            8000 S Kirkland Ave, Chicago, IL 6065...
          </span>
        </div>
        <svg.RightArrowSvg />
      </section>
    );
  };

  const renderPaymentMethod = (): JSX.Element => {
    return (
      <section
        style={{
          padding: 20,
          borderRadius: 10,
          backgroundColor: 'var(--white-color)',
        }}
        className='row-center-space-between clickable'
      >
        <div style={{display: 'flex', flexDirection: 'column'}}>
          <span
            className='t14 number-of-lines-1'
            style={{
              fontWeight: 500,
              marginBottom: 8,
              color: 'var(--main-color)',
              textTransform: 'capitalize',
            }}
          >
            Payment method
          </span>
          <span className='t12 number-of-lines-1'>4947 **** **** 3157</span>
        </div>
        <svg.RightArrowSvg />
      </section>
    );
  };

  const renderFooter = (): JSX.Element => {
    return (
      <section style={{padding: 20}}>
        <components.Button
          text='Confirm order'
          onClick={() => navigate(Routes.OrderSuccessful)}
          // onClick={() => navigate(Routes.OrderFailed)}
        />
      </section>
    );
  };

  const renderContent = (): JSX.Element => {
    return (
      <main className='scrollable container'>
        {renderSummary()}
        {renderShippingDetails()}
        {renderPaymentMethod()}
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
      {renderFooter()}
    </div>
  );
};
