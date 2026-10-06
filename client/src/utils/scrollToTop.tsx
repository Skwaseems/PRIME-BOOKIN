import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';

const useScrollToTop = () => {
  const {pathname} = useLocation();

  useEffect(() => {
    const scrollToTop = () => {
      setTimeout(() => {
        window.scroll({top: -1, left: 0, behavior: 'smooth'});
      }, 10);
    };

    scrollToTop();
  }, [pathname]);
};

export default useScrollToTop;
