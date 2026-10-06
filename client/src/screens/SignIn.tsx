import React, {useState} from 'react';

import {hooks} from '../hooks';
import {Routes} from '../routes';
import {svg} from '../assets/svg';
import {components} from '../components';
import {authApi, errorMessage} from '../api';
import {setSession} from '../store/slices/userSlice';

export const SignIn: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [opacity, setOpacity] = useState<number>(0);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor('#F6F9F9', '#F6F9F9', dispatch);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !password) {
      setError('Enter your mobile number and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const session = await authApi.login(phone.trim(), password);
      dispatch(setSession(session));
      navigate('/', {replace: true});
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = (): JSX.Element => {
    return <components.Header showGoBack={true} />;
  };

  const renderContent = (): JSX.Element => {
    return (
      <main className='scrollable container'>
        <form
          onSubmit={handleSubmit}
          noValidate={true}
          style={{
            backgroundColor: 'var(--white-color)',
            paddingLeft: 20,
            paddingRight: 20,
            paddingBottom: 30,
            height: '100%',
            paddingTop: '22%',
            borderRadius: 10,
          }}
        >
          <h1 style={{marginBottom: 10}}>Welcome Back!</h1>
          <span
            className='t16'
            style={{marginBottom: 30, display: 'block'}}
          >
            Sign in to continue
          </span>
          <components.Input
            placeholder='Mobile number'
            type='tel'
            inputMode='tel'
            autoComplete='tel'
            maxLength={13}
            value={phone}
            onChange={setPhone}
            containerStyle={{marginBottom: 14}}
            leftIcon={<svg.PhoneSvg />}
          />
          <components.Input
            placeholder='Password'
            type='password'
            autoComplete='current-password'
            value={password}
            onChange={setPassword}
            leftIcon={<svg.KeySvg />}
            containerStyle={{marginBottom: 20}}
          />
          {error && (
            <p
              className='t14'
              role='alert'
              style={{color: 'var(--accent-color)', marginBottom: 20}}
            >
              {error}
            </p>
          )}
          <div
            className='row-center'
            style={{marginBottom: 20, justifyContent: 'flex-end'}}
          >
            <span
              className='t14 clickable'
              style={{color: 'var(--main-turquoise)'}}
              onClick={() => {
                navigate(Routes.ForgotPassword);
              }}
            >
              Forgot password?
            </span>
          </div>
          <components.Button
            text='Sign in'
            type='submit'
            loading={loading}
            containerStyle={{marginBottom: 20}}
          />
          <div
            style={{gap: 4}}
            className='row-center'
          >
            <span className='t14'>Don’t have an account?</span>
            <span
              className='t14 clickable'
              style={{color: 'var(--main-turquoise)'}}
              onClick={() => {
                navigate(Routes.SignUp);
              }}
            >
              Sign up.
            </span>
          </div>
        </form>
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
