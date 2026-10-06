import * as React from 'react';
import {useSelector} from 'react-redux';

import {RootState} from '../../../store';
import {TabScreens} from '../../../routes';

export const HomeTabSvg: React.FC = () => {
  const currentTabScreen = useSelector(
    (state: RootState) => state.tabSlice.screen,
  );

  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width={24}
      height={24}
      fill='none'
    >
      <path
        fill={
          currentTabScreen === TabScreens.Home
            ? 'var(--main-turquoise)'
            : 'var(--text-color)'
        }
        fillOpacity={0.15}
        d='M5.4 7.87 12 2.4l6.6 5.47V21H5.4V7.87Z'
      />
      <path
        stroke={
          currentTabScreen === TabScreens.Home
            ? 'var(--main-turquoise)'
            : 'var(--text-color)'
        }
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={1.5}
        d='M5 21h14M5 21V8m14 13V8M2 10l10-8 10 8'
      />
    </svg>
  );
};
