import React, {useState} from 'react';

import {hooks} from '../hooks';
import {Routes} from '../routes';
import {svg} from '../assets/svg';
import {components} from '../components';

export const NewPassword: React.FC = () => {
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
        title='Reset password'
      />
    );
  };

  const renderContent = (): JSX.Element => {
    return (
      <main className='scrollable container'>
        <section
          style={{
            marginTop: 10,
            marginBottom: 20,
            borderRadius: 10,
            padding: '30px 20px',
            backgroundColor: 'var(--white-color)',
          }}
        >
          <p
            className='t16'
            style={{marginBottom: 30}}
          >
            Enter new password and confirm.
          </p>
          <components.Input
            placeholder='New password'
            leftIcon={<svg.KeySvg />}
            containerStyle={{marginBottom: 14}}
          />
          <components.Input
            placeholder='Confirm password'
            leftIcon={<svg.KeySvg />}
            containerStyle={{marginBottom: 20}}
          />
          <components.Button
            text='change password'
            onClick={() => navigate(Routes.ForgotPasswordSentEmail)}
          />
        </section>
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
