'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGetShifts } from '@/queries/useShift'
import { BarChart3, Users, Clock, Calendar } from 'lucide-react'
import { useMemo } from 'react'

export default function ShiftStats() {
  const { data } = useGetShifts()

  const stats = useMemo(() => {
    const shifts = data?.payload.result ?? []
    const totalShifts = shifts.length
    const totalHours = shifts.reduce((sum, shift) => sum + (shift.total_hours || 0), 0)
    const uniqueStaff = new Set(shifts.map((shift) => shift.staff_id)).size
    const today = new Date()
    const thisWeekShifts = shifts.filter((shift) => {
      const shiftDate = new Date(shift.shift_date)
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      return shiftDate >= weekStart && shiftDate <= weekEnd
    }).length

    return {
      totalShifts,
      totalHours,
      uniqueStaff,
      thisWeekShifts
    }
  }, [data])

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Shifts</CardTitle>
          <Calendar className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.totalShifts}</div>
          <p className='text-xs text-muted-foreground'>All time</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Total Hours</CardTitle>
          <Clock className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.totalHours}h</div>
          <p className='text-xs text-muted-foreground'>All time</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>Active Staff</CardTitle>
          <Users className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.uniqueStaff}</div>
          <p className='text-xs text-muted-foreground'>With scheduled shifts</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
          <CardTitle className='text-sm font-medium'>This Week</CardTitle>
          <BarChart3 className='h-4 w-4 text-muted-foreground' />
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold'>{stats.thisWeekShifts}</div>
          <p className='text-xs text-muted-foreground'>Scheduled shifts</p>
        </CardContent>
      </Card>
    </div>
  )
}
