import React, {useState} from 'react';

import {hooks} from '../hooks';
import {components} from '../components';

export const Search: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();

  const [opacity, setOpacity] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const {dishesLoading, dishes} = hooks.useGetDishes();

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor('#F6F9F9', '#F6F9F9', dispatch);

  const filteredDishes = dishes.filter((dish: any) =>
    dish.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderHeader = (): JSX.Element => {
    return (
      <components.Header
        title='Filter'
        showGoBack={true}
      />
    );
  };

  const renderSearch = (): JSX.Element => {
    return (
      <section style={{borderBottom: '1px solid #DBE9F5'}}>
        <div
          style={{
            padding: 20,
            paddingTop: 6,
            gap: 20,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <input
            type='text'
            value={searchQuery}
            placeholder='Search for dishes'
            onChange={(event) => setSearchQuery(event.target.value)}
            style={{
              width: '100%',
              padding: '12px 20px',
              borderRadius: 10,
              backgroundColor: '#E9F3F6',
              color: 'var(--main-color)',
              border: 'none',
              fontSize: 16,
            }}
          />
          <span
            className='t16 clickable'
            onClick={() => navigate(-1)}
          >
            Cancel
          </span>
        </div>
      </section>
    );
  };

  const renderDishes = (): JSX.Element => {
    if (dishesLoading) return <components.Loader />;

    return (
      <section style={{paddingTop: 14}}>
        {filteredDishes.map((dish) => {
          return (
            <button key={dish.id}>
              <span className='t16 number-of-lines-1'>{dish.name}</span>
            </button>
          );
        })}
      </section>
    );
  };

  const renderContent = (): JSX.Element => {
    return <main className='scrollable container'>{renderDishes()}</main>;
  };

  return (
    <div
      id='screen'
      style={{opacity}}
    >
      {renderHeader()}
      {renderSearch()}
      {renderContent()}
    </div>
  );
};
