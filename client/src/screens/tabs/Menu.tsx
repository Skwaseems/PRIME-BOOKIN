import React, {useState} from 'react';

import {hooks} from '../../hooks';
import {Routes} from '../../routes';
import {MenuType} from '../../types';
import {components} from '../../components';

export const Menu: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();

  const {menuLoading, menu} = hooks.useGetMenu();

  const [opacity, setOpacity] = useState<number>(0);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor('#F6F9F9', '#F6F9F9', dispatch);

  const renderMenu = (): JSX.Element => {
    return (
      <section style={{paddingTop: 10}}>
        <ul
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 15,
          }}
        >
          {menu.map((menu: MenuType, index: number, array: MenuType[]) => {
            return (
              <li
                key={menu.id}
                className='clickable'
                style={{position: 'relative'}}
                onClick={() =>
                  navigate(Routes.MenuList, {state: {menuName: menu.name}})
                }
              >
                <img
                  src={menu.image}
                  alt={menu.name}
                  style={{borderRadius: 10, width: '100%', height: 'auto'}}
                />
                <div style={{position: 'absolute', left: 15, bottom: 10}}>
                  <span
                    className='t16 number-of-lines-1'
                    style={{color: 'var(--main-color)'}}
                  >
                    {menu.name}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    );
  };

  const renderContent = (): JSX.Element | null => {
    if (menuLoading && !menu.length) return null;
    return <main className='scrollable container'>{renderMenu()}</main>;
  };

  const renderLoader = (): JSX.Element | null => {
    if (menuLoading) return <components.Loader />;
    return null;
  };

  return (
    <div
      id='screen'
      style={{opacity}}
    >
      {renderLoader()}
      {renderContent()}
    </div>
  );
};
