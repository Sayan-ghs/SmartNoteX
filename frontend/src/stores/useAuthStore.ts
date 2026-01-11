import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: 'student' | 'faculty' | 'admin';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      initialize: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            set({
              user: {
                id: session.user.id,
                email: session.user.email || '',
                full_name: session.user.user_metadata?.full_name,
                role: session.user.user_metadata?.role,
              },
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      login: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          set({
            user: {
              id: data.user.id,
              email: data.user.email || '',
              full_name: data.user.user_metadata?.full_name,
              role: data.user.user_metadata?.role,
            },
            isAuthenticated: true,
          });
        }
      },

      register: async (email: string, password: string, fullName: string) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: 'student', // Default role
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          set({
            user: {
              id: data.user.id,
              email: data.user.email || '',
              full_name: fullName,
              role: 'student',
            },
            isAuthenticated: true,
          });
        }
      },

      logout: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Initialize auth on app load
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    useAuthStore.getState().setUser({
      id: session.user.id,
      email: session.user.email || '',
      full_name: session.user.user_metadata?.full_name,
      role: session.user.user_metadata?.role,
    });
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.getState().setUser(null);
  }
});
