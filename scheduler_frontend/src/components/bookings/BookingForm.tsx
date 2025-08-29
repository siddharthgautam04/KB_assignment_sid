import React, { useState, useMemo } from 'react';
import { Box, TextField, Button, Alert } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { bookingsService } from '@/services/bookings.service';
import { LocalStorageService } from '@/services/localStorage.service';

const bookingSchema = z.object({
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
}).refine((data) => {
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  return start < end;
}, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  resourceId: string;
  onSuccess: () => void;
  purposePlaceholder?: string;
}

export const BookingForm: React.FC<BookingFormProps> = ({ resourceId, onSuccess, purposePlaceholder }) => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // pull current user persisted by authService
  const user = useMemo(() => LocalStorageService.getUser<{ id: string; role?: 'USER'|'ADMIN'; name?: string; employeeId?: string }>(), []);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
  });

  const handleSubmit = async (data: BookingFormValues) => {
    setError('');
    setSuccess('');

    if (!user || user.role !== 'USER') {
      setError('Only users can create bookings');
      return;
    }

    try {
      // Convert local datetime string to ISO for backend
      const startISO = new Date(data.startTime).toISOString();
      const endISO = new Date(data.endTime).toISOString();

      await bookingsService.create({
        resourceId,
        start: startISO,
        end: endISO,
        // purpose is optional; pass if you add a field
      });

      setSuccess('Booking created successfully!');
      form.reset();
      onSuccess();
    } catch (e: any) {
      const msg = e?.message || 'Failed to create booking';
      setError(msg === 'Time slot already booked' ? 'This time slot conflicts with an existing booking' : msg);
    }
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    // yyyy-MM-ddThh:mm for input[type=datetime-local]
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0,16);
  };

  return (
    <Box component="form" onSubmit={form.handleSubmit(handleSubmit)}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <TextField
          fullWidth
          label="Start Time"
          type="datetime-local"
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: getCurrentDateTime() }}
          {...form.register('startTime')}
          error={!!form.formState.errors.startTime}
          helperText={form.formState.errors.startTime?.message}
        />
        <TextField
          fullWidth
          label="End Time"
          type="datetime-local"
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: getCurrentDateTime() }}
          {...form.register('endTime')}
          error={!!form.formState.errors.endTime}
          helperText={form.formState.errors.endTime?.message}
        />
      </Box>

      {/* If you want a purpose field, uncomment below and pass to bookingsService.create */}
      {/* <TextField
        fullWidth
        label="Purpose (optional)"
        placeholder={purposePlaceholder ?? 'e.g., Integration testing'}
        sx={{ mt: 2 }}
        {...form.register('purpose' as any)}
      /> */}

      <Button
        type="submit"
        variant="contained"
        sx={{ mt: 2 }}
        disabled={!user || user.role !== 'USER'}
      >
        Create Booking
      </Button>
    </Box>
  );
};