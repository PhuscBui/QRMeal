import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import AutoPagination from '@/components/auto-pagination'
import { DishListResType } from '@/schemaValidations/dish.schema'
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
import { formatCurrency, getDishStatus, simpleMatchText } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import { useDishListQuery } from '@/queries/useDish'
import { useTranslations } from 'next-intl'

type DishItem = DishListResType['result'][0]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getColumns = (t: any): ColumnDef<DishItem>[] => [
  {
    id: 'dishName',
    header: t('dishLabel'),
    cell: ({ row }) => (
      <div className='flex items-center space-x-4'>
        <Image
          src={row.original.image || 'https://placehold.co/600x400'}
          alt={row.original.name}
          width={50}
          height={50}
          className='rounded-md object-cover w-[50px] h-[50px]'
        />
        <span>{row.original.name}</span>
      </div>
    ),
    filterFn: (row, columnId, filterValue: string) => {
      if (filterValue === undefined) return true
      return simpleMatchText(String(row.original.name), String(filterValue))
    }
  },
  {
    accessorKey: 'price',
    header: t('price'),
    cell: ({ row }) => <div className='capitalize'>{formatCurrency(row.getValue('price'))}</div>
  },
  {
    accessorKey: 'status',
    header: t('status'),
    cell: ({ row }) => <div>{getDishStatus(row.getValue('status'))}</div>
  }
]

const PAGE_SIZE = 10
export function DishesDialog({ onChoose }: { onChoose: (dish: DishItem) => void }) {
  const t = useTranslations('order')
  const tCommon = useTranslations('common')
  const [open, setOpen] = useState(false)
  const dishListQuery = useDishListQuery()
  const data = dishListQuery.data?.payload.result ?? []
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex: 0, // Gía trị mặc định ban đầu, không có ý nghĩa khi data được fetch bất đồng bộ
    pageSize: PAGE_SIZE //default page size
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

  const choose = (dish: DishItem) => {
    onChoose(dish)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>{t('change')}</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px] max-h-full overflow-auto'>
        <DialogHeader>
          <DialogTitle>{t('selectDish')}</DialogTitle>
        </DialogHeader>
        <div>
          <div className='w-full'>
            <div className='flex items-center py-4'>
              <Input
                placeholder={tCommon('name')}
                value={(table.getColumn('dishName')?.getFilterValue() as string) ?? ''}
                onChange={(event) => table.getColumn('dishName')?.setFilterValue(event.target.value)}
                className='max-w-sm'
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
                        onClick={() => choose(row.original)}
                        className='cursor-pointer'
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
