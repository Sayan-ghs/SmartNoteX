import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

export const PrivateRoute: React.FC = () => {
     const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

     return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};
