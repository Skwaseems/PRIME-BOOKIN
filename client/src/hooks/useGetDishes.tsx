import axios from 'axios';
import {useState, useEffect} from 'react';

import {URLS} from '../config';
import {DishType} from '../types';

export const useGetDishes = () => {
  const [dishes, setDishes] = useState<DishType[]>([]);
  const [dishesLoading, setDishesLoading] = useState<boolean>(false);

  const getDishes = async () => {
    setDishesLoading(true);

    try {
      const response = await axios.get(URLS.GET_DISHES);
      setDishes(response.data.dishes);
    } catch (error) {
      console.error(error);
    } finally {
      setDishesLoading(false);
    }
  };

  useEffect(() => {
    getDishes();
  }, []);

  return {dishesLoading, dishes};
};
