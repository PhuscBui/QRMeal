'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCheckInMutation, useCheckOutMutation, useTodayAttendanceQuery } from '@/queries/useAttendance'
import { useTranslations } from 'next-intl'
import { Clock, LogIn, LogOut } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { toast } from 'sonner'
import { handleErrorApi } from '@/lib/utils'

export function CheckInOut() {
  const t = useTranslations('attendance')
  const tCommon = useTranslations('common')
  
  const todayAttendanceQuery = useTodayAttendanceQuery(true)
  const checkInMutation = useCheckInMutation()
  const checkOutMutation = useCheckOutMutation()

  const attendance = todayAttendanceQuery.data?.payload.result
  const hasCheckedIn = !!attendance?.check_in
  const hasCheckedOut = !!attendance?.check_out

  const handleCheckIn = async () => {
    try {
      await checkInMutation.mutateAsync()
      toast.success(t('checkInSuccess'))
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  const handleCheckOut = async () => {
    try {
      await checkOutMutation.mutateAsync()
      toast.success(t('checkOutSuccess'))
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  const getStatusBadge = () => {
    if (!attendance) return null
    const status = attendance.status
    if (status === 'on_time') {
      return <span className='bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm font-medium'>{t('onTime')}</span>
    }
    if (status === 'late') {
      return <span className='bg-yellow-100 text-yellow-800 rounded-full px-3 py-1 text-sm font-medium'>{t('late')}</span>
    }
    return <span className='bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-medium'>{t('present')}</span>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Clock className='h-5 w-5' />
          {t('timeClock')}
        </CardTitle>
        <CardDescription>{t('timeClockDesc')}</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='text-center space-y-2'>
          <div className='text-2xl font-bold'>{format(new Date(), 'EEEE, dd MMMM yyyy', { locale: vi })}</div>
          <div className='text-lg text-muted-foreground'>{format(new Date(), 'HH:mm:ss')}</div>
        </div>

        {attendance && (
          <div className='space-y-4 p-4 bg-muted rounded-lg'>
            <div className='flex items-center justify-between'>
              <span className='font-medium'>{t('status')}:</span>
              {getStatusBadge()}
            </div>
            {attendance.check_in && (
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>{t('checkInTime')}:</span>
                <span className='font-medium'>
                  {format(new Date(attendance.check_in), 'HH:mm:ss', { locale: vi })}
                </span>
              </div>
            )}
            {attendance.check_out && (
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>{t('checkOutTime')}:</span>
                <span className='font-medium'>
                  {format(new Date(attendance.check_out), 'HH:mm:ss', { locale: vi })}
                </span>
              </div>
            )}
            {attendance.check_in && attendance.check_out && (
              <div className='flex items-center justify-between pt-2 border-t'>
                <span className='font-medium'>{t('totalHours')}:</span>
                <span className='font-bold text-lg'>
                  {(
                    (new Date(attendance.check_out).getTime() - new Date(attendance.check_in).getTime()) /
                    (1000 * 60 * 60)
                  ).toFixed(2)}{' '}
                  {t('hours')}
                </span>
              </div>
            )}
          </div>
        )}

        <div className='flex gap-4'>
          <Button
            onClick={handleCheckIn}
            disabled={hasCheckedIn || checkInMutation.isPending || checkOutMutation.isPending}
            className='flex-1'
            size='lg'
          >
            <LogIn className='mr-2 h-5 w-5' />
            {checkInMutation.isPending ? t('checkingIn') : t('checkIn')}
          </Button>
          <Button
            onClick={handleCheckOut}
            disabled={!hasCheckedIn || hasCheckedOut || checkInMutation.isPending || checkOutMutation.isPending}
            variant='outline'
            className='flex-1'
            size='lg'
          >
            <LogOut className='mr-2 h-5 w-5' />
            {checkOutMutation.isPending ? t('checkingOut') : t('checkOut')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

