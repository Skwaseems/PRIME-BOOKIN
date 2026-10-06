import React, {useState} from 'react';

import {hooks} from '../hooks';
import {Routes} from '../routes';
import {OrderType} from '../types';
import {components} from '../components';
import {actions} from '../store/actions';
import {TabScreens} from '../routes';

export const OrderHistory: React.FC = () => {
  const dispatch = hooks.useDispatch();
  const navigate = hooks.useNavigate();

  const [opacity, setOpacity] = useState<number>(0);

  const [openAccordions, setOpenAccordions] = useState<Set<string>>(new Set());

  hooks.useScrollToTop();
  hooks.useOpacity(setOpacity);
  hooks.useThemeColor('#F6F9F9', '#F6F9F9', dispatch);

  const {ordersLoading, orders} = hooks.useGetOrders();

  const handleToggle = (id: number) => {
    setOpenAccordions((prev) => {
      const newSet = new Set(prev);
      const idStr = id.toString();
      if (newSet.has(idStr)) {
        newSet.delete(idStr);
      } else {
        newSet.add(idStr);
      }
      return newSet;
    });
  };

  const renderHeader = (): JSX.Element => {
    return (
      <components.Header
        title='Order history'
        showGoBack={true}
      />
    );
  };

  const renderContent = (): JSX.Element => {
    if (ordersLoading) return <components.Loader />;

    return (
      <main className='scrollable container'>
        <section
          className='accordion'
          style={{paddingTop: 10}}
        >
          {orders.map((order: OrderType) => {
            const idStr = order.id.toString();
            const isOpen = openAccordions.has(idStr);
            return (
              <div key={order.id}>
                <details
                  open={isOpen}
                  style={{
                    borderRadius: 10,
                    marginBottom: 10,
                    backgroundColor: 'var(--white-color)',
                  }}
                  onToggle={() => handleToggle(order.id)}
                >
                  <summary
                    style={{
                      padding: 20,
                      borderBottom: isOpen ? '1px solid #DBE9F5' : 'none',
                    }}
                  >
                    <section
                      className='row-center'
                      style={{marginBottom: 6}}
                    >
                      <span
                        className='t14'
                        style={{
                          marginRight: 4,
                          fontWeight: 500,
                          color: 'var(--main-color)',
                        }}
                      >
                        {order.date}
                      </span>
                      <span
                        className='t10'
                        style={{marginRight: 'auto', marginTop: 4}}
                      >
                        at {order.time}
                      </span>
                      <span
                        className='t14'
                        style={{fontWeight: 500, color: 'var(--main-color)'}}
                      >
                        ${order.total}
                      </span>
                    </section>
                    <section className='row-center-space-between'>
                      <span className='t12'>Order ID: {order.id}</span>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: 5,
                          backgroundColor:
                            order.status === 'delivered'
                              ? '#00B0B9'
                              : order.status === 'shipping'
                              ? '#FFA462'
                              : '#FA5555',
                          color: '#fff',
                          fontWeight: 500,
                          lineHeight: 1.2,
                        }}
                        className='t10'
                      >
                        {order.status}
                      </span>
                    </section>
                  </summary>
                  <section style={{padding: 20}}>
                    <ul>
                      {order.products.map((product) => {
                        return (
                          <li
                            key={product.id}
                            style={{marginBottom: 8}}
                            className='row-center-space-between'
                          >
                            <span className='t14'>{product.name}</span>
                            <span
                              style={{marginLeft: 'auto'}}
                              className='t14'
                            >
                              {product.quantity} x ${product.price}
                            </span>
                          </li>
                        );
                      })}
                      <li
                        className='row-center-space-between'
                        style={{marginBottom: 8}}
                      >
                        <span className='t14'>Discount</span>
                        <span className='t14'>- ${order.discount}</span>
                      </li>
                      <li className='row-center-space-between'>
                        <span className='t14'>Delivery</span>
                        <span className='t14'>${order.delivery}</span>
                      </li>
                    </ul>
                  </section>
                </details>
                {isOpen && order.status === 'shipping' && (
                  <components.Button
                    text='track order'
                    containerStyle={{marginBottom: 20}}
                    onClick={() => navigate(Routes.TrackYourOrder)}
                  />
                )}
                {isOpen && order.status !== 'shipping' && (
                  <div
                    className='row-center'
                    style={{marginBottom: 20, gap: 15}}
                  >
                    <components.Button
                      text='repeat order'
                      colorScheme='secondary'
                      onClick={() => {
                        dispatch(actions.setScreen(TabScreens.Order));
                        navigate(Routes.TabNavigator);
                      }}
                    />
                    <components.Button
                      text='Leave review'
                      onClick={() => navigate(Routes.LeaveAReview)}
                    />
                  </div>
                )}
              </div>
            );
          })}
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
