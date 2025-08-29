import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Booking } from '../../types';

const bookingSchema = z.object({
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
}).refine((data) => {
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  return start < end;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingEditDialogProps {
  open: boolean;
  booking: Booking | null;
  onClose: () => void;
  onSubmit: (patch: Partial<Omit<Booking, 'id' | 'createdAt'>>) => boolean | Promise<boolean>;
}

export const BookingEditDialog: React.FC<BookingEditDialogProps> = ({
  open,
  booking,
  onClose,
  onSubmit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookingFormData>({ resolver: zodResolver(bookingSchema) });

  useEffect(() => {
    if (booking && open) {
      reset({
        startTime: new Date(booking.start).toISOString().slice(0, 16),
        endTime: new Date(booking.end).toISOString().slice(0, 16),
      });
    }
  }, [booking, open, reset]);

  const handleFormSubmit = async (data: BookingFormData) => {
    if (!booking) return;
    const patch = {
      start: new Date(data.startTime).toISOString(),
      end: new Date(data.endTime).toISOString(),
    };
    const ok = await onSubmit(patch);
    if (ok) {
      onClose();
      reset();
    }
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  if (!booking) return null;

  const userLabel = booking.user
    ? `${booking.user.name}${booking.user.employeeId ? ` (${booking.user.employeeId})` : ''}`
    : booking.userId;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Read-only context */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Resource</Label>
              <Input readOnly value={booking.resourceId} />
            </div>
            <div className="space-y-2">
              <Label>User</Label>
              <Input readOnly value={userLabel} />
            </div>
          </div>

          {/* Editable times */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                {...register('startTime')}
                className={errors.startTime ? 'border-destructive' : ''}
              />
              {errors.startTime && (
                <p className="text-sm text-destructive">{errors.startTime.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="datetime-local"
                {...register('endTime')}
                className={errors.endTime ? 'border-destructive' : ''}
              />
              {errors.endTime && (
                <p className="text-sm text-destructive">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              Update Booking
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};