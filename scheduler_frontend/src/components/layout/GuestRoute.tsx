import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LocalStorageService } from '@/services/localStorage.service';

export default function GuestRoute({ children }: { children: JSX.Element }) {
  const token = LocalStorageService.getToken();
  const user = LocalStorageService.getUser();

  if (token && user) {
    return <Navigate to="/resources" replace />;
  }

  return children;
}