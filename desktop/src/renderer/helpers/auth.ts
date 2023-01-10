import instance from '../api';

export const isAuth = () => {
  return !!localStorage.getItem('authToken');
}

export const setAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
  instance.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export const clearAuthToken = () => {
  localStorage.removeItem('authToken');
  delete instance.defaults.headers.common.Authorization;
}
