import {createSlice} from '@reduxjs/toolkit';

export type BGStateType = {
  color: string;
};

const initialState: BGStateType = {
  color: '#F6F9F9',
};

export const bgSlice = createSlice({
  name: 'bg',
  initialState,
  reducers: {
    setColor: (state, action) => {
      state.color = action.payload;
    },
  },
});

export const {setColor} = bgSlice.actions;
