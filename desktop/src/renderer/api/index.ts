import axios from 'axios';

if (!process.env.REACT_APP_API_BASE_URL) {
  console.error('No API URL was given');
  throw Error('No API URL was given');
}

const instance = axios.create({
  withCredentials: true,
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    common: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`
    }
  }
});

export const signIn = (username: string, password: string, token: string) => instance.post('/auth/sign-in', {
  username,
  password,
  token,
});

export const getCurrentUser = () => instance.get('/user/current');

export const getInstanceList = () => instance.get('/instance/list');

export const getBrowserVersions = () => instance.get('/browser/versions');

export const getAppVersion = () => instance.get('/app/version');

export default instance;
