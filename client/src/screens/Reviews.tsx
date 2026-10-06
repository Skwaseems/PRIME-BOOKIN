import React, {useState} from 'react';

import {hooks} from '../hooks';
import {items} from '../items';
import {components} from '../components';

export const Reviews: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const [opacity, setOpacity] = useState<number>(0);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor('#F6F9F9', '#F6F9F9', dispatch);

  const {reviewsLoading, reviews} = hooks.useGetReviews();

  const renderHeader = (): JSX.Element => {
    return (
      <components.Header
        title='Reviews'
        showGoBack={true}
      />
    );
  };

  const renderContent = (): JSX.Element => {
    if (reviewsLoading) return <components.Loader />;

    return (
      <main className='scrollable container'>
        <ul style={{paddingTop: 10, paddingBottom: 20}}>
          {reviews.map((review, index, array) => {
            const isLast = index === array.length - 1;

            return (
              <items.ReviewItem
                key={index}
                review={review}
                isLast={isLast}
              />
            );
          })}
        </ul>
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
