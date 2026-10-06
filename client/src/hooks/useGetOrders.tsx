import axios from 'axios';
import {useState, useEffect} from 'react';

import {URLS} from '../config';
import {OrderType} from '../types';

export const useGetOrders = () => {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);

  const getOrders = async () => {
    setOrdersLoading(true);

    try {
      const response = await axios.get(URLS.GET_ORDERS);
      setOrders(response.data.orders);
    } catch (error) {
      console.error(error);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  return {orders, ordersLoading};
};
