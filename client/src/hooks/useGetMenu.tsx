import axios from 'axios';
import {useState, useEffect} from 'react';

import {URLS} from '../config';
import {MenuType} from '../types';

export const useGetMenu = (): {menuLoading: boolean; menu: MenuType[]} => {
  const [menu, setMenu] = useState<MenuType[]>([]);
  const [menuLoading, setMenuLoading] = useState<boolean>(false);

  const getMenu = async () => {
    setMenuLoading(true);

    try {
      const response = await axios.get(URLS.GET_MENU);
      setMenu(response.data.menu);
    } catch (error) {
      console.error(error);
    } finally {
      setMenuLoading(false);
    }
  };

  useEffect(() => {
    getMenu();
  }, []);

  return {menuLoading, menu};
};
