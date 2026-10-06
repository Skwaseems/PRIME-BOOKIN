import React, {useState} from 'react';
import {useSelector} from 'react-redux';

import {hooks} from '../../hooks';
import {items} from '../../items';
import {RootState} from '../../store';

export const Favorite: React.FC = () => {
  const dispatch = hooks.useDispatch();

  const wishlist = useSelector((state: RootState) => state.wishlistSlice.list);

  const [opacity, setOpacity] = useState<number>(0);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor('#F6F9F9', '#F6F9F9', dispatch);

  const renderContent = (): JSX.Element | null => {
    if (wishlist.length === 0) return null;

    return (
      <main className='scrollable container'>
        <ul
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 15,
            paddingTop: 10,
          }}
        >
          {wishlist.map((dish) => {
            return (
              <items.FavoriteItem
                dish={dish}
                key={dish.id}
              />
            );
          })}
        </ul>
      </main>
    );
  };

  const renderEmpty = (): JSX.Element | null => {
    if (wishlist.length > 0) return null;

    return (
      <main
        className='scrollable container'
        style={{paddingTop: 12}}
      >
        <section
          style={{
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 10,
            placeItems: 'center',
            flexDirection: 'column',
            backgroundColor: 'var(--white-color)',
          }}
        >
          <img
            src='https://george-fx.github.io/dinehub_api/assets/images/01.jpg'
            alt='profile'
            style={{
              maxWidth: 290,
              width: '100%',
              marginLeft: 'auto',
              marginRight: 'auto',
              marginBottom: 14,
            }}
          />
          <h2
            style={{
              textAlign: 'center',
              marginBottom: 14,
              textTransform: 'capitalize',
            }}
          >
            Your favorite list is empty!
          </h2>
          <p
            style={{textAlign: 'center'}}
            className='t16'
          >
            Your list of favorite dishes is currently <br /> empty. Why not
            start adding dishes <br /> that you love?
          </p>
          {/* <p>Your favorite list is empty.</p> */}
        </section>
      </main>
    );
  };

  return (
    <div
      id='screen'
      style={{opacity}}
    >
      {renderContent()}
      {renderEmpty()}
    </div>
  );
};
