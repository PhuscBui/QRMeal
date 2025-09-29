'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useGetMyShifts, useCancelShiftRequestMutation } from '@/queries/useShift'
import { Clock, Calendar, BarChart3, X, Edit3 } from 'lucide-react'
import { format } from 'date-fns'
import { ShiftRequestStatus } from '@/constants/type'
import AddShiftRequest from './add-shift-request'
import EditShiftRequest from './edit-shift-request'
import { toast } from 'sonner'
import { handleErrorApi } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'

export default function MyShifts() {
  const [fromDate, setFromDate] = useState<Date>()
  const [toDate, setToDate] = useState<Date>()
  const [cancelRequestId, setCancelRequestId] = useState<string>('')
  const [editRequestId, setEditRequestId] = useState<string | undefined>(undefined)

  const { data, refetch, isLoading } = useGetMyShifts({
    from_date: fromDate,
    to_date: toDate
  })

  const cancelMutation = useCancelShiftRequestMutation()

  const shifts = data?.payload.result ?? []
  const summary = data?.payload.summary ?? {
    total_shifts: 0,
    approved_shifts: 0,
    pending_shifts: 0,
    rejected_shifts: 0,
    cancelled_shifts: 0,
    total_hours: 0
  }

  const handleFilter = () => {
    refetch()
  }

  const clearFilter = () => {
    setFromDate(undefined)
    setToDate(undefined)
  }

  const handleCancelRequest = async () => {
    if (!cancelRequestId) return

    try {
      const result = await cancelMutation.mutateAsync(cancelRequestId)
      toast('Success', {
        description: result.payload.message
      })
      setCancelRequestId('')
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case ShiftRequestStatus.Approved:
        return <Badge className='bg-green-100 text-green-800'>Approved</Badge>
      case ShiftRequestStatus.Pending:
        return <Badge className='bg-yellow-100 text-yellow-800'>Pending</Badge>
      case ShiftRequestStatus.Rejected:
        return <Badge className='bg-red-100 text-red-800'>Rejected</Badge>
      case ShiftRequestStatus.Cancelled:
        return <Badge className='bg-gray-100 text-gray-800'>Cancelled</Badge>
      default:
        return <Badge variant='secondary'>{status}</Badge>
    }
  }

  return (
    <div className='space-y-6'>
      {/* Add Request Button */}
      <div className='flex justify-end'>
        <AddShiftRequest />
      </div>

      {/* Edit Request Dialog */}
      <EditShiftRequest id={editRequestId} setId={setEditRequestId} />

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Calendar className='h-5 w-5' />
            Filter Shifts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex gap-4 items-end'>
            <div className='grid gap-2'>
              <Label htmlFor='from-date'>From Date</Label>
              <Input
                id='from-date'
                type='date'
                value={fromDate ? format(fromDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => setFromDate(e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='to-date'>To Date</Label>
              <Input
                id='to-date'
                type='date'
                value={toDate ? format(toDate, 'yyyy-MM-dd') : ''}
                onChange={(e) => setToDate(e.target.value ? new Date(e.target.value) : undefined)}
              />
            </div>
            <Button onClick={handleFilter} disabled={isLoading}>
              Apply Filter
            </Button>
            <Button variant='outline' onClick={clearFilter}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <BarChart3 className='h-5 w-5' />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-primary'>{summary.total_shifts}</div>
              <div className='text-sm text-muted-foreground'>Total</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>{summary.approved_shifts}</div>
              <div className='text-sm text-muted-foreground'>Approved</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-yellow-600'>{summary.pending_shifts}</div>
              <div className='text-sm text-muted-foreground'>Pending</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-red-600'>{summary.rejected_shifts}</div>
              <div className='text-sm text-muted-foreground'>Rejected</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-primary'>{summary.total_hours}h</div>
              <div className='text-sm text-muted-foreground'>Total Hours</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shifts List */}
      <Card>
        <CardHeader>
          <CardTitle>My Shifts</CardTitle>
          <CardDescription>Your scheduled work shifts and requests</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='text-center py-8'>Loading...</div>
          ) : shifts.length === 0 ? (
            <div className='text-center py-8 text-muted-foreground'>No shifts found for the selected period.</div>
          ) : (
            <div className='space-y-4'>
              {shifts.map((shift) => (
                <div key={shift._id} className='flex items-center justify-between p-4 border rounded-lg'>
                  <div className='space-y-1 flex-1'>
                    <div className='font-medium flex items-center gap-2'>
                      <Calendar className='h-4 w-4' />
                      {format(new Date(shift.shift_date), 'PPP')}
                    </div>
                    <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                      <span className='flex items-center gap-1'>
                        <Clock className='h-3 w-3' />
                        {shift.start_time} - {shift.end_time}
                      </span>
                      <Badge variant='secondary'>{shift.total_hours || 0}h</Badge>
                    </div>
                    {shift.reason && (
                      <div className='text-sm text-muted-foreground'>
                        <strong>Reason:</strong> {shift.reason}
                      </div>
                    )}
                    {shift.review_note && (
                      <div className='text-sm text-muted-foreground'>
                        <strong>Manager Note:</strong> {shift.review_note}
                      </div>
                    )}
                  </div>
                  <div className='flex items-center gap-2'>
                    {getStatusBadge(shift.status)}
                    {shift.status === ShiftRequestStatus.Pending && (
                      <>
                        <Button variant='outline' size='sm' onClick={() => setEditRequestId(shift._id)}>
                          <Edit3 className='h-4 w-4' />
                          Edit
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => setCancelRequestId(shift._id)}
                          disabled={cancelMutation.isPending}
                        >
                          <X className='h-4 w-4' />
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cancel Request Dialog */}
      <AlertDialog open={!!cancelRequestId} onOpenChange={(open) => !open && setCancelRequestId('')}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Shift Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this shift request? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep Request</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelRequest} disabled={cancelMutation.isPending}>
              {cancelMutation.isPending ? 'Cancelling...' : 'Yes, Cancel Request'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
