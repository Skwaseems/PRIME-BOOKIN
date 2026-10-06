import {FC, useState} from 'react';
import React from 'react';

import {svg} from '../assets/svg';

type Props = {
  type?: 'text' | 'password' | 'tel' | 'email';
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  autoComplete?: string;
  clickable?: boolean;
  containerStyle?: React.CSSProperties;
  label?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  placeholder?: string;
  icon?: JSX.Element;
  leftIcon?: JSX.Element;
  rightIcon?: JSX.Element;
  value?: string;
  onChange?: (value: string) => void;
  maxLength?: number;
  error?: string;
};

export const Input: FC<Props> = ({
  placeholder,
  containerStyle,
  autoCapitalize = 'none',
  leftIcon,
  rightIcon,
  type = 'text',
  inputMode,
  autoComplete,
  value,
  onChange,
  maxLength = 50,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const {marginBottom, ...boxStyle} = containerStyle || {};

  const renderRightIcon = (): JSX.Element | null => {
    if (isPassword) {
      return (
        <button
          type='button'
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          onClick={() => setShowPassword(!showPassword)}
          style={{
            marginRight: 20 - 5,
            marginLeft: 10,
            opacity: showPassword ? 0.5 : 1,
            display: 'flex',
          }}
        >
          <svg.EyeOffSvg />
        </button>
      );
    }
    if (rightIcon) {
      return <div style={{marginRight: 20 - 5, marginLeft: 10}}>{rightIcon}</div>;
    }
    return null;
  };

  return (
    <div style={{marginBottom}}>
      <div
        style={{
          height: 50,
          padding: 5,
          flexDirection: 'row',
          alignItems: 'center',
          position: 'relative',
          display: 'flex',
          backgroundColor: '#E9F3F6',
          borderRadius: 10,
          border: error ? '1px solid var(--accent-color)' : '1px solid transparent',
          ...boxStyle,
        }}
      >
        {leftIcon && <div style={{marginRight: 14}}>{leftIcon}</div>}
        <input
          className='input-field'
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-label={placeholder}
          aria-invalid={!!error}
          maxLength={maxLength}
          type={isPassword && showPassword ? 'text' : type}
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          style={{
            width: '100%',
            height: '100%',
            padding: 0,
            margin: 0,
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            fontSize: 16,
            color: 'var(--main-color)',
            fontFamily: 'DM Sans',
          }}
        />
        {renderRightIcon()}
      </div>
      {error && (
        <span
          className='t12'
          role='alert'
          style={{color: 'var(--accent-color)', display: 'block', marginTop: 4, paddingLeft: 4}}
        >
          {error}
        </span>
      )}
    </div>
  );
};
