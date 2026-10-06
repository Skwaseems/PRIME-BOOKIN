import React from 'react';

export const CheckSvg: React.FC = () => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={14}
      height={11}
      fill='none'
    >
      <g>
        <path
          stroke='#00B0B9'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={1.2}
          d='M12.333 1.5 5 8.833 1.667 5.5'
        />
      </g>
      <defs>
        <clipPath id='a'>
          <path
            fill='#fff'
            d='M0 .5h14v10H0z'
          />
        </clipPath>
      </defs>
    </svg>
  );
};
