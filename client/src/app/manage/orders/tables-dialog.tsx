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
import { cn, getTableStatus, simpleMatchText } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { TableListResType } from '@/schemaValidations/table.schema'
import { TableStatus } from '@/constants/type'
import { useTableListQuery } from '@/queries/useTable'

type TableItem = TableListResType['result'][0]

export const columns: ColumnDef<TableItem>[] = [
  {
    accessorKey: 'number',
    header: 'Table number',
    cell: ({ row }) => <div className='capitalize'>{row.getValue('number')}</div>,
    filterFn: (row, columnId, filterValue: string) => {
      if (filterValue === undefined) return true
      return simpleMatchText(String(row.original.number), String(filterValue))
    }
  },
  {
    accessorKey: 'capacity',
    header: 'Capacity',
    cell: ({ row }) => <div className='capitalize'>{row.getValue('capacity')}</div>
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <div>{getTableStatus(row.getValue('status'))}</div>
  }
]

const PAGE_SIZE = 10

export function TablesDialog({ onChoose }: { onChoose: (table: TableItem) => void }) {
  const [open, setOpen] = useState(false)
  const tableListQuery = useTableListQuery()
  const data = tableListQuery.data?.payload.result ?? []
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex: 0, // Gía trị mặc định ban đầu, không có ý nghĩa khi data được fetch bất đồng bộ
    pageSize: PAGE_SIZE //default page size
  })

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

  const choose = (table: TableItem) => {
    onChoose(table)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>Change</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px] max-h-full overflow-auto'>
        <DialogHeader>
          <DialogTitle>Select table</DialogTitle>
        </DialogHeader>
        <div>
          <div className='w-full'>
            <div className='flex items-center py-4'>
              <Input
                placeholder='Number ...'
                value={(table.getColumn('number')?.getFilterValue() as string) ?? ''}
                onChange={(event) => table.getColumn('number')?.setFilterValue(event.target.value)}
                className='w-[100px]'
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
                          if (
                            row.original.status === TableStatus.Available ||
                            row.original.status === TableStatus.Reserved
                          ) {
                            choose(row.original)
                          }
                        }}
                        className={cn({
                          'cursor-pointer':
                            row.original.status === TableStatus.Available ||
                            row.original.status === TableStatus.Reserved,
                          'cursor-not-allowed': row.original.status === TableStatus.Hidden
                        })}
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
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className='flex items-center justify-end space-x-2 py-4'>
              <div className='text-xs text-muted-foreground py-4 flex-1 '>
                Display <strong>{table.getPaginationRowModel().rows.length}</strong> of <strong>{data.length}</strong>{' '}
                tables
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
