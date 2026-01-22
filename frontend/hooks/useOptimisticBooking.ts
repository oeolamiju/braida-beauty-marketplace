import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export interface OptimisticUpdate<T> {
  optimisticData: T;
  rollback: () => void;
}

export function useOptimisticBooking() {
  const queryClient = useQueryClient();
  const [isOptimistic, setIsOptimistic] = useState(false);

  const updateBookingStatus = <T,>(
    bookingId: string,
    newStatus: string,
    updateFn: () => Promise<T>
  ) => {
    setIsOptimistic(true);

    const previousBookings = queryClient.getQueryData(['bookings']);
    const previousBooking = queryClient.getQueryData(['booking', bookingId]);

    queryClient.setQueryData(['bookings'], (old: any) => {
      if (!old) return old;
      return old.map((booking: any) =>
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      );
    });

    queryClient.setQueryData(['booking', bookingId], (old: any) => {
      if (!old) return old;
      return { ...old, status: newStatus };
    });

    return updateFn()
      .then((result) => {
        queryClient.invalidateQueries({ queryKey: ['bookings'] });
        queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
        return result;
      })
      .catch((error) => {
        queryClient.setQueryData(['bookings'], previousBookings);
        queryClient.setQueryData(['booking', bookingId], previousBooking);
        throw error;
      })
      .finally(() => {
        setIsOptimistic(false);
      });
  };

  const acceptBooking = (bookingId: string, acceptFn: () => Promise<any>) => {
    return updateBookingStatus(bookingId, 'confirmed', acceptFn);
  };

  const declineBooking = (bookingId: string, declineFn: () => Promise<any>) => {
    return updateBookingStatus(bookingId, 'declined', declineFn);
  };

  const cancelBooking = (bookingId: string, cancelFn: () => Promise<any>) => {
    return updateBookingStatus(bookingId, 'cancelled', cancelFn);
  };

  return {
    isOptimistic,
    acceptBooking,
    declineBooking,
    cancelBooking,
    updateBookingStatus,
  };
}
