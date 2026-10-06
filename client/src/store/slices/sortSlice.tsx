import {createSlice} from '@reduxjs/toolkit';

export type SortStateType = {
  sort: string;
};

const initialState: SortStateType = {
  sort: 'Newest',
};

export const sortSlice = createSlice({
  name: 'sort',
  initialState,
  reducers: {
    setSort: (state, action) => {
      state.sort = action.payload;
    },
  },
});

export const {setSort} = sortSlice.actions;
