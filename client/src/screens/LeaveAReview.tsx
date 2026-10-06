import React, {useState} from 'react';

import {hooks} from '../hooks';
import {components} from '../components';

export const LeaveAReview: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();

  const [rating, setRating] = useState<number>(0);
  const [opacity, setOpacity] = useState<number>(0);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor('#F6F9F9', '#F6F9F9', dispatch);

  const renderHeader = (): JSX.Element => {
    return (
      <components.Header
        showGoBack={true}
        title='Leave a review'
      />
    );
  };

  const renderContent = (): JSX.Element => {
    return (
      <main className='scrollable container'>
        <section
          style={{
            padding: 20,
            marginTop: 10,
            marginBottom: 20,
            borderRadius: 10,
            backgroundColor: 'var(--white-color)',
          }}
        >
          <img
            alt='rate service'
            className='status-img'
            style={{marginBottom: 10}}
            src='https://george-fx.github.io/dinehub_api/assets/images/08.jpg'
          />
          <h2
            style={{
              textTransform: 'capitalize',
              textAlign: 'center',
              marginBottom: 14,
            }}
          >
            Please rate the quality of <br /> service for the order!
          </h2>
          <components.RatingStars
            rating={rating}
            setRating={setRating}
            containerStyle={{marginBottom: 20}}
          />
          <p
            className='t16'
            style={{textAlign: 'center'}}
          >
            Your comments and suggestions help <br /> us improve the service
            quality better!
          </p>
          <div style={{marginBottom: 20}}>
            <textarea
              placeholder='Enter your comment'
              style={{
                height: 127,
                width: '100%',
                padding: 14,
                marginTop: 20,
                borderRadius: 10,
                border: 'none',
                fontSize: 16,
                fontFamily: 'DM Sans',
                color: '#748BA0',
                backgroundColor: '#E9F3F6',
                resize: 'none',
              }}
            />
          </div>
          <components.Button
            text='Send review'
            onClick={() => {
              navigate(-1);
            }}
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
