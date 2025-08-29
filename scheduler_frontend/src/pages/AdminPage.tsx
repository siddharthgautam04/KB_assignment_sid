import React, { useMemo } from 'react';
import {
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useResourcesStore } from '../store/resources.store';
import { useBookingsStore } from '../store/bookings.store';
import { Layout } from '../components/layout/Layout';
import { MachineFormDialog } from '../components/admin/MachineFormDialog';
import { ConfirmDialog } from '../components/admin/ConfirmDialog';
import { BookingEditDialog } from '../components/admin/BookingEditDialog';
import type { Resource, Booking } from '../types';
import { useToast } from '@/hooks/use-toast';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>{value === index && <Box sx={{ py: 3 }}>{children}</Box>}</div>
);

export const AdminPage: React.FC = () => {
  const [tab, setTab] = React.useState(0);
  const [machineDialogOpen, setMachineDialogOpen] = React.useState(false);
  const [bookingEditDialogOpen, setBookingEditDialogOpen] = React.useState(false);
  const [editingResource, setEditingResource] = React.useState<Resource | undefined>();
  const [editingBooking, setEditingBooking] = React.useState<Booking | null>(null);
  const [confirmDialog, setConfirmDialog] = React.useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ open: false, title: '', message: '', onConfirm: () => {} });

  const { resources, loadResources, addResource, updateResource, deleteResource } = useResourcesStore();
  const { bookings, loadAll, deleteBooking, updateBooking } = useBookingsStore();

  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  React.useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        await loadResources();
        await loadAll();
      } catch (e: any) {
        if (alive) setErr(e?.message || 'Failed to load admin data');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [loadResources, loadAll]);

  const handleAddMachine = () => {
    setEditingResource(undefined);
    setMachineDialogOpen(true);
  };

  const handleEditMachine = (resource: Resource) => {
    setEditingResource(resource);
    setMachineDialogOpen(true);
  };

  const handleMachineSubmit = async (data: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingResource) {
        await updateResource(editingResource.id, data as Partial<Resource>);
        toast({ title: 'Machine updated' });
      } else {
        await addResource(data as any);
        toast({ title: 'Machine added' });
      }
      setMachineDialogOpen(false);
      setEditingResource(undefined);
    } catch (e: any) {
      toast({ title: 'Save failed', description: e?.message || 'Unknown error', variant: 'destructive' });
    }
  };

  const handleDeleteMachine = (resource: Resource) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Machine',
      message: `Are you sure you want to delete "${resource.name}"?`,
      onConfirm: async () => {
        try {
          await deleteResource(resource.id);
          toast({ title: 'Machine deleted' });
        } catch (e: any) {
          toast({ title: 'Delete failed', description: e?.message || 'Unknown error', variant: 'destructive' });
        }
      },
    });
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setBookingEditDialogOpen(true);
  };

  const handleBookingUpdate = async (patch: Partial<Omit<Booking, 'id' | 'createdAt'>>) => {
    if (!editingBooking) return false;
    const ok = await updateBooking(editingBooking.id, patch as any);
    if (ok) {
      toast({ title: 'Booking updated successfully!' });
      setEditingBooking(null);
      return true;
    } else {
      toast({
        title: 'Error updating booking',
        description: 'Time slot conflicts with existing booking',
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleDeleteBooking = (bookingId: string, bookingInfo: string) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Booking',
      message: `Are you sure you want to delete the booking: ${bookingInfo}?`,
      onConfirm: async () => {
        await deleteBooking(bookingId);
        toast({ title: 'Booking deleted' });
      },
    });
  };

  const statusLabel = (s?: Resource['status']) => (s ?? 'unknown') === 'up' ? 'Up' : (s ?? 'unknown') === 'down' ? 'Down' : 'Unknown';
  const statusColor = (s?: Resource['status']) => (s ?? 'unknown') === 'up' ? 'success' : (s ?? 'unknown') === 'down' ? 'error' : 'default';
  const formatDateTime = (iso: string) => new Date(iso).toLocaleString();

  const resourceNameById = useMemo(() => {
    const m = new Map<string, string>();
    resources.forEach(r => m.set(r.id, r.name));
    return m;
  }, [resources]);

  return (
    <Layout title="Admin Panel">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Administration
        </Typography>

        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Machines" />
          <Tab label="Bookings" />
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : err ? (
        <Typography color="error" sx={{ mb: 2 }}>{err}</Typography>
      ) : (
        <>
          {/* Machines */}
          <TabPanel value={tab} index={0}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5">Machines</Typography>
              <Button variant="contained" startIcon={<Add />} onClick={handleAddMachine}>
                Add Machine
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>IP Address</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {resources.map((resource) => {
                    const s = resource.status ?? 'unknown';
                    return (
                      <TableRow key={resource.id}>
                        <TableCell>{resource.name}</TableCell>
                        <TableCell>{resource.ip}</TableCell>
                        <TableCell>{resource.type ?? '—'}</TableCell>
                        <TableCell>
                          <Chip label={statusLabel(s)} color={statusColor(s) as any} size="small" />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => navigate(`/resources/${resource.id}`)} title="View Details">
                            <Visibility />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleEditMachine(resource)} title="Edit">
                            <Edit />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteMachine(resource)} color="error" title="Delete">
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Bookings */}
          <TabPanel value={tab} index={1}>
            <Typography variant="h5" gutterBottom>
              All Bookings
            </Typography>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Resource</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Employee ID</TableCell>
                    <TableCell>Start</TableCell>
                    <TableCell>End</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookings.map((b) => {
                    const resourceName = resourceNameById.get(b.resourceId) ?? 'Unknown';
                    const userName = b.user?.name ?? b.userId;
                    const empId = b.user?.employeeId ?? '';
                    return (
                      <TableRow key={b.id}>
                        <TableCell>{resourceName}</TableCell>
                        <TableCell>{userName}</TableCell>
                        <TableCell>{empId}</TableCell>
                        <TableCell>{formatDateTime(b.start)}</TableCell>
                        <TableCell>{formatDateTime(b.end)}</TableCell>
                        <TableCell>{formatDateTime(b.createdAt)}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleEditBooking(b)} title="Edit Booking">
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteBooking(b.id, `${resourceName} - ${userName}`)}
                            color="error"
                            title="Delete Booking"
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </>
      )}

      <MachineFormDialog
        open={machineDialogOpen}
        resource={editingResource}
        onClose={() => setMachineDialogOpen(false)}
        onSubmit={handleMachineSubmit}
      />

      <BookingEditDialog
        open={bookingEditDialogOpen}
        booking={editingBooking}
        onClose={() => {
          setBookingEditDialogOpen(false);
          setEditingBooking(null);
        }}
        onSubmit={handleBookingUpdate}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        onConfirm={confirmDialog.onConfirm}
      />
    </Layout>
  );
};