import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LocalStorageService } from '@/services/localStorage.service';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** When true, only ADMIN can access */
  adminOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  adminOnly = false,
}) => {
  const location = useLocation();

  const token = LocalStorageService.getToken();
  const user = LocalStorageService.getUser<{ role?: 'USER' | 'ADMIN' }>();

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/resources" replace />;
  }

  return <>{children}</>;
};