'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Calendar, Clock, Users, MapPin, Notebook } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useGuestLogoutMutation, useGuestMe } from '@/queries/useGuest'
import { useCancelReservationMutation, useGetTableQuery } from '@/queries/useTable'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Loader from '@/components/loader'

export default function BookingDetails() {
  const { data } = useGuestMe()
  const guest = data?.payload.result
  const router = useRouter()

  const { data: tableData } = useGetTableQuery({
    id: guest?.table_number || 0,
    enabled: !!guest?.table_number
  })

  const table = tableData?.payload.result
  const logout = useGuestLogoutMutation()
  const cancelReservation = useCancelReservationMutation()

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)

  const handleCancelBooking = async () => {
    if (!table?.number || !table?.token || !guest?._id) {
      return
    }
    try {
      await Promise.all([
        cancelReservation.mutateAsync({
          table_number: table?.number,
          token: table?.token,
          guest_id: guest?._id
        }),
        logout.mutateAsync()
      ])

      toast.success('Reservation successfully canceled')
      router.push('/')
    } catch (error) {
      console.error('Error canceling reservation:', error)
      toast.error('An error occurred while canceling the reservation.')
    }
    setConfirmDialogOpen(false)
  }

  const openCancelDialog = () => {
    setConfirmDialogOpen(true)
  }

  if (!table || !guest) {
    return (
      <div className='flex justify-center items-start h-screen'>
        <Loader className='w-4 h-4' />
      </div>
    )
  }

  if (!table.reservation) {
    return (
      <div className='flex justify-center items-start h-screen'>
        <Loader className='w-4 h-4' />
      </div>
    )
  }

  return (
    <div className='max-w-md mx-auto'>
      <Card className='overflow-hidden shadow-md'>
        <CardHeader className='pb-3 border-b'>
          <div className='flex justify-between items-center'>
            <div>
              <CardTitle className='text-xl font-bold'>Table {table.number}</CardTitle>
              <p className='text-sm text-muted-foreground mt-1'>
                Guest: <span className='font-medium text-foreground'>{guest.name}</span>
              </p>
            </div>
            <Badge className={`bg-green-500 text-white hover:bg-green-600`}>{table.status}</Badge>
          </div>
        </CardHeader>

        <CardContent className='pt-4 space-y-5'>
          {/* Thời gian và số người */}
          <div className='bg-muted/40 rounded-lg'>
            <div className='grid grid-cols-2 gap-3'>
              <div className='flex items-center gap-2'>
                <Calendar className='h-5 w-5 text-primary' />
                <div className='text-sm'>
                  {format(table.reservation.reservation_time || new Date(), 'EEEE, dd/MM/yyyy')}
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <Clock className='h-5 w-5 text-primary' />
                <div className='text-sm font-medium'>
                  {format(table.reservation.reservation_time || new Date(), 'HH:mm')}
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin bàn */}
          <div className='space-y-3'>
            <div className='flex items-start gap-3'>
              <MapPin className='h-5 w-5 text-muted-foreground shrink-0 mt-0.5' />
              <div className='text-sm'>{table.location}</div>
            </div>

            <div className='flex items-start gap-3'>
              <Users className='h-5 w-5 text-muted-foreground shrink-0 mt-0.5' />
              <div className='text-sm'>{table.capacity} people</div>
            </div>

            {table.reservation.note && (
              <div className='flex items-start gap-3'>
                <Notebook className='h-5 w-5 text-muted-foreground shrink-0 mt-0.5' />
                <div className='text-sm'>{table.reservation.note}</div>
              </div>
            )}
          </div>

          {/* Số bàn */}
          <div className='bg-primary/10 p-4 rounded-lg text-center'>
            <div className='font-medium'>
              Table: <span className='text-primary font-bold text-lg'>{table.number}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className='pt-2 pb-4'>
          <Button
            variant='destructive'
            onClick={openCancelDialog}
            className='w-full font-medium'
            disabled={cancelReservation.isPending}
          >
            {cancelReservation.isPending ? 'Canceling' : 'Cancel Booking'}
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className='max-w-xs mx-auto'>
          <DialogHeader>
            <DialogTitle>Confirm cancellation of reservation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this reservation? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className='py-3 space-y-1'>
            <p className='font-medium'>Table {table.number}</p>
            <p className='text-sm text-muted-foreground'>
              {format(table.reservation.reservation_time || new Date(), 'EEEE, dd/MM/yyyy')} At{' '}
              {format(table.reservation.reservation_time || new Date(), 'HH:mm')}
            </p>
          </div>
          <DialogFooter className='flex flex-col sm:flex-row gap-2'>
            <Button variant='outline' onClick={() => setConfirmDialogOpen(false)} className='w-full sm:w-auto'>
              Back
            </Button>
            <Button variant='destructive' onClick={handleCancelBooking} className='w-full sm:w-auto'>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
