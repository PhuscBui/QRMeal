'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCheckInMutation, useCheckOutMutation, useTodayAttendanceQuery } from '@/queries/useAttendance'
import { useTranslations } from 'next-intl'
import { Clock, LogIn, LogOut } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { handleErrorApi } from '@/lib/utils'
import { useState, useEffect } from 'react'

export function CheckInOut() {
  const t = useTranslations('attendance')

  const todayAttendanceQuery = useTodayAttendanceQuery(true)
  const checkInMutation = useCheckInMutation()
  const checkOutMutation = useCheckOutMutation()

  const attendance = todayAttendanceQuery.data?.payload.result
  const hasCheckedIn = !!attendance?.check_in
  const hasCheckedOut = !!attendance?.check_out

  // Use state to avoid hydration mismatch
  const [currentDate, setCurrentDate] = useState<Date | null>(null)
  const [currentTime, setCurrentTime] = useState<string>('')

  useEffect(() => {
    // Only set date/time on client side
    const now = new Date()
    setCurrentDate(now)
    setCurrentTime(format(now, 'HH:mm:ss'))

    // Update time every second
    const interval = setInterval(() => {
      const now = new Date()
      setCurrentDate(now)
      setCurrentTime(format(now, 'HH:mm:ss'))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleCheckIn = async () => {
    try {
      await checkInMutation.mutateAsync(undefined)
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
      return (
        <span className='bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm font-medium'>{t('onTime')}</span>
      )
    }
    if (status === 'late') {
      return (
        <span className='bg-yellow-100 text-yellow-800 rounded-full px-3 py-1 text-sm font-medium'>{t('late')}</span>
      )
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
      <CardContent className='space-y-4 sm:space-y-6'>
        <div className='text-center space-y-2'>
          <div className='text-lg sm:text-2xl font-bold px-2'>
            {currentDate ? format(currentDate, 'EEEE, dd MMMM yyyy') : '...'}
          </div>
          <div className='text-base sm:text-lg text-muted-foreground'>{currentTime || '...'}</div>
        </div>

        {attendance && (
          <div className='space-y-3 sm:space-y-4 p-3 sm:p-4 bg-muted rounded-lg'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
              <span className='font-medium text-sm sm:text-base'>{t('status')}:</span>
              <div className='flex justify-center sm:justify-end'>{getStatusBadge()}</div>
            </div>
            {attendance.check_in && (
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2'>
                <span className='text-muted-foreground text-sm sm:text-base'>{t('checkInTime')}:</span>
                <span className='font-medium text-sm sm:text-base'>
                  {format(new Date(attendance.check_in), 'HH:mm:ss')}
                </span>
              </div>
            )}
            {attendance.check_out && (
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2'>
                <span className='text-muted-foreground text-sm sm:text-base'>{t('checkOutTime')}:</span>
                <span className='font-medium text-sm sm:text-base'>
                  {format(new Date(attendance.check_out), 'HH:mm:ss')}
                </span>
              </div>
            )}
            {attendance.check_in && attendance.check_out && (
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 sm:pt-3 border-t gap-1 sm:gap-2'>
                <span className='font-medium text-sm sm:text-base'>{t('totalHours')}:</span>
                <span className='font-bold text-base sm:text-lg'>
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

        <div className='flex flex-col sm:flex-row gap-2 sm:gap-4'>
          <Button
            onClick={handleCheckIn}
            disabled={hasCheckedIn || checkInMutation.isPending || checkOutMutation.isPending}
            className='flex-1 w-full sm:w-auto'
            size='lg'
          >
            <LogIn className='mr-2 h-4 w-4 sm:h-5 sm:w-5' />
            <span className='text-sm sm:text-base'>{checkInMutation.isPending ? t('checkingIn') : t('checkIn')}</span>
          </Button>
          <Button
            onClick={handleCheckOut}
            disabled={!hasCheckedIn || hasCheckedOut || checkInMutation.isPending || checkOutMutation.isPending}
            variant='outline'
            className='flex-1 w-full sm:w-auto'
            size='lg'
          >
            <LogOut className='mr-2 h-4 w-4 sm:h-5 sm:w-5' />
            <span className='text-sm sm:text-base'>
              {checkOutMutation.isPending ? t('checkingOut') : t('checkOut')}
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
