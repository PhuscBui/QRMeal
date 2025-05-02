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
import DOMPurify from 'dompurify'
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
import { formatCurrency, handleErrorApi } from '@/lib/utils'
import { useSearchParams } from 'next/navigation'
import AutoPagination from '@/components/auto-pagination'

import { toast } from 'sonner'
import { Pen, Trash } from 'lucide-react'
import { PromotionListResType } from '@/schemaValidations/promotion.schema'
import { useDeletePromotionMutation, usePromotionListQuery } from '@/queries/usePromotion'
import AddPromotion from '@/app/manage/promotions/add-promotion'
import EditPromotion from '@/app/manage/promotions/edit-promotion'
import { PromotionType } from '@/constants/type'

type PromotionItem = PromotionListResType['result'][0]

const statusBadge = (status: boolean) => {
  if (status) {
    return <span className='bg-green-100 text-green-800 rounded-full px-2 py-1 text-xs font-bold'>Available</span>
  }
  return <span className='bg-red-100 text-red-800 rounded-full px-2 py-1 text-xs font-bold'>Unavailable</span>
}

const PromotionTableContext = createContext<{
  setPromotionIdEdit: (value: string) => void
  promotionIdEdit: string | undefined
  promotionDelete: PromotionItem | null
  setPromotionDelete: (value: PromotionItem | null) => void
}>({
  setPromotionIdEdit: () => {},
  promotionIdEdit: undefined,
  promotionDelete: null,
  setPromotionDelete: () => {}
})

export const columns: ColumnDef<PromotionItem>[] = [
  {
    accessorKey: 'index',
    header: 'No.',
    cell: ({ row }) => <div>{row.index + 1}</div>
  },
  {
    accessorKey: '_id',
    header: 'ID'
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <div className='capitalize'>{row.getValue('name')}</div>
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => (
      <div
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(row.getValue('description'))
        }}
        className='whitespace-pre-line'
      />
    )
  },
  {
    accessorKey: 'discount_type',
    header: 'Discount Type',
    cell: ({ row }) => <div className='capitalize'>{row.getValue('discount_type')}</div>
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ row }) => <div>{statusBadge(row.getValue('is_active'))}</div>
  },
  {
    accessorKey: 'discount_value',
    header: 'Discount Value',
    cell: ({ row }) => {
      const type = row.getValue('discount_type')
      const value = row.getValue('discount_value')

      if (type === PromotionType.Discount) {
        return <div>{formatCurrency(value as number)}</div>
      }

      if (type === PromotionType.Percent) {
        return <div>{value as number} %</div>
      }

      return <div>{formatCurrency(value as number)}</div>
    }
  },
  {
    accessorKey: 'min_spend',
    header: 'Min Spend',
    cell: ({ row }) => <div>{formatCurrency(row.getValue('min_spend'))}</div>
  },
  {
    accessorKey: 'min_visits',
    header: 'Min Visits',
    cell: ({ row }) => <div>{row.getValue('min_visits')}</div>
  },
  {
    accessorKey: 'min_loyalty_points',
    header: 'Min Loyalty Points',
    cell: ({ row }) => <div>{row.getValue('min_loyalty_points')}</div>
  },
  {
    accessorKey: 'start_date',
    header: 'Start Date',
    cell: ({ row }) => <div>{new Date(row.getValue('start_date')).toLocaleDateString()}</div>
  },
  {
    accessorKey: 'end_date',
    header: 'End Date',
    cell: ({ row }) => <div>{new Date(row.getValue('end_date')).toLocaleDateString()}</div>
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: function Actions({ row }) {
      const { setPromotionIdEdit, setPromotionDelete } = useContext(PromotionTableContext)
      const openEditPromotion = () => {
        setPromotionIdEdit(row.original._id)
      }

      const openDeletePromotion = () => {
        setPromotionDelete(row.original)
      }
      return (
        <div className='flex gap-2'>
          <Button variant='default' className='h-8 w-8 p-0' onClick={openEditPromotion}>
            <Pen className='h-4 w-4' />
          </Button>
          <Button variant='destructive' className='h-8 w-8 p-0' onClick={openDeletePromotion}>
            <Trash className='h-4 w-4' />
          </Button>
        </div>
      )
    }
  }
]

function AlertDialogDeletePromotion({
  promotionDelete,
  setPromotionDelete
}: {
  promotionDelete: PromotionItem | null
  setPromotionDelete: (value: PromotionItem | null) => void
}) {
  const { mutateAsync } = useDeletePromotionMutation()
  const deletePromotion = async () => {
    if (promotionDelete) {
      try {
        const result = await mutateAsync(promotionDelete._id)
        setPromotionDelete(null)
        toast('Success', {
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
      open={Boolean(promotionDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setPromotionDelete(null)
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Promotion</AlertDialogTitle>
          <AlertDialogDescription>
            <span className='bg-foreground text-primary-foreground rounded p-1'>{promotionDelete?.name}</span> will be
            deleted. You can&apos;t undo this action.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={deletePromotion}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
// Số lượng item trên 1 trang
const PAGE_SIZE = 10
export default function PromotionTable() {
  const searchParam = useSearchParams()
  const page = searchParam.get('page') ? Number(searchParam.get('page')) : 1
  const pageIndex = page - 1
  const [promotionIdEdit, setPromotionIdEdit] = useState<string | undefined>()
  const [promotionDelete, setPromotionDelete] = useState<PromotionItem | null>(null)
  const promotionListQuery = usePromotionListQuery()
  const data = promotionListQuery.data?.payload.result ?? []
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    _id: false
  })
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex, // Gía trị mặc định ban đầu, không có ý nghĩa khi data được fetch bất đồng bộ
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
      pageIndex,
      pageSize: PAGE_SIZE
    })
  }, [table, pageIndex])

  return (
    <PromotionTableContext.Provider
      value={{ setPromotionIdEdit, promotionIdEdit, promotionDelete, setPromotionDelete }}
    >
      <div className='w-full'>
        <EditPromotion id={promotionIdEdit} setId={setPromotionIdEdit} />
        <AlertDialogDeletePromotion promotionDelete={promotionDelete} setPromotionDelete={setPromotionDelete} />
        <div className='flex items-center py-4'>
          <Input
            placeholder='Filter by name'
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
            className='max-w-sm'
          />
          <div className='ml-auto flex items-center gap-2'>
            <AddPromotion />
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
            results
          </div>
          <div>
            <AutoPagination
              page={table.getState().pagination.pageIndex + 1}
              pageSize={table.getPageCount()}
              pathname='/manage/dishes'
            />
          </div>
        </div>
      </div>
    </PromotionTableContext.Provider>
  )
}
