import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Resource } from '@/types'; // ✅ import from types, not the service

const resourceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  ip: z
    .string()
    .regex(
      /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/,
      'Invalid IPv4 address'
    ),
  type: z.string().optional().transform(v => (v && v.trim().length ? v.trim() : undefined)),
  status: z.enum(['up', 'down', 'unknown']),
});

type ResourceForm = z.infer<typeof resourceSchema>;

interface MachineFormDialogProps {
  open: boolean;
  resource?: Resource; // if present => edit mode
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    ip: string;
    type?: string;
    status: 'up' | 'down' | 'unknown';
  }) => void;
}

export const MachineFormDialog: React.FC<MachineFormDialogProps> = ({
  open,
  resource,
  onClose,
  onSubmit,
}) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ResourceForm>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      name: resource?.name ?? '',
      ip: resource?.ip ?? '',
      type: resource?.type ?? '',
      status: (resource?.status ?? 'unknown') as 'up' | 'down' | 'unknown',
    },
  });

  useEffect(() => {
    reset({
      name: resource?.name ?? '',
      ip: resource?.ip ?? '',
      type: resource?.type ?? '',
      status: (resource?.status ?? 'unknown') as 'up' | 'down' | 'unknown',
    });
  }, [resource, reset, open]);

  const submit = (data: ResourceForm) => {
    onSubmit({
      name: data.name,
      ip: data.ip,
      ...(data.type ? { type: data.type } : {}),
      status: data.status,
    });
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{resource ? 'Edit Resource' : 'Add New Resource'}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Name"
          margin="normal"
          {...register('name')}
          error={!!errors.name}
          helperText={errors.name?.message}
        />

        <TextField
          fullWidth
          label="IP Address"
          margin="normal"
          placeholder="192.168.1.100"
          {...register('ip')}
          error={!!errors.ip}
          helperText={errors.ip?.message}
        />

        <TextField
          fullWidth
          label="Type (optional)"
          margin="normal"
          placeholder="e.g., Linux Server"
          {...register('type')}
          error={!!errors.type}
          helperText={errors.type?.message as string | undefined}
        />

        <FormControl fullWidth margin="normal" error={!!errors.status}>
          <InputLabel id="status-label">Status</InputLabel>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                labelId="status-label"
                label="Status"
                value={field.value}
                onChange={field.onChange}
              >
                <MenuItem value="up">Up</MenuItem>
                <MenuItem value="down">Down</MenuItem>
                <MenuItem value="unknown">Unknown</MenuItem>
              </Select>
            )}
          />
        </FormControl>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit(submit)} variant="contained">
          {resource ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};