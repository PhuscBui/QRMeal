'use client'

import { useEffect, useState } from 'react'
import { Users, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTableListQuery, useCancelReservationMutation, useUpdateTableStatusMutation } from '@/queries/useTable'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import CustomerReservationForm from './reservation-form'
import { useAccountMe } from '@/queries/useAccount'
import { TableStatus } from '@/constants/type'
import { useRouter } from 'next/navigation'
import { TableInfo } from '@/types/common.type'

// Map table status to Vietnamese labels and colors
const statusConfig = {
  available: { label: 'Available', color: 'bg-green-500', icon: CheckCircle },
  occupied: { label: 'In use', color: 'bg-red-500', icon: Users },
  hidden: { label: 'Unavailable', color: 'bg-gray-500', icon: XCircle }
}

export default function ReservationsPage() {
  const [selectedTab, setSelectedTab] = useState('upcoming')
  const [isReserveOpen, setIsReserveOpen] = useState(false)
  const { data: accountData } = useAccountMe()
  const account = accountData?.payload.result
  const { data: tablesData } = useTableListQuery()
  const cancelReservationMutation = useCancelReservationMutation()
  const updateTableStatusMutation = useUpdateTableStatusMutation()
  const tables = tablesData?.payload.result || []
  const tablesReserved = tables.filter((table) => table?.reservation?.customer_id === account?._id)
  const router = useRouter()

  useEffect(() => {
    tablesReserved.forEach((table) => {
      if (table.status === TableStatus.Reserved && new Date(table?.reservation?.reservation_time) < new Date()) {
        updateTableStatusMutation.mutate({
          id: table.number,
          status: TableStatus.Occupied
        })
      }
    })
  }, [tablesReserved, updateTableStatusMutation])

  // Filter tables based on reservation status and time
  const getFilteredReservations = () => {
    if (!tables) return []

    const now = new Date()

    return tables
      .filter(
        (table) =>
          table.reservation || (table.status === TableStatus.Occupied && table.current_customer_id === account?._id)
      ) // Only tables with reservations
      .map((table) => ({
        id: table._id,
        tableNumber: table.number,
        capacity: table.capacity,
        location: table.location,
        status: table.status,
        reservation: table.reservation,
        token: table.token,
        reservationTime: new Date(table.reservation?.reservation_time),
        note: table.reservation?.note,
        customerId: table.reservation?.customer_id,
        guestId: table.reservation?.guest_id,
        isCustomer: table.reservation?.is_customer
      }))
      .filter((reservation) => {
        const reservationTime = reservation?.reservationTime

        switch (selectedTab) {
          case 'upcoming':
            return reservationTime >= now
          case 'past':
            return reservation.status === TableStatus.Occupied
          default:
            return true
        }
      })
      .sort((a, b) => {
        if (selectedTab === 'past') {
          return b.reservationTime.getTime() - a.reservationTime.getTime() // Most recent first for past
        }
        return a.reservationTime.getTime() - b.reservationTime.getTime() // Earliest first for upcoming
      })
  }

  type ReservationItem = {
    id: string
    tableNumber: number
    capacity: number
    location: string
    status: 'Available' | 'Occupied' | 'Hidden' | 'Reserved'
    reservation: {
      guest_id: string | null
      customer_id: string | null
      reservation_time: Date
      is_customer?: boolean
      note?: string
    }
    token: string
    reservationTime: Date
    note?: string
    customerId: string | null
    guestId: string | null
    isCustomer?: boolean
  }

  const orderMenu = (table: ReservationItem) => {
    const tableInfo: TableInfo = {
      tableId: table.id,
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      location: table.location,
      status: table.status,
      token: table.token
    }
    localStorage.setItem('orderType', 'dine-in')
    localStorage.setItem('tableInfo', JSON.stringify(tableInfo))
    router.push(`dine-in/menu`)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusInfo = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.available
  }

  const handleCancelReservation = async (tableNumber: number, token: string) => {
    try {
      await cancelReservationMutation.mutateAsync({
        table_number: tableNumber,
        token: token
      })
    } catch (error) {
      console.error('Error cancelling reservation:', error)
    }
  }

  const reservations = getFilteredReservations()

  return (
    <div className='container mx-auto px-4 py-6 max-w-4xl'>
      <div className='mb-8 flex items-center justify-between gap-3'>
        <div>
          <h1 className='text-3xl font-bold mb-2'>My Reservations</h1>
          <p className='text-muted-foreground'>Manage restaurant reservations</p>
        </div>
        <Button onClick={() => setIsReserveOpen(true)}>Reserve a table</Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className='mb-8'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='upcoming'>Upcoming</TabsTrigger>
          <TabsTrigger value='past'>Past</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className='space-y-6'>
        {reservations.length === 0 ? (
          <Card>
            <CardContent className='pt-6'>
              <div className='text-center text-muted-foreground'>
                <AlertCircle className='h-12 w-12 mx-auto mb-4 opacity-50' />
                <p className='text-lg font-medium mb-2'>No reservations</p>
                <p className='text-sm'>
                  {selectedTab === 'upcoming' && 'You have no upcoming reservations.'}
                  {selectedTab === 'past' && 'You have no reservation history.'}
                </p>
              </div>

              <div className='text-center mt-4'>
                <p>Reserve a table to experience our service!</p>
                <Button className='mt-2' onClick={() => setIsReserveOpen(true)}>
                  Reserve a table now
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          reservations.map((reservation) => {
            const statusInfo = getStatusInfo(reservation.status)
            const StatusIcon = statusInfo.icon
            const isUpcoming = reservation.reservationTime >= new Date()
            const canCancel = isUpcoming && reservation.status !== 'Hidden'
            const canOrder = reservation.status === 'Occupied'

            return (
              <Card key={reservation.id}>
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div>
                      <CardTitle>Table Number {reservation.tableNumber}</CardTitle>
                      <CardDescription>
                        {formatDate(reservation.reservationTime)} • {formatTime(reservation.reservationTime)}
                      </CardDescription>
                    </div>
                    <Badge className={`${statusInfo.color} text-white`}>
                      <StatusIcon className='h-3 w-3 mr-1' />
                      {statusInfo.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='grid md:grid-cols-2 gap-4'>
                      <div className='flex items-center gap-3'>
                        <Users className='h-5 w-5 text-muted-foreground' />
                        <div>
                          <p className='font-medium'>Capacity: {reservation.capacity} people</p>
                          <p className='text-sm text-muted-foreground'>Maximum number of guests</p>
                        </div>
                      </div>
                      <div className='flex items-center gap-3'>
                        <MapPin className='h-5 w-5 text-muted-foreground' />
                        <div>
                          <p className='font-medium'>{reservation.location}</p>
                          <p className='text-sm text-muted-foreground'>Location table</p>
                        </div>
                      </div>
                    </div>

                    {/* Customer/Guest Info */}
                    <div className='bg-muted/50 p-3 rounded-lg'>
                      <p className='text-sm'>
                        <span className='font-medium'>Customer Type:</span>{' '}
                        {reservation.isCustomer ? 'Member' : 'Guest'}
                      </p>
                      {(reservation.customerId || reservation.guestId) && (
                        <p className='text-sm mt-1'>
                          <span className='font-medium'>ID:</span> {reservation.customerId || reservation.guestId}
                        </p>
                      )}
                    </div>

                    {reservation.note && (
                      <div className='bg-muted p-3 rounded-lg'>
                        <p className='text-sm'>
                          <span className='font-medium'>Ghi chú:</span> {reservation.note}
                        </p>
                      </div>
                    )}

                    <div className='flex gap-2'>
                      {canCancel && (
                        <Button
                          variant='outline'
                          size='sm'
                          className='text-destructive'
                          onClick={() => handleCancelReservation(reservation.tableNumber, reservation.token)}
                          disabled={cancelReservationMutation.isPending}
                        >
                          <XCircle className='h-4 w-4 mr-2' />
                          {cancelReservationMutation.isPending ? 'Canceling...' : 'Cancel Reservation'}
                        </Button>
                      )}
                      {canOrder && (
                        <Button variant='secondary' size='sm' onClick={() => orderMenu(reservation)}>
                          <CheckCircle className='h-4 w-4 mr-2' />
                          Order Now
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <Dialog open={isReserveOpen} onOpenChange={setIsReserveOpen}>
        <DialogContent className='sm:max-w-[560px]'>
          <DialogHeader>
            <DialogTitle>Đặt bàn</DialogTitle>
            <DialogDescription>Chọn bàn, thời gian và ghi chú (nếu có)</DialogDescription>
          </DialogHeader>
          <CustomerReservationForm setIsReserveOpen={setIsReserveOpen} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
