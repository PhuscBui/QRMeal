"use client";

import { useCancelReservationMutation, useGetTableQuery } from "@/queries/useTable";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import Loader from "@/components/loader";
import { useGetGuestByIdQuery } from "@/queries/useAccount";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ReservationDetail({ tableNumber }: { tableNumber: number }) {
  const { data, isLoading, error } = useGetTableQuery({ id: tableNumber, enabled: !!tableNumber });
  const table = data?.payload.result;
  const reservation = table?.reservation;
  const { data: guestData } = useGetGuestByIdQuery(reservation?.guest_id || '');
  const guest = guestData?.payload.result;

  const cancelReservation = useCancelReservationMutation();

  const handleCancelReservation = async () => {
     await cancelReservation.mutateAsync({ 
        guest_id: reservation?.guest_id || '',
        table_number: table?.number || 0,
        token: table?.token || '',
     });

     toast.success('Reservation cancelled successfully');
  }

  if (isLoading ) return <Loader />;
  if (error) return <div className="text-red-500">Failed to load reservation details.</div>;
  if (!reservation || !reservation.reservation_time) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Reservation</CardTitle>
          <CardDescription>This table currently has no reservation.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reservation Details</CardTitle>
        <CardDescription>Table Number: {table?.number}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <span className="font-semibold">Reservation Time:</span> {format(new Date(reservation.reservation_time), "dd/MM/yyyy HH:mm")}
        </div>
        <div className="flex flex-col gap-2">
         <span>  <span className="font-semibold">Guest:</span> {guest?.name} </span>
         <span>  <span className="font-semibold">Phone:</span> {guest?.phone} </span>
        </div>
        {reservation.note && (
          <div>
            <span className="font-semibold">Note:</span> {reservation.note}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant={"destructive"} onClick={handleCancelReservation}
          disabled={cancelReservation.isPending}
        >
          {cancelReservation.isPending ? 'Cancelling...' : 'Cancel Reservation'}
        </Button>
      </CardFooter>
    </Card>
  );
}
