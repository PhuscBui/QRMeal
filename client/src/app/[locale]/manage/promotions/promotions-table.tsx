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
import { useTranslations } from 'next-intl'

type PromotionItem = PromotionListResType['result'][0]

const getStatusBadge = (status: boolean, t: any) => {
  if (status) {
    return <span className='bg-green-100 text-green-800 rounded-full px-2 py-1 text-xs font-bold'>{t('active')}</span>
  }
  return <span className='bg-red-100 text-red-800 rounded-full px-2 py-1 text-xs font-bold'>{t('inactive')}</span>
}

const categoryBadge = (category: string) => {
  const colorMap = {
    discount: 'bg-blue-100 text-blue-800',
    loyalty_points: 'bg-purple-100 text-purple-800',
    buy_x_get_y: 'bg-green-100 text-green-800',
    free_shipping: 'bg-orange-100 text-orange-800'
  }
  const color = colorMap[category as keyof typeof colorMap] || 'bg-gray-100 text-gray-800'
  return (
    <span className={`${color} rounded-full px-2 py-1 text-xs font-bold`}>
      {category ? category.charAt(0).toUpperCase() + (category.slice(1) || '').replace('_', ' ') : 'Unknown'}
    </span>
  )
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

const getColumns = (t: any, tCommon: any): ColumnDef<PromotionItem>[] => [
  {
    accessorKey: 'index',
    header: t('no'),
    cell: ({ row }) => <div>{row.index + 1}</div>
  },
  {
    accessorKey: '_id',
    header: 'ID'
  },
  {
    accessorKey: 'name',
    header: t('name'),
    cell: ({ row }) => <div className='capitalize'>{row.getValue('name')}</div>
  },
  {
    accessorKey: 'description',
    header: t('description'),
    cell: ({ row }) => (
      <div
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(row.getValue('description'))
        }}
        className='whitespace-pre-line max-w-xs truncate'
      />
    )
  },
  {
    accessorKey: 'category',
    header: t('category'),
    cell: ({ row }) => categoryBadge(row.getValue('category'))
  },
  {
    accessorKey: 'discount_type',
    header: t('discountType'),
    cell: ({ row }) => {
      const discountType = row.getValue('discount_type')
      if (!discountType) return <div>-</div>
      return <div className='capitalize'>{(discountType as string).replace('_', ' ')}</div>
    }
  },
  {
    accessorKey: 'is_active',
    header: tCommon('status'),
    cell: ({ row }) => getStatusBadge(row.getValue('is_active'), t)
  },
  {
    accessorKey: 'discount_value',
    header: t('discountValue'),
    cell: ({ row }) => {
      const discountType = row.getValue('discount_type')
      const value = row.getValue('discount_value')

      if (!value || !discountType) return <div>-</div>

      if (discountType === 'fixed') {
        return <div>{formatCurrency(value as number)}</div>
      }

      if (discountType === 'percentage') {
        return <div>{value as number}%</div>
      }

      return <div>{formatCurrency(value as number)}</div>
    }
  },
  {
    accessorKey: 'applicable_to',
    header: t('applicableTo'),
    cell: ({ row }) => {
      const value = row.getValue('applicable_to') as string | undefined
      return <div className='capitalize'>{value ? value.replace('_', ' ') : '-'}</div>
    }
  },
  {
    accessorKey: 'conditions',
    header: t('conditions'),
    cell: ({ row }) => {
      const conditions = row.getValue('conditions') as {
        min_spend?: number
        min_visits?: number
        min_loyalty_points?: number
        buy_quantity?: number
        get_quantity?: number
      }
      if (!conditions) return <div>-</div>

      const conditionsList = []
      if (conditions.min_spend) conditionsList.push(t('minSpendLabel', { amount: formatCurrency(conditions.min_spend) }))
      if (conditions.min_visits) conditionsList.push(t('minVisitsLabel', { count: conditions.min_visits }))
      if (conditions.min_loyalty_points) conditionsList.push(t('minPointsLabel', { count: conditions.min_loyalty_points }))
      if (conditions.buy_quantity && conditions.get_quantity) {
        conditionsList.push(t('buyGetLabel', { buy: conditions.buy_quantity, get: conditions.get_quantity }))
      }

      return <div className='text-sm'>{conditionsList.length > 0 ? conditionsList.join(', ') : '-'}</div>
    }
  },
  {
    accessorKey: 'start_date',
    header: t('startDate'),
    cell: ({ row }) => <div>{new Date(row.getValue('start_date')).toLocaleDateString()}</div>
  },
  {
    accessorKey: 'end_date',
    header: t('endDate'),
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
  const t = useTranslations('promotion')
  const tCommon = useTranslations('common')
  const { mutateAsync } = useDeletePromotionMutation()
  const deletePromotion = async () => {
    if (promotionDelete) {
      try {
        const result = await mutateAsync(promotionDelete._id)
        setPromotionDelete(null)
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
      open={Boolean(promotionDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setPromotionDelete(null)
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deletePromotionConfirm')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('deletePromotionDesc', { name: promotionDelete?.name })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={deletePromotion}>{tCommon('continue')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Số lượng item trên 1 trang
const PAGE_SIZE = 10
export default function PromotionTable() {
  const t = useTranslations('promotion')
  const tCommon = useTranslations('common')
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
    <PromotionTableContext.Provider
      value={{ setPromotionIdEdit, promotionIdEdit, promotionDelete, setPromotionDelete }}
    >
      <div className='w-full'>
        <EditPromotion id={promotionIdEdit} setId={setPromotionIdEdit} />
        <AlertDialogDeletePromotion promotionDelete={promotionDelete} setPromotionDelete={setPromotionDelete} />
        <div className='flex items-center py-4'>
          <Input
            placeholder={t('filterByName')}
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
              pathname='/manage/promotions'
            />
          </div>
        </div>
      </div>
    </PromotionTableContext.Provider>
  )
}
