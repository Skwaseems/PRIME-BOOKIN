import React, {useState} from 'react';

import {hooks} from '../hooks';
import {Routes} from '../routes';
import {svg} from '../assets/svg';
import {components} from '../components';

export const ForgotPassword: React.FC = () => {
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
        title='Forgot password'
      />
    );
  };

  const renderContent = (): JSX.Element => {
    return (
      <main className='scrollable container'>
        <section
          style={{
            backgroundColor: 'var(--white-color)',
            borderRadius: 10,
            marginTop: 10,
            marginBottom: 20,
            padding: '30px 20px',
          }}
        >
          <p
            className='t16'
            style={{marginBottom: 30}}
          >
            Please enter your email address. You will receive a link to create a
            new password via email.
          </p>
          <components.Input
            placeholder='Email'
            leftIcon={<svg.MailSvg />}
            containerStyle={{marginBottom: 20}}
          />
          <components.Button
            text='send'
            onClick={() => navigate(Routes.NewPassword)}
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
