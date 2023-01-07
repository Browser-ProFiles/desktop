import axios from 'axios';

const instance = axios.create({
  withCredentials: true,
  baseURL: 'http://localhost:3005/api/v1'
});

export const login = (username: string, password: string) => instance.post('/auth/sign-in', {
  username,
  password,
});

export const fetchProfiles = () => instance.get('/instance/list');
