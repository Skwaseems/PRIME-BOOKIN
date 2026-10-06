import * as React from 'react';

export const MapSvg: React.FC = () => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={40}
      height={40}
      fill='none'
    >
      <rect
        width={40}
        height={40}
        fill='#00B0B9'
        rx={8}
      />
      <g
        stroke='#fff'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={1.5}
      >
        <path d='M12.667 16v10.667L17.333 24l5.334 2.667L27.333 24V13.334L22.667 16l-5.334-2.666L12.667 16ZM17.333 13.334V24M22.667 16v10.667' />
      </g>
      <defs>
        <clipPath id='a'>
          <path
            fill='#fff'
            d='M12 12h16v16H12z'
          />
        </clipPath>
      </defs>
    </svg>
  );
};
