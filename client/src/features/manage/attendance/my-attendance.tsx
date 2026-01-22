'use client'

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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import AutoPagination from '@/components/auto-pagination'
import { AttendanceListResType } from '@/schemaValidations/attendance.schema'
import { useMyAttendanceQuery } from '@/queries/useAttendance'
import { useTranslations } from 'next-intl'
import { format } from 'date-fns'

type AttendanceItem = AttendanceListResType['result']['attendances'][0]

const getStatusBadge = (status: string, t: (key: string) => string) => {
  if (status === 'on_time') {
    return <span className='bg-green-100 text-green-800 rounded-full px-2 py-1 text-xs font-bold'>{t('onTime')}</span>
  }
  if (status === 'late') {
    return <span className='bg-yellow-100 text-yellow-800 rounded-full px-2 py-1 text-xs font-bold'>{t('late')}</span>
  }
  return <span className='bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs font-bold'>{t('present')}</span>
}

const getColumns = (t: ReturnType<typeof useTranslations>): ColumnDef<AttendanceItem>[] => [
  {
    accessorKey: 'index',
    header: t('no'),
    cell: ({ row }) => <div className='text-xs sm:text-sm'>{row.index + 1}</div>,
    enableHiding: true
  },
  {
    accessorKey: 'check_in',
    header: t('checkInTime'),
    cell: ({ row }) => {
      const checkIn = row.getValue('check_in') as string | undefined
      if (!checkIn) return <div className='text-muted-foreground text-xs sm:text-sm'>-</div>
      try {
        return (
          <div className='min-w-[80px] sm:min-w-0'>
            <div className='text-xs sm:text-sm'>{format(new Date(checkIn), 'dd/MM/yyyy')}</div>
            <div className='text-xs text-muted-foreground'>{format(new Date(checkIn), 'HH:mm')}</div>
          </div>
        )
      } catch {
        return <div className='text-xs sm:text-sm'>{checkIn}</div>
      }
    }
  },
  {
    accessorKey: 'check_out',
    header: t('checkOutTime'),
    cell: ({ row }) => {
      const checkOut = row.getValue('check_out') as string | undefined
      if (!checkOut) return <div className='text-muted-foreground text-xs sm:text-sm'>{t('notCheckedOut')}</div>
      try {
        return (
          <div className='min-w-[80px] sm:min-w-0'>
            <div className='text-xs sm:text-sm'>{format(new Date(checkOut), 'dd/MM/yyyy')}</div>
            <div className='text-xs text-muted-foreground'>{format(new Date(checkOut), 'HH:mm')}</div>
          </div>
        )
      } catch {
        return <div className='text-xs sm:text-sm'>{checkOut}</div>
      }
    }
  },
  {
    accessorKey: 'status',
    header: t('status'),
    cell: ({ row }) => getStatusBadge(row.getValue('status'), t)
  },
  {
    accessorKey: 'totalHours',
    header: t('totalHours'),
    cell: ({ row }) => {
      const checkIn = row.original.check_in
      const checkOut = row.original.check_out
      if (!checkIn || !checkOut) return <div className='text-muted-foreground text-xs sm:text-sm'>-</div>
      try {
        const hours = (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60)
        return (
          <div className='text-xs sm:text-sm'>
            {hours.toFixed(2)} {t('hours')}
          </div>
        )
      } catch {
        return <div className='text-xs sm:text-sm'>-</div>
      }
    }
  }
]

const PAGE_SIZE = 10

export function MyAttendance() {
  const t = useTranslations('attendance')
  const tCommon = useTranslations('common')
  const searchParam = useSearchParams()
  const page = searchParam.get('page') ? Number(searchParam.get('page')) : 1
  const pageIndex = page - 1

  const query = {
    page: page.toString(),
    limit: PAGE_SIZE.toString()
  }

  const attendanceQuery = useMyAttendanceQuery(true, query)
  const data = attendanceQuery.data?.payload.result.attendances ?? []
  const total = attendanceQuery.data?.payload.result.total ?? 0

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex,
    pageSize: PAGE_SIZE
  })

  const columns = getColumns(t)

  const table = useReactTable({
    data,
    columns,
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
    manualPagination: true,
    pageCount: Math.ceil(total / PAGE_SIZE),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination
    }
  })

  useEffect(() => {
    table.setPagination({
      pageIndex,
      pageSize: PAGE_SIZE
    })
  }, [table, pageIndex])

  useEffect(() => {
    // Only run on client side to avoid hydration mismatch
    if (typeof window === 'undefined') return

    const handleResize = () => {
      setColumnVisibility((prev) => ({
        ...prev,
        index: window.innerWidth < 640
      }))
    }

    // Set initial visibility after mount
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (attendanceQuery.isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-muted-foreground'>{tCommon('loading')}</div>
      </div>
    )
  }

  if (attendanceQuery.isError) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-destructive'>{tCommon('error')}</div>
      </div>
    )
  }

  return (
    <div className='w-full'>
      <div className='rounded-md border overflow-x-auto -mx-4 sm:mx-0'>
        <div className='inline-block min-w-full align-middle'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className='whitespace-nowrap px-2 sm:px-4 text-xs sm:text-sm'>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className='whitespace-nowrap px-2 sm:px-4 py-2 sm:py-3'>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={table.getAllColumns().length} className='h-24 text-center'>
                    {tCommon('noResults')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 py-4'>
        <div className='text-xs sm:text-sm text-muted-foreground'>
          {tCommon('displayItems', { count: data.length, total })}
        </div>
        <div className='w-full sm:w-auto'>
          <AutoPagination
            page={table.getState().pagination.pageIndex + 1}
            pageSize={Math.ceil(total / PAGE_SIZE)}
            pathname='/manage/attendance'
          />
        </div>
      </div>
    </div>
  )
}
