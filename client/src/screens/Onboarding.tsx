import React, {useCallback, useEffect, useState} from 'react';
import useEmblaCarousel from 'embla-carousel-react';

import {hooks} from '../hooks';
import {Routes} from '../routes';
import {RootState} from '../store';
import {components} from '../components';
import {useSelector} from 'react-redux';
import {Navigate} from 'react-router-dom';

const onboarding = [
  {
    id: 1,
    title1: 'Book Your',
    title2: 'Perfect Stay',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    descriptionLine1: 'Hotels, resorts and villas,',
    descriptionLine2: 'booked in a few taps.',
  },
  {
    id: 2,
    title1: 'Food & Medicines',
    title2: 'At Your Door',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
    descriptionLine1: 'Order from local restaurants',
    descriptionLine2: 'and medical stores.',
  },
  {
    id: 3,
    title1: 'Cabs For Every',
    title2: 'Journey',
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800',
    descriptionLine1: 'Point-to-point taxis and',
    descriptionLine2: 'full-day sightseeing tours.',
  },
];

export const Onboarding: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const [opacity, setOpacity] = useState<number>(0);

  const navigate = hooks.useNavigate();

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor('#F6F9F9', '#F6F9F9', dispatch);

  const [activeIndex, setActiveIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel();
  const user = useSelector((state: RootState) => state.userSlice.user);

  const handleSlideChange = useCallback(() => {
    if (emblaApi) {
      setActiveIndex(emblaApi.selectedScrollSnap());
    }
  }, [emblaApi]);

  useEffect(() => {
    if (emblaApi) {
      emblaApi.on('select', handleSlideChange);
    }
  }, [emblaApi, handleSlideChange]);

  const renderSlider = (): JSX.Element => {
    return (
      <div
        className='embla'
        ref={emblaRef}
        style={{
          position: 'relative',
          height: '100%',
          justifyContent: 'center',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <div
          className='embla__container'
          style={{display: 'flex'}}
        >
          {onboarding.map((item: any, index: any, array: any) => {
            return (
              <div
                key={item.id}
                style={{
                  width: '100%',
                  cursor: 'pointer',
                  flex: '0 0 100%',
                  minWidth: 0,
                }}
                className='embla__slide'
              >
                <img
                  src={item.image}
                  alt='Carousel'
                  style={{
                    maxWidth: 251,
                    width: '64%',
                    margin: '0 auto',
                    objectFit: 'contain',
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDots = (): JSX.Element => {
    return (
      <section
        className='container center'
        style={{gap: 8, marginBottom: '8%'}}
      >
        {onboarding.map((item: any, index: number) => {
          const isSelected = index === activeIndex;
          return (
            <div
              key={item.id}
              style={{
                backgroundColor: isSelected
                  ? '#00B0B9'
                  : 'rgba(0, 176, 185, 0.5)',
                width: 8,
                height: isSelected ? 20 : 8,
                borderRadius: 10,
              }}
            />
          );
        })}
      </section>
    );
  };

  const renderDescription = (): JSX.Element => {
    return (
      <section className='container'>
        <div
          style={{
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: '10%',
            paddingBottom: '10%',
            borderRadius: 10,
            backgroundColor: 'var(--white-color)',
          }}
        >
          <h1
            style={{
              textAlign: 'center',
              textTransform: 'capitalize',
              marginBottom: 20,
            }}
          >
            {onboarding[activeIndex].title1} <br />
            {onboarding[activeIndex].title2}
          </h1>
          <p
            className='t16'
            style={{textAlign: 'center'}}
          >
            {onboarding[activeIndex].descriptionLine1} <br />
            {onboarding[activeIndex].descriptionLine2}
          </p>
        </div>
      </section>
    );
  };

  const renderButton = (): JSX.Element => {
    return (
      <section style={{padding: 20}}>
        <components.Button
          text='Get Started'
          onClick={() => {
            navigate(Routes.SignIn);
          }}
        />
      </section>
    );
  };

  if (user) {
    return (
      <Navigate
        to={Routes.TabNavigator}
        replace={true}
      />
    );
  }

  return (
    <div
      id='screen'
      style={{opacity}}
    >
      {renderSlider()}
      {renderDots()}
      {renderDescription()}
      {renderButton()}
    </div>
  );
};
