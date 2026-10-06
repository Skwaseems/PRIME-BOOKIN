import axios from 'axios';
import {useState, useEffect} from 'react';

import {URLS} from '../config';
import {CarouselType} from '../types';

export const useGetCarousel = () => {
  const [carousel, setCarousel] = useState<CarouselType[]>([]);
  const [carouselLoading, setCarouselLoading] = useState<boolean>(false);

  const getCarousel = async () => {
    setCarouselLoading(true);

    try {
      const response = await axios.get(URLS.GET_CAROUSEL);
      setCarousel(response.data.carousel);
    } catch (error) {
      console.error(error);
    } finally {
      setCarouselLoading(false);
    }
  };

  useEffect(() => {
    getCarousel();
  }, []);

  return {carouselLoading, carousel};
};
