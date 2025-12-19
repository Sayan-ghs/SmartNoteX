import axios from 'axios';

export const API_URL = 'http://localhost:8000/api'; // Dev default

export const api = axios.create({
     baseURL: API_URL,
     headers: {
          'Content-Type': 'application/json',
     },
});

api.interceptors.request.use((config) => {
     const token = localStorage.getItem('token');
     if (token) {
          config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
});

api.interceptors.response.use(
     (response) => response,
     (error) => {
          if (error.response?.status === 401) {
               // Auto logout?
               // Use event bus or store to trigger logout
               localStorage.removeItem('token');
               window.location.href = '/login';
          }
          return Promise.reject(error);
     }
);
