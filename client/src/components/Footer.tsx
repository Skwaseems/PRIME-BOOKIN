import React from 'react';

import {hooks} from '../hooks';
import {svg} from '../assets/svg';
import {TabScreens} from '../routes';
import {actions} from '../store/actions';

const tabs = [
  {
    id: 1,
    screen: TabScreens.Home,
    icon: <svg.HomeTabSvg />,
  },
  {
    id: 2,
    screen: TabScreens.Menu,
    icon: <svg.SearchTabSvg />,
  },
  {
    id: 3,
    screen: TabScreens.Order,
    icon: <svg.OrderTabSvg />,
  },
  {
    id: 4,
    screen: TabScreens.Favorite,
    icon: <svg.HeartTabSvg />,
  },
  {
    id: 5,
    screen: TabScreens.Notification,
    icon: <svg.BellTabSvg />,
  },
];

export const Footer: React.FC = () => {
  const dispatch = hooks.useDispatch();

  return (
    <section
      style={{
        padding: 20,
        backgroundColor: 'ver(--main-turquoise: #00b0b9)',
        paddingTop: 10,
        paddingBottom: 10,
      }}
    >
      <footer
        style={{
          zIndex: 100,
          borderRadius: 10,
          height: 'var(--footer-height)',
          backgroundColor: 'var(--white-color)',
        }}
      >
        <ul
          style={{height: '100%'}}
          className='row-center-space-around'
        >
          {tabs.map((tab, index) => {
            return (
              <li
                key={tab.id}
                className='clickable center'
                style={{
                  height: '100%',
                  width: 'calc(100% / 5)',
                  borderRadius: 10,
                }}
                onClick={() => dispatch(actions.setScreen(tab.screen))}
              >
                {tab.icon}
              </li>
            );
          })}
        </ul>
      </footer>
    </section>
  );
};
