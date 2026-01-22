'use client'

import { useCancelReservationMutation, useGetTableQuery } from '@/queries/useTable'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import Loader from '@/components/loader'
import { useGetGuestByIdQuery, useGetCustomerByIdQuery } from '@/queries/useAccount'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, Phone, MessageSquare, Mail } from 'lucide-react'
import { handleErrorApi } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export default function ReservationDetail({ tableNumber }: { tableNumber: number }) {
  const t = useTranslations('table')
  const tCommon = useTranslations('common')
  const { data, isLoading, error } = useGetTableQuery({ id: tableNumber, enabled: !!tableNumber })
  const table = data?.payload.result
  const reservation = table?.reservation

  // Fetch guest data if it's a guest reservation
  const { data: guestData } = useGetGuestByIdQuery({
    id: reservation?.guest_id || '',
    enabled: !!reservation?.guest_id && !reservation?.is_customer
  })

  // Fetch customer data if it's a customer reservation
  const { data: customerData } = useGetCustomerByIdQuery({
    id: reservation?.customer_id || '',
    enabled: !!reservation?.customer_id && !!reservation?.is_customer
  })

  const guest = guestData?.payload.result
  const customer = customerData?.payload.result
  const cancelReservation = useCancelReservationMutation()

  const handleCancelReservation = async () => {
    if (!table || !reservation) return

    try {
      await cancelReservation.mutateAsync({
        table_number: table.number,
        token: table.token
      })

      toast.success(t('reservationCancelSuccess'))
    } catch (error) {
      handleErrorApi({
        error,
        setError: () => {}
      })
    }
  }

  if (isLoading) return <Loader />
  if (error) return <div className='text-red-500'>{t('reservationLoadError')}</div>

  if (!reservation || !reservation.reservation_time) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('noReservation')}</CardTitle>
          <CardDescription>{t('noReservationDesc', { tableNumber })}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Determine if it's a customer or guest reservation
  const isCustomer = reservation.is_customer && customer
  const person = isCustomer ? customer : guest

  if (!person) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('loadingReservation')}</CardTitle>
          <CardDescription>{t('fetchingReservation')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Loader />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <Calendar className='w-5 h-5' />
              {t('reservationDetails')}
            </CardTitle>
            <CardDescription className='mt-2'>{tCommon('table')} {table?.number}</CardDescription>
          </div>
          <Badge variant={isCustomer ? 'default' : 'secondary'}>{isCustomer ? tCommon('customer') : tCommon('guest')}</Badge>
        </div>
      </CardHeader>

      <CardContent className='space-y-4'>
        {/* Person Information */}
        <div className='flex items-center space-x-3 p-3 bg-gray-50 rounded-lg'>
          <Avatar className='w-12 h-12'>
            <AvatarImage src={isCustomer ? customer.avatar || undefined : undefined} alt={person.name} />
            <AvatarFallback>
              {person.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1'>
            <div className='flex items-center gap-2'>
              <User className='w-4 h-4 text-gray-500' />
              <span className='font-semibold'>{person.name}</span>
            </div>
            {person.phone && (
              <div className='flex items-center gap-2 text-sm text-gray-600'>
                <Phone className='w-3 h-3' />
                <span>{person.phone}</span>
              </div>
            )}
            {isCustomer && customer.email && (
              <div className='flex items-center gap-2 text-sm text-gray-600'>
                <Mail className='w-3 h-3' />
                <span> {customer.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Reservation Time */}
        <div className='flex items-center gap-3 p-3 border rounded-lg'>
          <Clock className='w-5 h-5 text-blue-500' />
          <div>
            <div className='font-semibold'>{t('reservationTime')}</div>
            <div className='text-sm text-gray-600'>
              {format(new Date(reservation.reservation_time), "EEEE, dd MMMM yyyy 'at' HH:mm")}
            </div>
          </div>
        </div>

        {/* Special Note */}
        {reservation.note && (
          <div className='flex items-start gap-3 p-3 border rounded-lg'>
            <MessageSquare className='w-5 h-5 text-green-500 mt-0.5' />
            <div className='flex-1'>
              <div className='font-semibold'>{t('specialRequestsLabel')}</div>
              <div className='text-sm text-gray-600 mt-1'>{reservation.note}</div>
            </div>
          </div>
        )}

        {/* Additional Customer Info */}
        {isCustomer && <div className='text-xs text-gray-500 bg-blue-50 p-2 rounded'>{t('customerId', { id: customer._id })}</div>}
      </CardContent>

      <CardFooter className='flex gap-2'>
        <Button
          variant='destructive'
          onClick={handleCancelReservation}
          disabled={cancelReservation.isPending}
          className='flex-1'
        >
          {cancelReservation.isPending ? t('cancelling') : t('cancelReservation')}
        </Button>
      </CardFooter>
    </Card>
  )
}
