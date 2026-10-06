import {useEffect} from 'react';
import {Dispatch} from 'redux';
import {actions} from '../store/actions';

export const useThemeColor = (
  bodyColor?: string,
  themeColor?: string,
  dispatch?: Dispatch,
) => {
  useEffect(() => {
    if (dispatch && bodyColor) {
      dispatch(actions.setColor(bodyColor));
    }
  }, [bodyColor, dispatch]);

  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');

    if (metaThemeColor && themeColor) {
      metaThemeColor.setAttribute('content', themeColor);
    }
  }, [themeColor]);
};
