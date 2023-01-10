import axios from 'axios';

const instance = axios.create({
  withCredentials: true,
  baseURL: 'http://localhost:3005/api/v1',
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

export const getInstanceList = () => instance.get('/instance/list');

export default instance;
