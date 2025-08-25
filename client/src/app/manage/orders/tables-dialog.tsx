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

// Enhanced columns with better status display
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
    cell: ({ row }) => {
      const status = row.getValue('status') as (typeof TableStatus)[keyof typeof TableStatus]
      return (
        <div
          className={cn('px-2 py-1 rounded-full text-xs font-medium inline-block', {
            'bg-green-100 text-green-800': status === TableStatus.Available,
            'bg-yellow-100 text-yellow-800': status === TableStatus.Reserved,
            'bg-red-100 text-red-800': status === TableStatus.Hidden
          })}
        >
          {getTableStatus(status)}
          {status === TableStatus.Hidden && ' (Occupied)'}
        </div>
      )
    }
  }
]

const PAGE_SIZE = 10

interface TablesDialogProps {
  onChoose: (table: TableItem) => void
  showOnlyAvailable?: boolean // Only show available/reserved tables
  showOccupiedTables?: boolean // Also show occupied tables (for additional orders)
  occupiedByCustomerId?: string // Customer ID to filter occupied tables
}

export function TablesDialog({
  onChoose,
  showOnlyAvailable = true,
  showOccupiedTables = false,
  occupiedByCustomerId
}: TablesDialogProps) {
  const [open, setOpen] = useState(false)
  const tableListQuery = useTableListQuery()
  const rawData = tableListQuery.data?.payload.result ?? []

  // Filter data based on props
  const data = rawData.filter((table) => {
    if (showOccupiedTables && occupiedByCustomerId) {
      // Show tables occupied by specific customer + available/reserved tables
      return (
        table.status === TableStatus.Available ||
        table.status === TableStatus.Reserved ||
        (table.status === TableStatus.Occupied && table.current_customer_id === occupiedByCustomerId)
      )
    }

    if (showOnlyAvailable) {
      // Only show available and reserved tables
      return table.status === TableStatus.Available || table.status === TableStatus.Reserved
    }

    // Show all tables
    return true
  })

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: PAGE_SIZE
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

  const choose = (selectedTable: TableItem) => {
    onChoose(selectedTable)
    setOpen(false)
  }

  const canSelectTable = (tableItem: TableItem) => {
    if (showOccupiedTables && occupiedByCustomerId) {
      // For additional orders: can select available, reserved, or tables occupied by this customer
      return (
        tableItem.status === TableStatus.Available ||
        tableItem.status === TableStatus.Reserved ||
        (tableItem.status === TableStatus.Occupied && tableItem.current_customer_id === occupiedByCustomerId)
      )
    }

    // Default behavior: only available and reserved tables
    return tableItem.status === TableStatus.Available || tableItem.status === TableStatus.Reserved
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getRowClassName = (row: any) => {
    const tableItem = row.original as TableItem

    if (canSelectTable(tableItem)) {
      return 'cursor-pointer hover:bg-gray-50'
    }

    return 'cursor-not-allowed opacity-60'
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>{showOccupiedTables ? 'Select Table' : 'Change'}</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px] max-h-full overflow-auto'>
        <DialogHeader>
          <DialogTitle>{showOccupiedTables ? 'Select Table for Additional Order' : 'Select table'}</DialogTitle>
          {showOccupiedTables && (
            <p className='text-sm text-gray-600 mt-2'>
              You can select the customer&apos;s current table or move to a different available table.
            </p>
          )}
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
                    table.getRowModel().rows.map((row) => {
                      const tableItem = row.original as TableItem
                      const canSelect = canSelectTable(tableItem)
                      const isCurrentCustomerTable =
                        tableItem.status === TableStatus.Hidden &&
                        tableItem.current_customer_id === occupiedByCustomerId

                      return (
                        <TableRow
                          key={row.id}
                          data-state={row.getIsSelected() && 'selected'}
                          onClick={canSelect ? () => choose(tableItem) : undefined}
                          className={cn(getRowClassName(row), {
                            'bg-blue-50 border-blue-200': isCurrentCustomerTable // Highlight current customer's table
                          })}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              {/* Add indicator for current customer's table */}
                              {cell.column.id === 'status' && isCurrentCustomerTable && (
                                <div className='text-xs text-blue-600 mt-1 font-medium'>Current Table</div>
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      )
                    })
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
