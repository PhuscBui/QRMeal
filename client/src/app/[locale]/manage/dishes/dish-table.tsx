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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { formatCurrency, getDishStatus, handleErrorApi } from '@/lib/utils'
import { useSearchParams } from 'next/navigation'
import AutoPagination from '@/components/auto-pagination'
import { DishListResType } from '@/schemaValidations/dish.schema'
import EditDish from '@/app/manage/dishes/edit-dish'
import AddDish from '@/app/manage/dishes/add-dish'
import { useDeleteDishMutation, useDishListQuery } from '@/queries/useDish'
import { toast } from 'sonner'
import { Pen, Trash } from 'lucide-react'
import { useTranslations } from 'next-intl'

type DishItem = DishListResType['result'][0]

const getStatusBadge = (status: string, t: any) => {
  if (status === 'Available') {
    return <span className='bg-green-100 text-green-800 rounded-full px-2 py-1 text-xs font-bold'>{t('available')}</span>
  }
  if (status === 'Unavailable') {
    return <span className='bg-red-100 text-red-800 rounded-full px-2 py-1 text-xs font-bold'>{t('unavailable')}</span>
  }
  return <span className='bg-yellow-100 text-yellow-800 rounded-full px-2 py-1 text-xs font-bold'>{t('hidden')}</span>
}

const DishTableContext = createContext<{
  setDishIdEdit: (value: string) => void
  dishIdEdit: string | undefined
  dishDelete: DishItem | null
  setDishDelete: (value: DishItem | null) => void
}>({
  setDishIdEdit: () => {},
  dishIdEdit: undefined,
  dishDelete: null,
  setDishDelete: () => {}
})

const getColumns = (t: any): ColumnDef<DishItem>[] => [
  {
    accessorKey: 'index',
    header: t('no'),
    cell: ({ row }) => <div>{row.index + 1}</div>
  },
  {
    accessorKey: '_id',
    header: t('id')
  },
  {
    accessorKey: 'image',
    header: t('image'),
    cell: ({ row }) => (
      <div>
        <Avatar className='aspect-square w-[100px] h-[100px] rounded-md object-cover'>
          <AvatarImage src={row.getValue('image')} />
          <AvatarFallback className='rounded-none'>{row.original.name}</AvatarFallback>
        </Avatar>
      </div>
    )
  },
  {
    accessorKey: 'name',
    header: t('name'),
    cell: ({ row }) => <div className='capitalize'>{row.getValue('name')}</div>
  },
  {
    accessorKey: 'price',
    header: t('price'),
    cell: ({ row }) => <div className='capitalize'>{formatCurrency(row.getValue('price'))}</div>
  },
  {
    accessorKey: 'description',
    header: t('description'),
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
    accessorKey: 'category_name',
    header: t('category'),
    cell: ({ row }) => {
      return <div className='capitalize'>{row.getValue('category_name') || t('other')}</div>
    }
  },
  {
    accessorKey: 'status',
    header: t('status'),
    cell: ({ row }) => <div>{getStatusBadge(getDishStatus(row.getValue('status')), t)}</div>
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: function Actions({ row }) {
      const { setDishIdEdit, setDishDelete } = useContext(DishTableContext)
      return (
        <div className='flex gap-2'>
          <Button variant='default' className='h-8 w-8 p-0' onClick={() => setDishIdEdit(row.original._id)}>
            <Pen className='h-4 w-4' />
          </Button>
          <Button variant='destructive' className='h-8 w-8 p-0' onClick={() => setDishDelete(row.original)}>
            <Trash className='h-4 w-4' />
          </Button>
        </div>
      )
    }
  }
]

function AlertDialogDeleteDish({
  dishDelete,
  setDishDelete
}: {
  dishDelete: DishItem | null
  setDishDelete: (value: DishItem | null) => void
}) {
  const t = useTranslations('dish')
  const tCommon = useTranslations('common')
  const { mutateAsync } = useDeleteDishMutation()
  const deleteDish = async () => {
    if (dishDelete) {
      try {
        const result = await mutateAsync(dishDelete._id)
        setDishDelete(null)
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
      open={Boolean(dishDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setDishDelete(null)
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deleteDish')}</AlertDialogTitle>
          <AlertDialogDescription>
            <span className='bg-foreground text-primary-foreground rounded p-1'>{dishDelete?.name}</span>{' '}
            {t('deleteConfirmation')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={deleteDish}>{tCommon('continue')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
// Số lượng item trên 1 trang
const PAGE_SIZE = 10
export default function DishTable() {
  const t = useTranslations('dish')
  const searchParam = useSearchParams()
  const page = searchParam.get('page') ? Number(searchParam.get('page')) : 1
  const pageIndex = page - 1
  const [dishIdEdit, setDishIdEdit] = useState<string | undefined>()
  const [dishDelete, setDishDelete] = useState<DishItem | null>(null)
  const dishListQuery = useDishListQuery()
  const data = dishListQuery.data?.payload.result ?? []
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
      pageIndex,
      pageSize: PAGE_SIZE
    })
  }, [table, pageIndex])

  return (
    <DishTableContext.Provider value={{ dishIdEdit, setDishIdEdit, dishDelete, setDishDelete }}>
      <div className='w-full'>
        <EditDish id={dishIdEdit} setId={setDishIdEdit} />
        <AlertDialogDeleteDish dishDelete={dishDelete} setDishDelete={setDishDelete} />
        <div className='flex items-center py-4'>
          <Input
            placeholder={t('filterDishes')}
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
            className='max-w-sm'
          />
          <div className='ml-auto flex items-center gap-2'>
            <AddDish />
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
                  <TableCell colSpan={table.getAllColumns().length} className='h-24 text-center'>
                    {t('noResults')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className='flex items-center justify-end space-x-2 py-4'>
          <div className='text-xs text-muted-foreground py-4 flex-1 '>
            {t('displayItems', { count: table.getPaginationRowModel().rows.length, total: data.length })}
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
    </DishTableContext.Provider>
  )
}
