import React from 'react';
import {Link} from 'react-router-dom';

export const cleanPhone = (raw: string) => raw.replace(/[\s-]/g, '').replace(/^(\+?91)(?=\d{10}$)/, '');
export const validPhone = (raw: string) => /^[6-9]\d{9}$/.test(cleanPhone(raw));

export const TextField: React.FC<{
  icon: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  autoComplete?: string;
  maxLength?: number;
  prefix?: string;
}> = ({icon, label, value, onChange, placeholder, error, type = 'text', inputMode, autoComplete, maxLength = 120, prefix}) => (
  <>
    <label className={`pb-field${error ? ' has-error' : ''}`}>
      <i className={`fa-solid ${icon}`} />
      {prefix && <span className='pb-prefix'>{prefix}</span>}
      <input
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder || label}
        aria-label={label}
        aria-invalid={!!error}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
    {error && <p className='pb-error'>{error}</p>}
  </>
);

export const PhoneField: React.FC<{value: string; onChange: (v: string) => void; error?: string; label?: string}> = ({
  value,
  onChange,
  error,
  label = 'Mobile Phone Number',
}) => (
  <TextField
    icon='fa-mobile-screen'
    label={label}
    placeholder={label}
    prefix='+91'
    type='tel'
    inputMode='numeric'
    autoComplete='tel-national'
    maxLength={14}
    value={value}
    onChange={onChange}
    error={error}
  />
);

// Consent required before personal data is sent (DPDP Act 2023).
export const ConsentCheck: React.FC<{checked: boolean; onChange: (v: boolean) => void; error?: string}> = ({
  checked,
  onChange,
  error,
}) => (
  <>
    <label className='pb-consent'>
      <input
        type='checkbox'
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        I agree to the{' '}
        <Link
          to='/terms'
          target='_blank'
        >
          Terms & Conditions
        </Link>{' '}
        and{' '}
        <Link
          to='/privacy'
          target='_blank'
        >
          Privacy Policy
        </Link>
        . My details are shared only with the partner serving this request and deleted automatically after it is
        complete.
      </span>
    </label>
    {error && <p className='pb-error'>{error}</p>}
  </>
);
