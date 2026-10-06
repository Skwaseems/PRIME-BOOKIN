import React, {useState} from 'react';
import {svg} from '../assets/svg';

import {hooks} from '../hooks';
import {components} from '../components';

const progress = [
  {
    id: 1,
    title: 'Order Confirmed',
    description: 'Your order has been confirmed',
    status: 'done',
  },
  {
    id: 2,
    title: 'Order is Being Cooked',
    description: 'Estimated for 9:02 pm',
    status: 'done',
  },
  {
    id: 3,
    title: 'Courier Delivering',
    description: 'Estimated for 9:12 pm',
    status: 'pending',
  },
  {
    id: 4,
    title: 'Receiving',
    description: 'Estimated for 9:32 pm',
    status: 'pending',
  },
];

export const TrackYourOrder: React.FC = () => {
  const dispatch = hooks.useDispatch();

  const [opacity, setOpacity] = useState<number>(0);

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor('#F6F9F9', '#F6F9F9', dispatch);

  const renderHeader = (): JSX.Element => {
    return (
      <components.Header
        showGoBack={true}
        title='Track your order'
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
            borderRadius: 10,
            marginBottom: 10,
            border: '1px solid #00B0B9',
          }}
        >
          <div
            className='row-center'
            style={{gap: 14}}
          >
            <span className='t14'>Your order:</span>
            <span
              className='t14'
              style={{fontWeight: 500, color: 'var(--main-turquoise)'}}
            >
              456654
            </span>
          </div>
          <div
            className='row-center'
            style={{gap: 14}}
          >
            <span className='t14'>Date:</span>
            <span
              className='t14'
              style={{fontWeight: 500, color: 'var(--main-turquoise)'}}
            >
              Aug 31 at 8:32 pm
            </span>
          </div>
        </section>
        <section
          style={{
            borderRadius: 10,
            padding: 30,
            backgroundColor: 'var(--white-color)',
          }}
        >
          {progress.map((item, index, array) => {
            const isLast = index === array.length - 1;

            return (
              <div
                style={{display: 'flex'}}
                key={item.id}
              >
                <section
                  style={{
                    marginRight: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      marginBottom: isLast ? 0 : 7,
                      backgroundColor:
                        item.status === 'done'
                          ? '#00B0B9'
                          : 'var(--white-color)',
                      border: '1px solid #00B0B9',
                    }}
                    className='center'
                  >
                    {item.status === 'done' && <svg.StatusCheckSvg />}
                  </div>
                  {!isLast && (
                    <div
                      style={{
                        width: 2,
                        height: 30,
                        marginBottom: 6,
                        borderRadius: 1,
                        backgroundColor: '#00B0B9',
                      }}
                    />
                  )}
                </section>
                <section style={{display: 'flex', flexDirection: 'column'}}>
                  <span
                    className='t14'
                    style={{
                      marginBottom: 6,
                      color: 'var(--main-color)',
                      fontWeight: 500,
                    }}
                  >
                    {item.title}
                  </span>
                  <span className='t14'>{item.description}</span>
                </section>
              </div>
            );
          })}
        </section>
      </main>
    );
  };

  const renderFooter = (): JSX.Element => {
    return (
      <footer style={{padding: 20}}>
        <components.Button text='Chat support' />
      </footer>
    );
  };

  return (
    <div
      id='screen'
      style={{opacity}}
    >
      {renderHeader()}
      {renderContent()}
      {renderFooter()}
    </div>
  );
};
