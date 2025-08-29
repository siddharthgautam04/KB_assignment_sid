import React, { useEffect, useMemo, useState } from 'react';
import {
  Typography,
  Paper,
  Box,
  Chip,
  Button,
  Divider,
  CircularProgress,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';

import { Layout } from '../components/layout/Layout';
import { BookingList } from '../components/bookings/BookingList';
import { BookingForm } from '../components/bookings/BookingForm';

import { resourcesService } from '@/services/resources.service';
import { bookingsService } from '@/services/bookings.service';
import { LocalStorageService } from '@/services/localStorage.service';
import type { Resource, Booking } from '@/types';

export const ResourceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState<Resource | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);

  const user = useMemo(
    () => LocalStorageService.getUser<{ role?: 'USER' | 'ADMIN' }>(),
    []
  );

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const [r, rows] = await Promise.all([
          resourcesService.get(id),
          bookingsService.listByResource(id),
        ]);
        if (!alive) return;
        setResource(r);
        setBookings(rows);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || 'Failed to load resource');
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => { alive = false; };
  }, [id]);

  const status = (resource?.status ?? 'unknown') as NonNullable<Resource['status']>;

  const getStatusColor = (s: typeof status) =>
    s === 'up' ? 'success' : s === 'down' ? 'error' : 'default';

  const statusLabel = (s: typeof status) =>
    s === 'up' ? 'Up' : s === 'down' ? 'Down' : 'Unknown';

  const upcomingBookings = bookings.filter(b => new Date(b.end) > new Date());

  const refreshBookings = async () => {
    if (!id) return;
    try {
      const rows = await bookingsService.listByResource(id);
      setBookings(rows);
    } catch {/* ignore for now */}
  };

  const handleBookingSuccess = () => {
    refreshBookings();
  };

  if (loading) {
    return (
      <Layout title="Loading resource…">
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error || !resource) {
    return (
      <Layout title="Resource not found">
        <Box sx={{ mb: 2 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/resources')}>
            Back to Resources
          </Button>
        </Box>
        <Paper sx={{ p: 3 }}>
          <Typography color="error">{error ?? 'Resource not found'}</Typography>
        </Paper>
      </Layout>
    );
  }

  return (
    <Layout title={`Resource: ${resource.name}`}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/resources')}
          sx={{ mb: 2 }}
        >
          Back to Resources
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        <Box>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              {resource.name}
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" color="text.secondary">
                <strong>IP Address:</strong> {resource.ip}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                <strong>Type:</strong> {resource.type ?? '—'}
              </Typography>
            </Box>

            <Chip label={statusLabel(status)} color={getStatusColor(status) as any} />
          </Paper>

          {/* Allow bookings only for logged-in USERs and when resource is Up */}
          {user?.role === 'USER' && status === 'up' && (
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Create New Booking
              </Typography>
              <BookingForm resourceId={resource.id} onSuccess={handleBookingSuccess} />
            </Paper>
          )}
        </Box>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Upcoming Bookings
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <BookingList
            bookings={upcomingBookings}
            emptyMessage="No upcoming bookings"
          />
        </Paper>
      </Box>
    </Layout>
  );
};
