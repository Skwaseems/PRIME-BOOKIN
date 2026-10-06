import {createSlice} from '@reduxjs/toolkit';

export type TabStateType = {
  screen: string;
};

const initialState: TabStateType = {
  screen: 'Home',
};

export const tabSlice = createSlice({
  name: 'tab',
  initialState,
  reducers: {
    setScreen: (state, action) => {
      state.screen = action.payload;
    },
  },
});

export const {setScreen} = tabSlice.actions;
