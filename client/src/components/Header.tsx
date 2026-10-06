import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {hooks} from '../hooks';
import {svg} from '../assets/svg';
import {RootState} from '../store';
import {components} from '../components';
import {TabScreens, Routes} from '../routes';
import {setScreen} from '../store/slices/tabSlice';
import {logOut} from '../store/slices/userSlice';
import {Avatar} from './Avatar';

const SUPPORT_WHATSAPP = '917768817510';

type Props = {
  title?: string;
  userName?: boolean;
  userPhoto?: boolean;
  showGoBack?: boolean;
  showBasket?: boolean;
  headerStyle?: React.CSSProperties;
};

const modalMenu = [
  {
    id: 1,
    title: 'Personal information',
    route: Routes.EditProfile,
    switch: false,
  },
  {
    id: 2,
    title: 'My orders',
    route: Routes.OrderHistory,
    // route: Routes.OrderHistoryEmpty,
    switch: false,
  },
  {
    id: 6,
    title: 'Support (WhatsApp)',
    route: `https://wa.me/${SUPPORT_WHATSAPP}`,
    switch: false,
  },
  {
    id: 7,
    title: 'Sign out',
    route: Routes.SignIn,
    switch: false,
  },
];

export const Header: React.FC<Props> = ({
  title,
  userName,
  userPhoto,
  showGoBack,
  showBasket,
  headerStyle,
}) => {
  const navigate = hooks.useNavigate();
  const location = hooks.useLocation();
  const dispatch = hooks.useDispatch();

  const [showModal, setShowModal] = useState(false);
  const [themeColor, setThemeColor] = useState('#F6F9F9');

  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (metaThemeColor && themeColor) {
      metaThemeColor.setAttribute('content', themeColor);
    }
  }, [themeColor, showModal]);

  const cart = useSelector((state: RootState) => state.cartSlice);
  const user = useSelector((state: RootState) => state.userSlice.user);

  const renderUser = (): JSX.Element | null => {
    if (!userName && !userPhoto) return null;

    return (
      <div
        style={{
          position: 'absolute',
          left: 0,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 10,
        }}
        onClick={() => {
          setShowModal(true);
          setThemeColor('#fff');
        }}
      >
        <Avatar
          name={user?.name}
          size={22}
        />
        {userName && <h5>{user ? user.name : 'Guest'}</h5>}
      </div>
    );
  };

  const renderGoBack = (): JSX.Element | null => {
    if (showGoBack && location.key !== 'default')
      return (
        <div
          onClick={() => navigate(-1)}
          style={{
            position: 'absolute',
            left: 0,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
          }}
          className='clickable'
        >
          <svg.GoBackSvg />
        </div>
      );

    return null;
  };

  const renderTitle = (): JSX.Element | null => {
    return (
      <div
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <span
          className='t16'
          style={{
            color: 'var(--main-color)',
            marginBottom: 2,
            display: 'block',
          }}
        >
          {title}
        </span>
      </div>
    );
  };

  const renderBasket = (): JSX.Element | null => {
    if (!showBasket) return null;

    return (
      <button
        onClick={() => {
          dispatch(setScreen(TabScreens.Order));
          navigate(Routes.TabNavigator);
        }}
        style={{
          height: '100%',
          width: 'auto',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          position: 'absolute',
          right: 0,
        }}
      >
        <div
          className='t10'
          style={{
            position: 'absolute',
            backgroundColor: 'var(--main-turquoise)',
            padding: '5px 4px 3px 4px',
            borderRadius: '12px',
            bottom: 9,
            right: 44,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
        >
          <span
            style={{
              color: 'var(--white-color)',
              fontFamily: 'DM Sans',
              fontWeight: 700,
              marginBottom: 1,
              fontSize: 10,
            }}
          >
            ₹{cart.total > 0 ? Math.round(cart.total) : '0'}
          </span>
        </div>
        <svg.HeaderBasketSvg />
      </button>
    );
  };

  const renderModal = (): JSX.Element | null => {
    if (!showModal) return null;
    return (
      <>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(30, 37, 56, 0.6)',
            zIndex: 101,
            cursor: 'pointer',
          }}
          onClick={() => {
            setThemeColor('#F6F9F9');
            setShowModal(false);
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: '80%',
            backgroundColor: 'var(--white-color)',
            zIndex: 101,
          }}
        >
          <div
            style={{
              paddingTop: '20%',
              paddingLeft: 20,
              paddingRight: 20,
              marginBottom: 27,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              paddingBottom: 20,
              borderBottom: '1px solid #DBE9F5',
            }}
          >
            <Avatar
              name={user?.name}
              size={60}
            />
            <div style={{display: 'flex', flexDirection: 'column'}}>
              <span
                className='t14'
                style={{
                  color: 'var(--main-color)',
                  fontWeight: 500,
                  marginBottom: 4,
                }}
              >
                {user ? user.name : 'Guest'}
              </span>
              <span className='t14'>
                {user ? user.phone : 'Sign in to book and order'}
              </span>
            </div>
          </div>
          {/* Phone */}
          <ul
            style={{
              paddingLeft: 20,
              paddingRight: 20,
              paddingBottom: 20,
            }}
          >
            {modalMenu.map((item, index, array) => {
              const isLast = index === array.length - 1;

              return (
                <li
                  className='row-center-space-between clickable'
                  style={{
                    paddingTop: 6,
                    paddingBottom: 6,
                    marginBottom: isLast ? 0 : 6,
                  }}
                  key={item.id}
                  onClick={() => {
                    if (item.title === 'Sign out') {
                      dispatch(logOut());
                      navigate(Routes.SignIn, {replace: true});
                    } else if (item.route.startsWith('https://')) {
                      window.open(item.route, '_blank', 'noopener');
                    } else if (item.route !== '') {
                      navigate(item.route);
                    }
                  }}
                >
                  <span
                    className='t16 number-of-lines-1'
                    style={
                      item.title === 'Sign out'
                        ? {color: '#FA5555'}
                        : {color: 'var(--main-color)'}
                    }
                  >
                    {item.title === 'Sign out' && !user ? 'Sign in' : item.title}
                  </span>
                  {item.route !== '' && item.title !== 'Sign out' && (
                    <svg.RightArrowSvg />
                  )}
                  {item.switch && <components.Switch />}
                </li>
              );
            })}
          </ul>
        </div>
      </>
    );
  };

  return (
    <>
      <header
        style={{
          position: 'relative',
          height: 'var(--header-height)',
          backgroundColor: 'var(--main-background)',
          ...headerStyle,
        }}
        className='row-center-space-between'
      >
        {renderUser()}
        {renderGoBack()}
        {renderTitle()}
        {renderBasket()}
      </header>
      {renderModal()}
    </>
  );
};
