import React from 'react';
import {Navigate, RouterProvider, createBrowserRouter} from 'react-router-dom';

import {Cart} from '../pb/Cart';
import {Explore} from '../pb/Explore';
import {Support} from '../pb/Support';
import {Bookings} from '../pb/Bookings';
import {StayDetail} from '../pb/StayDetail';
import {RestaurantMenu} from '../pb/RestaurantMenu';
import {Terms, Privacy, PartnerTerms} from '../pb/Legal';
import {PB_ROUTES} from '../pb/components';
import {PartnerHome} from '../panel/PartnerHome';
import {PartnerRegister} from '../panel/PartnerRegister';
import {PartnerPanel} from '../panel/PartnerPanel';
import {AdminPanel} from '../panel/AdminPanel';

const stack = createBrowserRouter([
  // Customer app (no account needed).
  {path: PB_ROUTES.explore, element: <Explore />},
  {path: PB_ROUTES.bookings, element: <Bookings />},
  {path: PB_ROUTES.cart, element: <Cart />},
  {path: PB_ROUTES.support, element: <Support />},
  {path: '/stay/:id', element: <StayDetail />},
  {path: '/restaurant/:id', element: <RestaurantMenu />},
  {path: '/terms', element: <Terms />},
  {path: '/privacy', element: <Privacy />},
  {path: '/partner-terms', element: <PartnerTerms />},

  // Partners (hotels, restaurants, medical stores, drivers, riders) and admin.
  {path: '/partner', element: <PartnerHome />},
  {path: '/partner/register', element: <PartnerRegister />},
  {path: '/partner/:pid', element: <PartnerPanel />},
  {path: '/admin', element: <AdminPanel />},
  {path: '/sign-in', element: <Navigate to='/partner' replace={true} />},

  {path: '*', element: <Navigate to='/' replace={true} />},
]);

export const StackNavigator: React.FC = () => {
  return <RouterProvider router={stack} />;
};
