import React, {useState} from 'react';

import {hooks} from '../hooks';
import {Routes} from '../routes';
import {components} from '../components';

export const SignUpAccountCreated: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();

  const [opacity, setOpacity] = useState<number>(0);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor('#F6F9F9', '#F6F9F9', dispatch);

  const renderHeader = (): JSX.Element => {
    return <components.Header />;
  };

  const renderContent = (): JSX.Element => {
    return (
      <main className='scrollable container'>
        <section
          style={{
            backgroundColor: 'var(--white-color)',
            paddingLeft: 20,
            paddingRight: 20,
            borderRadius: 10,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <img
            src='https://george-fx.github.io/dine-hub/05.jpg'
            alt='Account created'
            className='status-img'
            style={{marginBottom: 14}}
          />
          <h2 style={{textAlign: 'center', marginBottom: 14}}>
            Account Created!
          </h2>
          <p
            className='t16'
            style={{textAlign: 'center'}}
          >
            Your account had been created <br /> successfully.
          </p>
        </section>
      </main>
    );
  };

  const renderFooter = (): JSX.Element => {
    return (
      <footer style={{padding: 20}}>
        <components.Button
          text='Get started'
          onClick={() => {
            navigate('/', {replace: true});
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
