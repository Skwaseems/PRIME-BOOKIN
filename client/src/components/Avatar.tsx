import React from 'react';

type Props = {
  name?: string;
  size?: number;
};

// Initials in a circle, used until profile photos are supported.
export const Avatar: React.FC<Props> = ({name, size = 22}) => {
  const initials = (name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <div
      aria-hidden={true}
      style={{
        width: size,
        height: size,
        borderRadius: size / 3,
        backgroundColor: 'var(--main-turquoise)',
        color: 'var(--white-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'DM Sans',
        fontWeight: 700,
        fontSize: Math.max(9, Math.round(size * 0.4)),
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
};
