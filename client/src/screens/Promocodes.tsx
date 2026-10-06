import React, {useState} from 'react';

import {hooks} from '../hooks';
import {items} from '../items';
import {svg} from '../assets/svg';
import {components} from '../components';
import {PromocodeType} from '../types';

export const Promocodes: React.FC = () => {
  const dispatch = hooks.useDispatch();

  const [opacity, setOpacity] = useState<number>(0);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor('#F6F9F9', '#F6F9F9', dispatch);

  const {promocodesLoading, promocodes} = hooks.useGetPromocodes();

  const renderHeader = (): JSX.Element => {
    return (
      <components.Header
        showGoBack={true}
        title='Promocodes & gift cards'
      />
    );
  };

  const renderContent = (): JSX.Element | null => {
    if (promocodes.length === 0 && promocodesLoading) return null;

    return (
      <main className='scrollable container'>
        <ul style={{paddingTop: 10, paddingBottom: 20}}>
          {promocodes.map(
            (
              promocode: PromocodeType,
              index: number,
              array: PromocodeType[],
            ) => {
              const isLast = index === array.length - 1;

              return (
                <items.PromocodeItem
                  key={promocode.id}
                  promocode={promocode}
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
    if (promocodesLoading || promocodes.length === 0) {
      return <components.Loader />;
    }
    return null;
  };

  const renderFooter = (): JSX.Element => {
    return (
      <section
        style={{padding: 20, gap: 10}}
        className='row-center'
      >
        <components.Input
          placeholder='Enter promocode'
          leftIcon={<svg.TagSvg />}
        />
        <button
          style={{
            width: '30%',
            height: 50,
            borderRadius: 10,
            backgroundColor: 'var(--main-turquoise)',
          }}
          className='center'
        >
          <span
            className='t14'
            style={{color: 'var(--white-color)', fontWeight: 700}}
          >
            + Add
          </span>
        </button>
      </section>
    );
  };

  return (
    <div
      id='screen'
      style={{opacity}}
    >
      {renderHeader()}
      {renderContent()}
      {renderLoader()}
      {renderFooter()}
    </div>
  );
};
