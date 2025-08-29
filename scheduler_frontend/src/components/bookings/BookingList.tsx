import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Divider,
  Button,
  Box,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import type { Booking } from '../../types';

// If you want real API deletion, uncomment these lines and remove the local store.
// import { bookingsService } from '@/services/bookings.service';
import { LocalStorageService } from '@/services/localStorage.service';

// --- If you're still on the local store, keep these imports. Otherwise, remove them. ---
import { useBookingsStore } from '../../store/bookings.store';

interface BookingListProps {
  bookings: Booking[];
  showDelete?: boolean;
  emptyMessage?: string;
}

export const BookingList: React.FC<BookingListProps> = ({
  bookings,
  showDelete = false,
  emptyMessage = 'No bookings found',
}) => {
  // LOCAL STORE DELETE (legacy). If using API instead, remove this and use bookingsService.remove below.
  const { deleteBooking } = useBookingsStore();

  // Current logged-in user from storage (authService sets this on login)
  const sessionUser = LocalStorageService.getUser<{ role?: 'USER' | 'ADMIN' }>();

  const handleDelete = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;

    // --- API path (recommended) ---
    // try {
    //   await bookingsService.remove(bookingId);
    //   // Ask parent to refresh after deletion, or reload list here if you own the state.
    // } catch (e: any) {
    //   alert(e?.message || 'Failed to delete booking');
    // }

    // --- Legacy local-store path (remove if using API) ---
    deleteBooking(bookingId);
  };

  const formatDateTime = (iso: string) => new Date(iso).toLocaleString();

  if (bookings.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
        {emptyMessage}
      </Typography>
    );
  }

  return (
    <List>
      {bookings.map((booking, index) => {
        const name = booking.user?.name ?? booking.userId;
        const empId = booking.user?.employeeId ? ` (${booking.user.employeeId})` : '';

        return (
          <React.Fragment key={booking.id}>
            <ListItem>
              <ListItemText
                primary={
                  <Box>
                    <Typography variant="subtitle1">
                      {name}{empId}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Start: {formatDateTime(booking.start)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      End: {formatDateTime(booking.end)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Created: {formatDateTime(booking.createdAt)}
                    </Typography>
                  </Box>
                }
              />
              {showDelete && sessionUser?.role === 'ADMIN' && (
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDelete(booking.id)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              )}
            </ListItem>
            {index < bookings.length - 1 && <Divider />}
          </React.Fragment>
        );
      })}
    </List>
  );
};