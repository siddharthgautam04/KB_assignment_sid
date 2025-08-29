import React, { useMemo } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { LogoutOutlined } from '@mui/icons-material';

import { LocalStorageService } from '@/services/localStorage.service';
import { authService } from '@/services/auth.service';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'Resource Booking System',
}) => {
  const navigate = useNavigate();

  // Grab current user from storage
  const user = useMemo(() => LocalStorageService.getUser<{ role?: 'USER' | 'ADMIN'; name?: string; employeeId?: string; username?: string }>(), []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2">
                {user.role === 'ADMIN'
                  ? `Admin: ${user.username}`
                  : `${user.name} (${user.employeeId ?? ''})`}
              </Typography>
              <Button
                color="inherit"
                onClick={handleLogout}
                startIcon={<LogoutOutlined />}
              >
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {children}
      </Container>
    </Box>
  );
};