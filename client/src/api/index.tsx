import axios, {AxiosError} from 'axios';

import type {ApiUser} from '../types/ApiTypes';

export const API_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// The store is injected at startup (see store/index.tsx) to avoid a circular
// import between the store and this module.
let getToken: () => string | null = () => null;
let onUnauthorized: () => void = () => {};

export const configureApi = (opts: {
  getToken: () => string | null;
  onUnauthorized: () => void;
}) => {
  getToken = opts.getToken;
  onUnauthorized = opts.onUnauthorized;
};

export const api = axios.create({baseURL: API_URL});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(undefined, (error: AxiosError) => {
  if (error.response?.status === 401 && getToken()) onUnauthorized();
  return Promise.reject(error);
});

type ErrorBody = {error?: string; fields?: Record<string, string>};

// Turns any API/network failure into a message that can be shown to the user.
export const errorMessage = (error: unknown): string => {
  const err = error as AxiosError<ErrorBody>;
  if (!err.response) return 'Cannot reach Primebookin. Check your internet connection.';
  const body = err.response.data;
  const firstField = body?.fields && Object.values(body.fields)[0];
  return firstField || body?.error || 'Something went wrong';
};

export const fieldErrors = (error: unknown): Record<string, string> => {
  return (error as AxiosError<ErrorBody>).response?.data?.fields || {};
};

type AuthResponse = {token: string; user: ApiUser};

export const authApi = {
  login: (phone: string, password: string) =>
    api.post<AuthResponse>('/auth/login', {phone, password}).then((r) => r.data),
  register: (body: {name: string; phone: string; password: string; email?: string}) =>
    api.post<AuthResponse>('/auth/register', body).then((r) => r.data),
  me: () => api.get<{user: ApiUser}>('/auth/me').then((r) => r.data.user),
  updateMe: (body: Partial<Pick<ApiUser, 'name' | 'email' | 'location'>>) =>
    api.patch<{user: ApiUser}>('/auth/me', body).then((r) => r.data.user),
};
