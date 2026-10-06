import React from 'react';
import {useSelector} from 'react-redux';

import {RootState} from '../store';
import {TabScreens} from '../routes';
import {components} from '../components';

import {Home} from '../screens/tabs/Home';
import {Menu} from '../screens/tabs/Menu';
import {Order} from '../screens/tabs/Order';
import {Favorite} from '../screens/tabs/Favorite';
import {Notification} from '../screens/tabs/Notification';

export const TabNavigator: React.FC = () => {
  const currentTabScreen = useSelector(
    (state: RootState) => state.tabSlice.screen,
  );

  const renderTitle = (): string => {
    switch (currentTabScreen) {
      case TabScreens.Home:
        return '';
      case TabScreens.Menu:
        return '';
      case TabScreens.Order:
        return 'Order';
      case TabScreens.Favorite:
        return 'Favorite';
      case TabScreens.Notification:
        return 'Notification';
      default:
        return 'Home';
    }
  };

  const renderScreens = (): JSX.Element | null => {
    switch (currentTabScreen) {
      case TabScreens.Home:
        return <Home />;
      case TabScreens.Menu:
        return <Menu />;
      case TabScreens.Order:
        return <Order />;
      case TabScreens.Favorite:
        return <Favorite />;
      case TabScreens.Notification:
        return <Notification />;
      default:
        return null;
    }
  };

  const renderUserPhoto = (): boolean => {
    switch (currentTabScreen) {
      case TabScreens.Home:
        return true;
      case TabScreens.Menu:
        return true;
      case TabScreens.Order:
        return true;
      case TabScreens.Favorite:
        return true;
      case TabScreens.Notification:
        return true;
      default:
        return false;
    }
  };

  const renderUserName = (): boolean => {
    switch (currentTabScreen) {
      case TabScreens.Home:
        return true;
      case TabScreens.Menu:
        return true;
      case TabScreens.Order:
        return false;
      case TabScreens.Favorite:
        return false;
      case TabScreens.Notification:
        return false;
      default:
        return false;
    }
  };

  const renderHeader = (): JSX.Element => {
    return (
      <components.Header
        showBasket={true}
        title={renderTitle()}
        userName={renderUserName()}
        userPhoto={renderUserPhoto()}
      />
    );
  };

  const renderFooter = (): JSX.Element => {
    return <components.Footer />;
  };

  return (
    <>
      {renderHeader()}
      {renderScreens()}
      {renderFooter()}
    </>
  );
};
