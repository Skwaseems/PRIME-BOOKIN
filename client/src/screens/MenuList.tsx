import React, {useState} from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';

import {hooks} from '../hooks';
import {items} from '../items';
import {MenuType} from '../types';
import {Routes} from '../routes';
import {components} from '../components';

import {DishType} from '../types';
import {svg} from '../assets/svg';

export const MenuList: React.FC = () => {
  const dispatch = hooks.useDispatch();

  const navigate = hooks.useNavigate();

  const {menuLoading, menu} = hooks.useGetMenu();
  const {dishesLoading, dishes} = hooks.useGetDishes();

  const location = hooks.useLocation();
  const menuName: string = location.state.menuName;

  const [opacity, setOpacity] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>(menuName);

  const filteredDishes = dishes.filter((dish: DishType) =>
    dish.menu.includes(selectedCategory.toLowerCase()),
  );

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor('#F6F9F9', '#F6F9F9', dispatch);

  const renderHeader = (): JSX.Element => {
    return (
      <components.Header
        title='Menu'
        showGoBack={true}
        showBasket={true}
      />
    );
  };

  const renderSearch = (): JSX.Element | null => {
    if (
      menuLoading ||
      dishesLoading ||
      menu.length === 0 ||
      dishes.length === 0
    ) {
      return null;
    }

    return (
      <section
        className='row-center container'
        style={{gap: 5, marginTop: 10}}
      >
        <button
          style={{
            height: 50,
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 5,
            gap: 14,
            flex: 1,
            backgroundColor: 'var(--white-color)',
            borderRadius: 10,
          }}
          onClick={() => navigate(Routes.Search)}
        >
          <svg.SearchSvg />
          <span className='t16'>Search ...</span>
        </button>
        <button
          style={{
            width: 50,
            height: 50,
            backgroundColor: 'var(--white-color)',
            borderRadius: 10,
          }}
          className='center'
          onClick={() => navigate(Routes.Filter)}
        >
          <svg.FilterSvg />
        </button>
      </section>
    );
  };

  const renderCategories = (): JSX.Element | null => {
    if (
      menuLoading ||
      dishesLoading ||
      menu.length === 0 ||
      dishes.length === 0
    ) {
      return null;
    }

    return (
      <section style={{width: '100%', marginTop: 14, paddingBottom: 20}}>
        <Swiper
          spaceBetween={8}
          slidesPerView={'auto'}
          pagination={{clickable: true}}
          navigation={true}
          mousewheel={true}
        >
          {menu.map((category: MenuType, index, array) => {
            const isLast = index === array.length - 1;

            return (
              <SwiperSlide
                key={category.id}
                style={{
                  width: 'auto',
                  marginLeft: index === 0 ? 20 : 0,
                  marginRight: isLast ? 20 : 0,
                }}
                onClick={() => setSelectedCategory(category.name)}
              >
                <div
                  style={{
                    padding: '10px 20px',
                    borderRadius: 10,
                    border: '1px solid red',
                    borderColor:
                      selectedCategory === category.name
                        ? 'var(--main-turquoise)'
                        : 'var(--white-color)',
                    backgroundColor: 'var(--white-color)',
                  }}
                >
                  <h5
                    style={{
                      textTransform: 'capitalize',
                      color:
                        selectedCategory === category.name
                          ? 'var(--main-turquoise)'
                          : 'var(--main-color)',
                    }}
                  >
                    {category.name}
                  </h5>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </section>
    );
  };

  const renderContent = (): JSX.Element | null => {
    if (
      menuLoading ||
      dishesLoading ||
      menu.length === 0 ||
      dishes.length === 0
    ) {
      return null;
    }

    return (
      <main className='scrollable container'>
        <ul style={{paddingBottom: 20}}>
          {filteredDishes.map(
            (dish: DishType, index: number, array: DishType[]) => {
              const isLast = index === array.length - 1;

              return (
                <items.MenuListItem
                  dish={dish}
                  key={dish.id}
                  isLast={isLast}
                />
              );
            },
          )}
        </ul>
      </main>
    );
  };

  const renderLoader = (): JSX.Element | null => {
    if (
      menuLoading ||
      dishesLoading ||
      menu.length === 0 ||
      dishes.length === 0
    ) {
      return <components.Loader />;
    }
    return null;
  };

  return (
    <div
      id='screen'
      style={{opacity}}
    >
      {renderHeader()}
      {renderSearch()}
      {renderCategories()}
      {renderContent()}
      {renderLoader()}
    </div>
  );
};
