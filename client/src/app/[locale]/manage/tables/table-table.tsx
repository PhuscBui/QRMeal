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
import { Button } from '@/components/ui/button'

import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
import { getTableStatus, handleErrorApi } from '@/lib/utils'
import { useSearchParams } from 'next/navigation'
import AutoPagination from '@/components/auto-pagination'
import { TableListResType } from '@/schemaValidations/table.schema'
import EditTable from '@/app/manage/tables/edit-table'
import AddTable from '@/app/manage/tables/add-table'
import { useDeleteTableMutation, useTableListQuery } from '@/queries/useTable'
import QRCodeTable, { DownloadQRCodeTable } from '@/components/qrcode-table'
import { toast } from 'sonner'
import { Pen, Trash } from 'lucide-react'
import ReservationDetail from '@/app/manage/tables/reservation-detail'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog'
import AddReservationDialog from '@/app/manage/tables/add-reservation'
import { TableStatus } from '@/constants/type'
import { useTranslations } from 'next-intl'

type TableItem = TableListResType['result'][0]

const getStatusBadge = (status: string, t: any) => {
  if (status === 'Available') {
    return <span className='bg-green-100 text-green-800 rounded-full px-2 py-1 text-xs font-bold'>{t('available')}</span>
  }
  if (status === 'Reserved') {
    return <span className='bg-blue-100 text-blue-800 rounded-full px-2 py-1 text-xs font-bold'>{t('reserved')}</span>
  }
  if (status === 'Occupied') {
    return <span className='bg-red-100 text-red-800 rounded-full px-2 py-1 text-xs font-bold'>{t('occupied')}</span>
  }
  return <span className='bg-yellow-100 text-yellow-800 rounded-full px-2 py-1 text-xs font-bold'>{t('hidden')}</span>
}

const TableTableContext = createContext<{
  setTableIdEdit: (value: number) => void
  tableIdEdit: number | undefined
  tableDelete: TableItem | null
  setTableDelete: (value: TableItem | null) => void
}>({
  setTableIdEdit: () => {},
  tableIdEdit: undefined,
  tableDelete: null,
  setTableDelete: () => {}
})

const getColumns = (t: any, tCommon: any): ColumnDef<TableItem>[] => [
  {
    accessorKey: 'index',
    header: t('no'),
    cell: ({ row }) => <div>{row.index + 1}</div>
  },
  {
    accessorKey: 'number',
    header: t('tableNumber'),
    cell: ({ row }) => <div className='capitalize'>{row.getValue('number')}</div>,
    filterFn: (rows, columnId, filterValue) => {
      if (!filterValue) return true
      return String(filterValue) === String(rows.getValue('number'))
    }
  },
  {
    accessorKey: 'capacity',
    header: t('capacity'),
    cell: ({ row }) => <div className='capitalize'>{row.getValue('capacity')}</div>
  },
  {
    accessorKey: 'status',
    header: tCommon('status'),
    cell: ({ row }) => <div>{getStatusBadge(getTableStatus(row.getValue('status')), t)}</div>
  },
  {
    accessorKey: 'location',
    header: t('location'),
    cell: ({ row }) => <div>{row.getValue('location')}</div>
  },
  {
    accessorKey: 'token',
    header: t('qrCode'),
    cell: ({ row }) => (
      <div>
        <QRCodeTable token={row.getValue('token')} tableNumber={row.getValue('number')} />
      </div>
    )
  },
  {
    accessorKey: 'reservation',
    header: t('reservation'),
    cell: ({ row }) => (
      <div>
        {row.original.reservation ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button>{t('viewReservation')}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>{t('reservationDetails')}</DialogTitle>
              <div>
                <ReservationDetail tableNumber={row.original.number} />
              </div>
            </DialogContent>
          </Dialog>
        ) : row.getValue('status') === TableStatus.Occupied ? (
          <div className='text-red-500'>{t('tableOccupied')}</div>
        ) : (
          <AddReservationDialog tableNumber={row.original.number} token={row.original.token} />
        )}
      </div>
    )
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: function Actions({ row }) {
      const { setTableIdEdit, setTableDelete } = useContext(TableTableContext)
      const openEditTable = () => {
        setTableIdEdit(row.original.number)
      }

      const openDeleteTable = () => {
        setTableDelete(row.original)
      }
      return (
        <div className='flex gap-2'>
          <DownloadQRCodeTable token={row.getValue('token')} tableNumber={row.getValue('number')} />
          <Button variant='default' className='h-8 w-8 p-0' onClick={openEditTable}>
            <Pen className='h-4 w-4' />
          </Button>
          <Button variant='destructive' className='h-8 w-8 p-0' onClick={openDeleteTable}>
            <Trash className='h-4 w-4' />
          </Button>
        </div>
      )
    }
  }
]

function AlertDialogDeleteTable({
  tableDelete,
  setTableDelete
}: {
  tableDelete: TableItem | null
  setTableDelete: (value: TableItem | null) => void
}) {
  const t = useTranslations('table')
  const tCommon = useTranslations('common')
  const { mutateAsync } = useDeleteTableMutation()
  const deleteTable = async () => {
    if (tableDelete) {
      try {
        const result = await mutateAsync(tableDelete.number)
        setTableDelete(null)
        toast(tCommon('success'), {
          description: result.payload.message
        })
      } catch (error) {
        handleErrorApi({
          error
        })
      }
    }
  }
  return (
    <AlertDialog
      open={Boolean(tableDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setTableDelete(null)
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deleteTableConfirm')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('deleteTableDesc', { number: tableDelete?.number })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={deleteTable}>{tCommon('continue')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
// Số lượng item trên 1 trang
const PAGE_SIZE = 10
export default function TableTable() {
  const t = useTranslations('table')
  const tCommon = useTranslations('common')
  const searchParam = useSearchParams()
  const page = searchParam.get('page') ? Number(searchParam.get('page')) : 1
  const pageIndex = page - 1
  // const params = Object.fromEntries(searchParam.entries())
  const [tableIdEdit, setTableIdEdit] = useState<number | undefined>()
  const [tableDelete, setTableDelete] = useState<TableItem | null>(null)
  const tableListQuery = useTableListQuery()
  const data = tableListQuery.data?.payload.result ?? []
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex, // Gía trị mặc định ban đầu, không có ý nghĩa khi data được fetch bất đồng bộ
    pageSize: PAGE_SIZE //default page size
  })

  const columns = getColumns(t, tCommon)

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

  return (
    <TableTableContext.Provider value={{ tableIdEdit, setTableIdEdit, tableDelete, setTableDelete }}>
      <div className='w-full'>
        <EditTable id={tableIdEdit} setId={setTableIdEdit} />
        <AlertDialogDeleteTable tableDelete={tableDelete} setTableDelete={setTableDelete} />
        <div className='flex items-center py-4'>
          <Input
            placeholder={t('filterByNumber')}
            value={(table.getColumn('number')?.getFilterValue() as string) ?? ''}
            onChange={(event) => {
              table.getColumn('number')?.setFilterValue(event.target.value)
            }}
            className='max-w-sm'
          />
          <div className='ml-auto flex items-center gap-2'>
            <AddTable />
          </div>
        </div>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
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
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className='h-24 text-center'>
                    {tCommon('noResults')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className='flex items-center justify-end space-x-2 py-4'>
          <div className='text-xs text-muted-foreground py-4 flex-1 '>
            {tCommon('displayItems', { count: table.getPaginationRowModel().rows.length, total: data.length })}
          </div>
          <div>
            <AutoPagination
              page={table.getState().pagination.pageIndex + 1}
              pageSize={table.getPageCount()}
              pathname='/manage/tables'
            />
          </div>
        </div>
      </div>
    </TableTableContext.Provider>
  )
}
