import React, {useState} from 'react';

import {hooks} from '../hooks';
import {svg} from '../assets/svg';
import {components} from '../components';

export const EditProfile: React.FC = () => {
  const navigate = hooks.useNavigate();
  const dispatch = hooks.useDispatch();

  const [opacity, setOpacity] = useState<number>(0);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor('#F6F9F9', '#F6F9F9', dispatch);

  const renderHeader = (): JSX.Element => {
    return (
      <components.Header
        title='Edit profile'
        showGoBack={true}
      />
    );
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
            paddingTop: 50,
            paddingBottom: 30,
            marginTop: 10,
          }}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: 100,
              marginLeft: 'auto',
              marginRight: 'auto',
              marginBottom: 30,
            }}
            className='center clickable'
          >
            <img
              src='https://george-fx.github.io/dinehub_api/assets/users/01.jpg'
              alt='profile'
              style={{
                maxWidth: 100,
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            />
            <div
              style={{
                backgroundColor: 'var(--main-color)',
                position: 'absolute',
                inset: 0,
                opacity: 0.3,
                borderRadius: '50%',
              }}
            />
            <div style={{position: 'absolute'}}>
              <svg.CameraSvg />
            </div>
          </div>
          <components.Input
            placeholder='Name'
            containerStyle={{marginBottom: 14}}
            leftIcon={<svg.UserSvg />}
          />
          <components.Input
            placeholder='Email'
            containerStyle={{marginBottom: 14}}
            leftIcon={<svg.MailSvg />}
            rightIcon={<svg.CheckSvg />}
          />
          <components.Input
            placeholder='Phone number'
            containerStyle={{marginBottom: 14}}
            leftIcon={<svg.PhoneSvg />}
          />
          <components.Input
            placeholder='Your address'
            containerStyle={{marginBottom: 20}}
            leftIcon={<svg.MapSvg />}
          />
          <components.Button
            text='save changes'
            containerStyle={{marginBottom: 20}}
            onClick={() => {
              navigate(-1);
            }}
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
