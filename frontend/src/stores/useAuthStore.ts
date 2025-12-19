import { create } from 'zustand';
import { api } from '../services/api';

interface User {
     id: number;
     email: string;
     full_name?: string;
}

interface AuthState {
     user: User | null;
     token: string | null;
     isAuthenticated: boolean;
     isLoading: boolean;
     login: (token: string, user: User) => void;
     logout: () => void;
     checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
     user: null,
     token: localStorage.getItem('token'),
     isAuthenticated: !!localStorage.getItem('token'),
     isLoading: false,

     login: (token, user) => {
          localStorage.setItem('token', token);
          set({ token, user, isAuthenticated: true });
     },

     logout: () => {
          localStorage.removeItem('token');
          set({ token: null, user: null, isAuthenticated: false });
     },

     checkAuth: async () => {
          const token = localStorage.getItem('token');
          if (!token) return;

          set({ isLoading: true });
          try {
               const { data } = await api.get('/users/me'); // Assuming endpoint
               set({ user: data, isAuthenticated: true });
          } catch (error) {
               set({ token: null, user: null, isAuthenticated: false });
               localStorage.removeItem('token');
          } finally {
               set({ isLoading: false });
          }
     },
}));
