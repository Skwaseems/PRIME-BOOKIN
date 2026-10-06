import React, {useState} from 'react';

import {hooks} from '../hooks';
import {Routes} from '../routes';
import {components} from '../components';

export const OrderFailed: React.FC = () => {
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
            src='https://george-fx.github.io/dinehub_api/assets/images/11.jpg'
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
            Sorry! Your order <br /> has failed!
          </h2>
          <p
            className='t16'
            style={{textAlign: 'center'}}
          >
            Something went wrong. Please try <br /> again to continue your
            order.
          </p>
        </section>
      </main>
    );
  };

  const renderFooter = (): JSX.Element => {
    return (
      <section style={{padding: 20}}>
        <components.Button
          text='Try again'
          containerStyle={{marginBottom: 14}}
          onClick={() => {
            navigate(Routes.TabNavigator);
          }}
        />
        <components.Button
          text='Go back to the order'
          colorScheme='secondary'
          onClick={() => {
            navigate(Routes.TabNavigator);
          }}
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
