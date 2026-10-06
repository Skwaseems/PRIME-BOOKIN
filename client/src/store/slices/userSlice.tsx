import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import type {ApiUser} from '../../types/ApiTypes';

export type UserStateType = {
  user: ApiUser | null;
  token: string | null;
  rememberMe: boolean;
};

const initialState: UserStateType = {user: null, token: null, rememberMe: true};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<{token: string; user: ApiUser}>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    setUser: (state, action: PayloadAction<ApiUser>) => {
      state.user = action.payload;
    },
    logOut: (state) => {
      state.user = null;
      state.token = null;
    },
    setRememberMe: (state, action: PayloadAction<boolean>) => {
      state.rememberMe = action.payload;
    },
  },
});

export const {setSession, setUser, logOut, setRememberMe} = userSlice.actions;

export {userSlice};
