import React, {useState} from 'react';

import {hooks} from '../hooks';
import {actions} from '../store/actions';
import {components} from '../components';
import {Routes, TabScreens} from '../routes';

export const OrderHistoryEmpty: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();

  const [opacity, setOpacity] = useState<number>(0);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor('#F6F9F9', '#F6F9F9', dispatch);

  const renderHeader = (): JSX.Element => {
    return (
      <components.Header
        showGoBack={true}
        title='Order history'
      />
    );
  };

  const renderContent = (): JSX.Element => {
    return (
      <main className='scrollable container'>
        <section
          style={{
            height: '100%',
            borderRadius: 10,
            backgroundColor: 'var(--white-color)',
            flexDirection: 'column',
          }}
          className='center'
        >
          <img
            src='https://george-fx.github.io/dinehub_api/assets/images/10.jpg'
            alt='Account created'
            className='status-img'
            style={{marginBottom: 14}}
          />
          <h2 style={{marginBottom: 14}}>No Order History Yet!</h2>
          <p
            className='t16'
            style={{textAlign: 'center'}}
          >
            It looks like your order history is empty. <br /> Place your order
            now to start building <br /> your history!
          </p>
        </section>
      </main>
    );
  };

  const renderFooter = (): JSX.Element => {
    return (
      <footer style={{padding: 20}}>
        <components.Button
          text='Start shopping'
          onClick={() => {
            dispatch(actions.setScreen(TabScreens.Home));
            navigate(Routes.TabNavigator);
          }}
        />
      </footer>
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
