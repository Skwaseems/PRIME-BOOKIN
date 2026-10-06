import React, {useState} from 'react';

import {hooks} from '../hooks';
import {Routes} from '../routes';
import {actions} from '../store/actions';
import {components} from '../components';

export const OrderSuccessful: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();

  const [opacity, setOpacity] = useState<number>(0);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor('#F6F9F9', '#F6F9F9', dispatch);

  const renderContent = (): JSX.Element => {
    return (
      <main className='scrollable container'>
        <section
          style={{
            height: '100%',
            marginTop: 10,
            borderRadius: 10,
            backgroundColor: 'var(--white-color)',
          }}
        >
          <img
            src='https://george-fx.github.io/dinehub_api/assets/images/03.jpg'
            alt='Order successful'
            className='status-img'
          />
          <h2
            style={{
              textTransform: 'capitalize',
              textAlign: 'center',
              marginBottom: 14,
            }}
          >
            Thank you for <br /> your order!
          </h2>
          <p
            className='t16'
            style={{textAlign: 'center'}}
          >
            Your order will be delivered on time. <br /> Thank you!
          </p>
        </section>
      </main>
    );
  };

  const renderFooter = (): JSX.Element => {
    return (
      <section style={{padding: 20}}>
        <components.Button
          text='Continue Shopping'
          containerStyle={{marginBottom: 14}}
          onClick={() => {
            dispatch(actions.resetCart());
            navigate(Routes.TabNavigator);
          }}
        />
        <components.Button
          text='View orders'
          colorScheme='secondary'
        />
      </section>
    );
  };

  return (
    <div
      id='screen'
      style={{opacity}}
    >
      {renderContent()}
      {renderFooter()}
    </div>
  );
};
