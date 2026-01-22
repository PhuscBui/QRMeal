'use client'

import { CaretSortIcon } from '@radix-ui/react-icons'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShiftType } from '@/schemaValidations/shift.schema'
import { createContext, useContext, useEffect, useState } from 'react'
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
import { useSearchParams } from 'next/navigation'
import AutoPagination from '@/components/auto-pagination'
import {
  useDeleteShiftMutation,
  useGetShifts,
  useGetPendingRequests,
  useReviewShiftRequestMutation
} from '@/queries/useShift'
import { toast } from 'sonner'
import { handleErrorApi } from '@/lib/utils'
import { Pen, Trash, Clock, User, CheckCircle, XCircle, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useGetAccountList } from '@/queries/useAccount'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { ReviewShiftRequestBody, ReviewShiftRequestBodyType } from '@/schemaValidations/shift.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ShiftRequestStatus } from '@/constants/type'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useTranslations } from 'next-intl'
import EditShift from '@/features/manage/shifts/edit-shift'
import ShiftStats from '@/features/manage/shifts/shift-stats'
import AddShift from '@/features/manage/shifts/add-shift'

type ShiftItem = ShiftType

const ShiftManagementContext = createContext<{
  setShiftIdEdit: (value: string) => void
  shiftIdEdit: string | undefined
  shiftDelete: ShiftItem | null
  setShiftDelete: (value: ShiftItem | null) => void
  setRequestIdReview: (value: string) => void
  requestIdReview: string | undefined
}>({
  setShiftIdEdit: () => {},
  shiftIdEdit: undefined,
  shiftDelete: null,
  setShiftDelete: () => {},
  setRequestIdReview: () => {},
  requestIdReview: undefined
})

// Columns for approved shifts table
const getShiftsColumns = (t: ReturnType<typeof useTranslations>): ColumnDef<ShiftType>[] => [
  {
    accessorKey: 'index',
    header: t('no'),
    cell: ({ row }) => <div>{row.index + 1}</div>
  },
  {
    id: 'staff_name',
    accessorFn: (row) => row.staff_info?.name ?? '',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className='font-bold'
      >
        <User className='mr-2 h-4 w-4' />
        {t('staffName')}
        <CaretSortIcon className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ getValue }) => <div className='font-medium'>{String(getValue() || 'N/A')}</div>
  },
  {
    accessorKey: 'shift_date',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className='font-bold'
      >
        {t('date')}
        <CaretSortIcon className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('shift_date'))
      return (
        <div>
          {date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })}
        </div>
      )
    }
  },
  {
    accessorKey: 'start_time',
    header: t('startTime'),
    cell: ({ row }) => (
      <Badge variant='outline' className='font-mono'>
        <Clock className='mr-1 h-3 w-3' />
        {row.getValue('start_time')}
      </Badge>
    )
  },
  {
    accessorKey: 'end_time',
    header: t('endTime'),
    cell: ({ row }) => (
      <Badge variant='outline' className='font-mono'>
        <Clock className='mr-1 h-3 w-3' />
        {row.getValue('end_time')}
      </Badge>
    )
  },
  {
    accessorKey: 'total_hours',
    header: t('totalHours'),
    cell: ({ row }) => (
      <Badge variant='secondary' className='font-medium'>
        {row.getValue('total_hours') || 0}h
      </Badge>
    )
  },
  {
    accessorKey: 'staff_info.phone',
    header: t('phone'),
    cell: ({ row }) => <div className='text-sm text-muted-foreground'>{row.original.staff_info?.phone || 'N/A'}</div>
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: function Actions({ row }) {
      const { setShiftIdEdit, setShiftDelete } = useContext(ShiftManagementContext)

      const openEditShift = () => {
        setShiftIdEdit(row.original._id)
      }

      const openDeleteShift = () => {
        setShiftDelete(row.original)
      }

      return (
        <div className='flex gap-2'>
          <Button variant='default' size='sm' onClick={openEditShift}>
            <Pen className='h-4 w-4' />
          </Button>
          <Button variant='destructive' size='sm' onClick={openDeleteShift}>
            <Trash className='h-4 w-4' />
          </Button>
        </div>
      )
    }
  }
]

// Columns for pending requests table
const getRequestsColumns = (t: ReturnType<typeof useTranslations>): ColumnDef<ShiftType>[] => [
  {
    accessorKey: 'index',
    header: t('no'),
    cell: ({ row }) => <div>{row.index + 1}</div>
  },
  {
    id: 'staff_name',
    accessorFn: (row) => row.staff_info?.name ?? '',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className='font-bold'
      >
        <User className='mr-2 h-4 w-4' />
        {t('staffName')}
        <CaretSortIcon className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => (
      <div>
        <div className='font-medium'>{row.original.staff_info?.name || 'N/A'}</div>
        <div className='text-sm text-muted-foreground'>{row.original.staff_info?.phone || ''}</div>
      </div>
    )
  },
  {
    accessorKey: 'shift_date',
    header: ({ column }) => (
      <Button
        variant='ghost'
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className='font-bold'
      >
        {t('date')}
        <CaretSortIcon className='ml-2 h-4 w-4' />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('shift_date'))
      return (
        <div>
          {date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })}
        </div>
      )
    }
  },
  {
    accessorKey: 'start_time',
    header: t('time'),
    cell: ({ row }) => (
      <div className='flex gap-1'>
        <Badge variant='outline' className='font-mono text-xs'>
          {row.getValue('start_time')}
        </Badge>
        <Badge variant='outline' className='font-mono text-xs'>
          {row.original.end_time}
        </Badge>
      </div>
    )
  },
  {
    accessorKey: 'total_hours',
    header: t('hours'),
    cell: ({ row }) => (
      <Badge variant='secondary' className='font-medium'>
        {row.getValue('total_hours') || 0}h
      </Badge>
    )
  },
  {
    accessorKey: 'reason',
    header: t('reason'),
    cell: ({ row }) => (
      <div className='max-w-[200px] truncate text-sm'>{row.getValue('reason') || t('noReasonProvided')}</div>
    )
  },
  {
    accessorKey: 'created_at',
    header: t('requested'),
    cell: ({ row }) => {
      const date = row.getValue('created_at') as string
      return (
        <div className='text-sm'>
          {new Date(date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit'
          })}
        </div>
      )
    }
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: function Actions({ row }) {
      const { setRequestIdReview } = useContext(ShiftManagementContext)

      const openReviewRequest = () => {
        setRequestIdReview(row.original._id)
      }

      const t = useTranslations('shift')
      return (
        <Button variant='default' size='sm' onClick={openReviewRequest}>
          <Eye className='h-4 w-4 mr-1' />
          {t('review')}
        </Button>
      )
    }
  }
]

function ReviewShiftRequest({ id, setId }: { id?: string | undefined; setId: (value: string | undefined) => void }) {
  const t = useTranslations('shift')
  const tCommon = useTranslations('common')
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null)

  const { data } = useGetShifts({
    // This should ideally be a separate hook for getting single shift
    // For now, we'll filter from the list
  })

  const reviewShiftRequestMutation = useReviewShiftRequestMutation()

  const form = useForm<ReviewShiftRequestBodyType>({
    resolver: zodResolver(ReviewShiftRequestBody),
    defaultValues: {
      status: ShiftRequestStatus.Approved,
      review_note: ''
    }
  })

  const shift = data?.payload.result.find((s) => s._id === id)

  useEffect(() => {
    if (reviewAction) {
      form.setValue('status', reviewAction === 'approve' ? ShiftRequestStatus.Approved : ShiftRequestStatus.Rejected)
    }
  }, [reviewAction, form])

  const onSubmit = async (values: ReviewShiftRequestBodyType) => {
    if (reviewShiftRequestMutation.isPending) return

    try {
      const result = await reviewShiftRequestMutation.mutateAsync({
        id: id as string,
        ...values
      })
      toast(tCommon('success'), {
        description: result.payload.message
      })
      reset()
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError
      })
    }
  }

  const reset = () => {
    setId(undefined)
    setReviewAction(null)
    form.reset({
      status: ShiftRequestStatus.Approved,
      review_note: ''
    })
  }

  if (!shift) return null

  return (
    <Dialog
      open={Boolean(id)}
      onOpenChange={(value) => {
        if (!value) {
          reset()
        }
      }}
    >
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>{t('reviewShiftRequest')}</DialogTitle>
          <DialogDescription>{t('reviewShiftRequestDesc', { name: shift.staff_info?.name || '' })}</DialogDescription>
        </DialogHeader>

        {/* Request Details */}
        <div className='space-y-4 py-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label className='text-sm font-bold flex items-center gap-2'>
                <User className='h-4 w-4' />
                {t('employee')}
              </Label>
              <div className='text-sm'>
                <div className='font-medium'>{shift.staff_info?.name}</div>
                <div className='text-muted-foreground'>{shift.staff_info?.phone}</div>
              </div>
            </div>

            <div className='space-y-2'>
              <Label className='text-sm font-bold'>{t('shiftDetails')}</Label>
              <div className='text-sm'>
                <div>{new Date(shift.shift_date).toLocaleDateString('vi-VN')}</div>
                <div className='flex gap-2 mt-1'>
                  <Badge variant='outline'>{shift.start_time}</Badge>
                  <Badge variant='outline'>{shift.end_time}</Badge>
                  <Badge variant='secondary'>{shift.total_hours || 0}h</Badge>
                </div>
              </div>
            </div>
          </div>

          {shift.reason && (
            <div className='space-y-2'>
              <Label className='text-sm font-bold'>{t('employeesReason')}</Label>
              <div className='p-3 bg-muted rounded-md text-sm'>{shift.reason}</div>
            </div>
          )}
        </div>

        {!reviewAction ? (
          <div className='flex justify-center gap-4 py-4'>
            <Button
              size='lg'
              className='gap-2 bg-green-600 hover:bg-green-700'
              onClick={() => setReviewAction('approve')}
            >
              <CheckCircle className='h-4 w-4' />
              {t('approve')}
            </Button>
            <Button size='lg' variant='destructive' className='gap-2' onClick={() => setReviewAction('reject')}>
              <XCircle className='h-4 w-4' />
              {t('reject')}
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form noValidate className='space-y-4' onSubmit={form.handleSubmit(onSubmit)}>
              <div className='flex items-center gap-2 mb-4'>
                <Badge
                  className={reviewAction === 'approve' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                >
                  {reviewAction === 'approve' ? t('approving') : t('rejecting')}
                </Badge>
              </div>

              <FormField
                control={form.control}
                name='review_note'
                render={({ field }) => (
                  <FormItem>
                    <Label className='text-sm font-bold'>
                      {reviewAction === 'approve' ? t('noteOptional') : t('rejectionReason')}
                    </Label>
                    <Textarea
                      placeholder={reviewAction === 'approve' ? t('addNoteOptional') : t('explainRejection')}
                      className='resize-none'
                      rows={3}
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type='button' variant='outline' onClick={() => setReviewAction(null)}>
                  {t('back')}
                </Button>
                <Button type='submit' disabled={reviewShiftRequestMutation.isPending}>
                  {reviewShiftRequestMutation.isPending ? t('processing') : t('confirm')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}

function AlertDialogDeleteShift({
  shiftDelete,
  setShiftDelete
}: {
  shiftDelete: ShiftItem | null
  setShiftDelete: (value: ShiftItem | null) => void
}) {
  const t = useTranslations('shift')
  const tCommon = useTranslations('common')
  const { mutateAsync } = useDeleteShiftMutation()

  const deleteShift = async () => {
    if (shiftDelete) {
      try {
        const result = await mutateAsync(shiftDelete._id)
        setShiftDelete(null)
        toast(tCommon('success'), {
          description: result.payload.message
        })
      } catch (error) {
        handleErrorApi({ error })
      }
    }
  }

  return (
    <AlertDialog
      open={Boolean(shiftDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setShiftDelete(null)
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deleteShiftConfirm')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('deleteShiftDesc', {
              name: shiftDelete?.staff_info?.name || '',
              date: shiftDelete ? new Date(shiftDelete.shift_date).toLocaleDateString('vi-VN') : ''
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={deleteShift}>{tCommon('continue')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

const PAGE_SIZE = 10

export default function UnifiedShiftManagement() {
  const t = useTranslations('shift')
  const searchParam = useSearchParams()
  const page = searchParam.get('page') ? Number(searchParam.get('page')) : 1
  const pageIndex = page - 1
  const activeTab = searchParam.get('tab') || 'shifts'

  const [shiftIdEdit, setShiftIdEdit] = useState<string | undefined>()
  const [shiftDelete, setShiftDelete] = useState<ShiftItem | null>(null)
  const [requestIdReview, setRequestIdReview] = useState<string | undefined>()
  const [selectedStaffId, setSelectedStaffId] = useState<string>('')

  const shiftsColumns = getShiftsColumns(t)
  const requestsColumns = getRequestsColumns(t)

  // Queries
  const shiftsQuery = useGetShifts({
    staff_id: selectedStaffId || undefined,
    page,
    limit: PAGE_SIZE
  })
  const pendingRequestsQuery = useGetPendingRequests({
    staff_id: selectedStaffId || undefined,
    page,
    limit: PAGE_SIZE
  })
  const accountsQuery = useGetAccountList()

  const shiftsData = shiftsQuery.data?.payload.result ?? []
  const requestsData = pendingRequestsQuery.data?.payload.result ?? []
  const accounts = accountsQuery.data?.payload.result ?? []
  const pendingCount = requestsData.length

  // Table states
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex,
    pageSize: PAGE_SIZE
  })

  // Shifts table
  const shiftsTable = useReactTable({
    data: shiftsData,
    columns: shiftsColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination
    }
  })

  // Requests table
  const requestsTable = useReactTable({
    data: requestsData,
    columns: requestsColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination
    }
  })

  useEffect(() => {
    shiftsTable.setPagination({ pageIndex, pageSize: PAGE_SIZE })
    requestsTable.setPagination({ pageIndex, pageSize: PAGE_SIZE })
  }, [shiftsTable, requestsTable, pageIndex])

  return (
    <ShiftManagementContext.Provider
      value={{
        shiftIdEdit,
        setShiftIdEdit,
        shiftDelete,
        setShiftDelete,
        requestIdReview,
        setRequestIdReview
      }}
    >
      <div className='w-full space-y-6'>
        <EditShift id={shiftIdEdit} setId={setShiftIdEdit} />
        <AlertDialogDeleteShift shiftDelete={shiftDelete} setShiftDelete={setShiftDelete} />
        <ReviewShiftRequest id={requestIdReview} setId={setRequestIdReview} />

        <ShiftStats />

        <Tabs defaultValue={activeTab} className='w-full'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='shifts'>{t('allShifts')}</TabsTrigger>
            <TabsTrigger value='requests' className='relative'>
              {t('pendingRequests')}
              {pendingCount > 0 && (
                <Badge variant='destructive' className='ml-2 px-1.5 py-0.5 text-xs'>
                  {pendingCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value='shifts' className='space-y-4'>
            {/* Filters and Actions for Shifts */}
            <div className='flex items-center py-4 gap-4'>
              <Input
                placeholder={t('filterByStaffName')}
                value={(shiftsTable.getColumn('staff_name')?.getFilterValue() as string) ?? ''}
                onChange={(event) => shiftsTable.getColumn('staff_name')?.setFilterValue(event.target.value)}
                className='max-w-sm'
              />

              <Select
                value={selectedStaffId}
                onValueChange={(value) => setSelectedStaffId(value === 'all' ? '' : value)}
              >
                <SelectTrigger className='w-[200px]'>
                  <SelectValue placeholder={t('filterByStaff')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>{t('allStaff')}</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account._id} value={account._id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className='ml-auto flex items-center gap-2'>
                <AddShift />
              </div>
            </div>

            {/* Shifts Table */}
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  {shiftsTable.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {shiftsTable.getRowModel().rows?.length ? (
                    shiftsTable.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={shiftsColumns.length} className='h-24 text-center'>
                        {t('noShiftsFound')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination for Shifts */}
            <div className='flex items-center justify-between space-x-2 py-4'>
              <div className='text-xs text-muted-foreground py-4 flex-1'>
                {t('displayShifts', {
                  count: shiftsTable.getPaginationRowModel().rows.length,
                  total: shiftsData.length
                })}
              </div>
              <div>
                <AutoPagination
                  page={shiftsTable.getState().pagination.pageIndex + 1}
                  pageSize={shiftsTable.getPageCount()}
                  pathname='/manage/shifts'
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value='requests' className='space-y-4'>
            {/* Stats for Requests */}
            <div className='grid gap-4 md:grid-cols-2'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>{t('pendingRequestsCount')}</CardTitle>
                  <Clock className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>{pendingCount}</div>
                  <p className='text-xs text-muted-foreground'>{t('awaitingReview')}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>{t('todaysRequests')}</CardTitle>
                  <CheckCircle className='h-4 w-4 text-muted-foreground' />
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>
                    {
                      requestsData.filter((request) => {
                        const today = new Date()
                        const requestDate = new Date(request.created_at!)
                        return requestDate.toDateString() === today.toDateString()
                      }).length
                    }
                  </div>
                  <p className='text-xs text-muted-foreground'>{t('submittedToday')}</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters for Requests */}
            <div className='flex items-center py-4 gap-4'>
              <Input
                placeholder={t('filterByStaffName')}
                value={(requestsTable.getColumn('staff_name')?.getFilterValue() as string) ?? ''}
                onChange={(event) => requestsTable.getColumn('staff_name')?.setFilterValue(event.target.value)}
                className='max-w-sm'
              />

              <Select
                value={selectedStaffId}
                onValueChange={(value) => setSelectedStaffId(value === 'all' ? '' : value)}
              >
                <SelectTrigger className='w-[200px]'>
                  <SelectValue placeholder={t('filterByStaff')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>{t('allStaff')}</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account._id} value={account._id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Requests Table */}
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  {requestsTable.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {requestsTable.getRowModel().rows?.length ? (
                    requestsTable.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={requestsColumns.length} className='h-24 text-center'>
                        {t('noPendingRequestsFound')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination for Requests */}
            <div className='flex items-center justify-end space-x-2 py-4'>
              <div className='text-xs text-muted-foreground py-4 flex-1'>
                {t('displayRequests', {
                  count: requestsTable.getPaginationRowModel().rows.length,
                  total: requestsData.length
                })}
              </div>
              <div>
                <AutoPagination
                  page={requestsTable.getState().pagination.pageIndex + 1}
                  pageSize={requestsTable.getPageCount()}
                  pathname='/manage/shifts'
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ShiftManagementContext.Provider>
  )
}
