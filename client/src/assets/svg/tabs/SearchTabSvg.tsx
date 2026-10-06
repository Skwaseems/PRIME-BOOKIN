import * as React from 'react';
import {useSelector} from 'react-redux';

import {TabScreens} from '../../../routes';
import {RootState} from '../../../store';

export const SearchTabSvg: React.FC = () => {
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
          currentTabScreen === TabScreens.Menu
            ? 'var(--main-turquoise)'
            : 'var(--text-color)'
        }
        fillOpacity={0.15}
        stroke={
          currentTabScreen === TabScreens.Menu
            ? 'var(--main-turquoise)'
            : 'var(--text-color)'
        }
        strokeLinejoin='round'
        strokeWidth={1.5}
        d='M10.5 19a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17Z'
      />
      <path
        stroke={
          currentTabScreen === TabScreens.Menu
            ? 'var(--main-turquoise)'
            : 'var(--text-color)'
        }
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={1.5}
        d='M13.328 7.171A3.988 3.988 0 0 0 10.5 6 3.988 3.988 0 0 0 7.67 7.171m8.94 9.44 4.242 4.242'
      />
    </svg>
  );
};
