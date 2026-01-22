'use client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import AutoPagination from '@/components/auto-pagination'
import { useEffect, useState } from 'react'
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
import { formatDateTimeToLocaleString, simpleMatchText } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { GetListCustomersResType } from '@/schemaValidations/account.schema'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useGetCustomersQuery } from '@/queries/useAccount'
import { useTranslations } from 'next-intl'

type CustomerItem = GetListCustomersResType['result'][0]

const getColumns = (
  t: ReturnType<typeof useTranslations>,
  tCommon: ReturnType<typeof useTranslations>
): ColumnDef<CustomerItem>[] => [
  {
    accessorKey: 'avatar',
    header: '',
    cell: ({ row }) => (
      <Avatar className='w-8 h-8'>
        <AvatarImage src={row.original.avatar || undefined} alt={row.original.name} />
        <AvatarFallback className='text-xs'>
          {row.original.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>
    ),
    enableSorting: false,
    enableColumnFilter: false
  },
  {
    accessorKey: 'name',
    header: tCommon('name'),
    cell: ({ row }) => (
      <div className='capitalize'>
        {row.getValue('name')} | (#{row.original._id})
      </div>
    ),
    filterFn: (row, columnId, filterValue: string) => {
      if (filterValue === undefined) return true
      return simpleMatchText(row.original.name + String(row.original._id), String(filterValue))
    }
  },
  {
    accessorKey: 'email',
    header: tCommon('email'),
    cell: ({ row }) => <div className='text-gray-600'>{row.getValue('email')}</div>,
    filterFn: (row, columnId, filterValue: string) => {
      if (filterValue === undefined) return true
      return simpleMatchText(String(row.original.email), String(filterValue))
    }
  },
  {
    accessorKey: 'phone',
    header: tCommon('phone'),
    cell: ({ row }) => <div className='text-gray-600'>{row.getValue('phone')}</div>,
    filterFn: (row, columnId, filterValue: string) => {
      if (filterValue === undefined) return true
      return simpleMatchText(String(row.original.phone), String(filterValue))
    }
  },
  {
    accessorKey: 'created_at',
    header: () => <div>{tCommon('createdAt')}</div>,
    cell: ({ row }) => (
      <div className='flex items-center space-x-4 text-sm'>
        {formatDateTimeToLocaleString(row.getValue('created_at'))}
      </div>
    )
  }
]

const PAGE_SIZE = 10

interface CustomersDialogProps {
  onChoose: (customer: CustomerItem) => void
}

export default function CustomersDialog({ onChoose }: CustomersDialogProps) {
  const t = useTranslations('order')
  const tCommon = useTranslations('common')
  const [open, setOpen] = useState(false)

  const customerListQuery = useGetCustomersQuery()

  const data = customerListQuery.data?.payload.result ?? []
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: PAGE_SIZE
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
      pageIndex: 0,
      pageSize: PAGE_SIZE
    })
  }, [table])

  const choose = (customer: CustomerItem) => {
    onChoose(customer)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>{t('chooseCustomer')}</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[800px] max-h-full overflow-auto'>
        <DialogHeader>
          <DialogTitle>{t('selectCustomerTitle')}</DialogTitle>
        </DialogHeader>
        <div>
          <div className='w-full'>
            <div className='flex items-center py-4 gap-2'>
              <Input
                placeholder={t('nameOrId')}
                value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
                className='w-[170px]'
              />
              <Input
                placeholder={tCommon('email')}
                value={(table.getColumn('email')?.getFilterValue() as string) ?? ''}
                onChange={(event) => table.getColumn('email')?.setFilterValue(event.target.value)}
                className='w-[170px]'
              />
              <Input
                placeholder={tCommon('phone')}
                value={(table.getColumn('phone')?.getFilterValue() as string) ?? ''}
                onChange={(event) => table.getColumn('phone')?.setFilterValue(event.target.value)}
                className='w-[170px]'
              />
            </div>
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && 'selected'}
                        onClick={() => {
                          choose(row.original)
                        }}
                        className='cursor-pointer hover:bg-gray-50'
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
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
                  onClick={(pageNumber) =>
                    table.setPagination({
                      pageIndex: pageNumber - 1,
                      pageSize: PAGE_SIZE
                    })
                  }
                  isLink={false}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
