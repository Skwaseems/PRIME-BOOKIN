import React, {useState} from 'react';

import {hooks} from '../hooks';
import {Routes} from '../routes';
import {components} from '../components';

export const ConfirmationCode: React.FC = () => {
  const navigate = hooks.useNavigate();
  const dispatch = hooks.useDispatch();

  const [opacity, setOpacity] = useState<number>(0);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor('#F6F9F9', '#F6F9F9', dispatch);

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value.length > 1) {
      event.target.value = value.slice(0, 1);
    }
  };

  const renderHeader = (): JSX.Element => {
    return (
      <components.Header
        showGoBack={true}
        title='Verify number'
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
            paddingBottom: 30,
            paddingTop: 30,
            marginTop: 10,
          }}
        >
          <span
            className='t16'
            style={{marginBottom: 20, display: 'block'}}
          >
            Enter your OTP code here.
          </span>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}
          >
            {['', '', '', '', ''].map((input, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  width: '17%',
                  aspectRatio: 1 / 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '1px solid var(--main-turquoise)',
                  backgroundColor: 'var(--white-color)',
                }}
              >
                <input
                  maxLength={1}
                  style={{
                    textAlign: 'center',
                    width: '100%',
                    height: '100%',
                    fontFamily: 'DM Sans',
                    borderRadius: 10,
                    border: 'none',
                    fontSize: 20,
                  }}
                  type='number'
                  min={0}
                  max={9}
                  onInput={handleInput}
                />
              </div>
            ))}
          </div>
          <div
            className='row-center'
            style={{gap: 4, marginBottom: 20}}
          >
            <span className='t16'>Didn’t receive the OTP?</span>
            <span
              className='t16 clickable'
              style={{color: 'var(--main-turquoise)'}}
            >
              Resend.
            </span>
          </div>
          <components.Button
            text='verify'
            onClick={() => {
              navigate(Routes.SignUpAccountCreated);
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
