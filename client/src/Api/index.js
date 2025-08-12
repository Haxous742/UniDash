import axios from 'axios';

// Use relative baseURL so Vite proxy handles API calls in dev and same-origin in prod
export const axiosInstance = axios.create({
  baseURL: '/',
  withCredentials: true,
});