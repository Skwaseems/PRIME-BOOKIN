import React, {useState} from 'react';

import {hooks} from '../hooks';
import {Routes} from '../routes';
import {svg} from '../assets/svg';
import {components} from '../components';
import {setSession} from '../store/slices/userSlice';
import {authApi, errorMessage, fieldErrors} from '../api';

type Fields = {
  name: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const validate = (f: Fields): Partial<Fields> => {
  const errors: Partial<Fields> = {};
  if (f.name.trim().length < 2) errors.name = 'Enter your name';
  if (!/^\+?\d{10,13}$/.test(f.phone.trim())) errors.phone = 'Enter a valid mobile number';
  if (f.email.trim() && !/^\S+@\S+\.\S+$/.test(f.email.trim())) errors.email = 'Enter a valid email';
  if (f.password.length < 6) errors.password = 'Password must be at least 6 characters';
  if (f.confirmPassword !== f.password) errors.confirmPassword = 'Passwords do not match';
  return errors;
};

export const SignUp: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();

  const [fields, setFields] = useState<Fields>({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<Fields>>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const [opacity, setOpacity] = useState<number>(0);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor('#F6F9F9', '#F6F9F9', dispatch);

  const set = (key: keyof Fields) => (value: string) => {
    setFields((prev) => ({...prev, [key]: value}));
    if (errors[key]) setErrors((prev) => ({...prev, [key]: undefined}));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(fields);
    setErrors(found);
    setFormError('');
    if (Object.keys(found).length) return;

    setLoading(true);
    try {
      const session = await authApi.register({
        name: fields.name.trim(),
        phone: fields.phone.trim(),
        password: fields.password,
        email: fields.email.trim() || undefined,
      });
      dispatch(setSession(session));
      navigate(Routes.SignUpAccountCreated, {replace: true});
    } catch (err) {
      setErrors(fieldErrors(err));
      setFormError(errorMessage(err));
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
            paddingTop: '15%',
            borderRadius: 10,
            marginTop: 10,
          }}
        >
          <h1 style={{marginBottom: 30, textTransform: 'capitalize'}}>
            Sign up
          </h1>
          <components.Input
            placeholder='Full name'
            autoCapitalize='words'
            autoComplete='name'
            value={fields.name}
            onChange={set('name')}
            error={errors.name}
            containerStyle={{marginBottom: 14}}
            leftIcon={<svg.UserSvg />}
          />
          <components.Input
            placeholder='Mobile number'
            type='tel'
            inputMode='tel'
            autoComplete='tel'
            maxLength={13}
            value={fields.phone}
            onChange={set('phone')}
            error={errors.phone}
            leftIcon={<svg.PhoneSvg />}
            containerStyle={{marginBottom: 14}}
          />
          <components.Input
            placeholder='Email (optional)'
            type='email'
            inputMode='email'
            autoComplete='email'
            value={fields.email}
            onChange={set('email')}
            error={errors.email}
            leftIcon={<svg.MailSvg />}
            containerStyle={{marginBottom: 14}}
          />
          <components.Input
            placeholder='Password'
            type='password'
            autoComplete='new-password'
            value={fields.password}
            onChange={set('password')}
            error={errors.password}
            leftIcon={<svg.KeySvg />}
            containerStyle={{marginBottom: 14}}
          />
          <components.Input
            placeholder='Confirm password'
            type='password'
            autoComplete='new-password'
            value={fields.confirmPassword}
            onChange={set('confirmPassword')}
            error={errors.confirmPassword}
            leftIcon={<svg.KeySvg />}
            containerStyle={{marginBottom: 20}}
          />
          {formError && (
            <p
              className='t14'
              role='alert'
              style={{color: 'var(--accent-color)', marginBottom: 20}}
            >
              {formError}
            </p>
          )}
          <components.Button
            text='Sign up'
            type='submit'
            loading={loading}
            containerStyle={{marginBottom: 20}}
          />
          <div
            style={{gap: 4}}
            className='row-center'
          >
            <span className='t14'>Already have an account?</span>
            <span
              className='t14 clickable'
              style={{color: 'var(--main-turquoise)'}}
              onClick={() => {
                navigate(Routes.SignIn);
              }}
            >
              Sign in.
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
