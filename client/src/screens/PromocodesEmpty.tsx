import React, {useState} from 'react';

import {hooks} from '../hooks';
import {svg} from '../assets/svg';
import {components} from '../components';

export const PromocodesEmpty: React.FC = () => {
  const dispatch = hooks.useDispatch();

  const [opacity, setOpacity] = useState<number>(0);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor('#F6F9F9', '#F6F9F9', dispatch);

  const renderHeader = (): JSX.Element => {
    return (
      <components.Header
        showGoBack={true}
        title='Promocodes & gift cards'
      />
    );
  };

  const renderContent = (): JSX.Element => {
    return (
      <main className='scrollable container'>
        <section
          style={{
            borderRadius: 10,
            paddingTop: 20,
            marginTop: 10,
            paddingBottom: 20,
            paddingLeft: 20,
            paddingRight: 20,
            backgroundColor: 'var(--white-color)',
          }}
        >
          <img
            src='https://george-fx.github.io/dinehub_api/assets/images/04.jpg'
            alt='Promocodes'
            style={{margin: 'auto', display: 'block'}}
            className='status-img'
          />
          <h2
            style={{
              textAlign: 'center',
              textTransform: 'capitalize',
              marginBottom: 14,
            }}
          >
            You don’t have <br />
            promocodes yet!
          </h2>
          <p
            className='t16'
            style={{textAlign: 'center', marginBottom: 30}}
          >
            Stay tuned for and discounts to <br /> enhance your dining
            experience.
          </p>
          <components.Input
            placeholder='Enter promocode'
            containerStyle={{marginBottom: 20}}
            leftIcon={<svg.TagSvg />}
          />
          <components.Button
            text='add promocode'
            containerStyle={{marginBottom: 20}}
            onClick={() => {}}
          />
        </section>
      </main>
    );
  };

  return (
    <div
      id='screen'
      style={{opacity}}
    >
      {renderHeader()}
      {renderContent()}
    </div>
  );
};
