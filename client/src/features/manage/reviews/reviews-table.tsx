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
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import AutoPagination from '@/components/auto-pagination'
import { DishReviewByDishListResType } from '@/schemaValidations/dish-review.schema'
import { useGetAllDishReviewsQuery } from '@/queries/useDishReview'
import { Star } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'

type ReviewItem = DishReviewByDishListResType['result']['reviews'][0]

const getRatingStars = (rating: number) => {
  return (
    <div className='flex items-center gap-1'>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
      <span className='ml-1 text-sm font-medium'>{rating}</span>
    </div>
  )
}

const getColumns = (t: ReturnType<typeof useTranslations>): ColumnDef<ReviewItem>[] => [
  {
    accessorKey: 'index',
    header: t('no'),
    cell: ({ row }) => <div>{row.index + 1}</div>
  },
  {
    accessorKey: 'dish',
    header: t('dish'),
    cell: ({ row }) => {
      const dish = row.original.dish
      if (!dish) return <div className='text-muted-foreground'>{t('unknown')}</div>
      return (
        <div className='flex items-center gap-2'>
          {dish.image && (
            <Avatar className='h-10 w-10 rounded-md'>
              <AvatarImage src={dish.image} alt={dish.name} />
              <AvatarFallback>{dish.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          )}
          <span className='font-medium'>{dish.name}</span>
        </div>
      )
    }
  },
  {
    accessorKey: 'author',
    header: t('customer'),
    cell: ({ row }) => {
      const author = row.original.author
      if (!author) return <div className='text-muted-foreground'>{t('unknown')}</div>
      return (
        <div className='flex items-center gap-2'>
          {author.avatar && (
            <Avatar className='h-8 w-8'>
              <AvatarImage src={author.avatar} alt={author.name} />
              <AvatarFallback>{author.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          )}
          <div>
            <div className='font-medium'>{author.name}</div>
            {author.email && <div className='text-xs text-muted-foreground'>{author.email}</div>}
            {author.phone && <div className='text-xs text-muted-foreground'>{author.phone}</div>}
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: 'rating',
    header: t('rating'),
    cell: ({ row }) => getRatingStars(row.getValue('rating'))
  },
  {
    accessorKey: 'comment',
    header: t('comment'),
    cell: ({ row }) => {
      const comment = row.getValue('comment') as string | undefined
      return (
        <div className='max-w-md'>{comment || <span className='text-muted-foreground'>{t('noComment')}</span>}</div>
      )
    }
  },
  {
    accessorKey: 'created_at',
    header: t('date'),
    cell: ({ row }) => {
      const date = row.getValue('created_at') as string | undefined
      if (!date) return <div className='text-muted-foreground'>-</div>
      try {
        return <div>{format(new Date(date), 'dd/MM/yyyy HH:mm')}</div>
      } catch {
        return <div>{date}</div>
      }
    }
  }
]

const PAGE_SIZE = 10

export default function ReviewsTable() {
  const t = useTranslations('reviews')
  const tCommon = useTranslations('common')
  const searchParam = useSearchParams()
  const page = searchParam.get('page') ? Number(searchParam.get('page')) : 1
  const [ratingFilter, setRatingFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'rating' | 'created_at'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const pageIndex = page - 1

  const query = {
    page: page.toString(),
    limit: PAGE_SIZE.toString(),
    ...(ratingFilter && ratingFilter !== 'all' && { rating: ratingFilter }),
    sortBy,
    sortOrder
  }

  const reviewsQuery = useGetAllDishReviewsQuery(true, query)
  const data = reviewsQuery.data?.payload.result.reviews ?? []
  const total = reviewsQuery.data?.payload.result.total ?? 0

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

  if (reviewsQuery.isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-muted-foreground'>{tCommon('loading')}</div>
      </div>
    )
  }

  if (reviewsQuery.isError) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='text-destructive'>{tCommon('error')}</div>
      </div>
    )
  }

  return (
    <div className='w-full'>
      <div className='flex items-center gap-4 py-4'>
        <Input
          placeholder={t('filterByDish')}
          value={(table.getColumn('dish')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('dish')?.setFilterValue(event.target.value)}
          className='max-w-sm'
        />
        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder={t('filterByRating')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('allRatings')}</SelectItem>
            <SelectItem value='5'>5 {t('stars')}</SelectItem>
            <SelectItem value='4'>4 {t('stars')}</SelectItem>
            <SelectItem value='3'>3 {t('stars')}</SelectItem>
            <SelectItem value='2'>2 {t('stars')}</SelectItem>
            <SelectItem value='1'>1 {t('star')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'rating' | 'created_at')}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder={t('sortBy')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='created_at'>{t('sortByDate')}</SelectItem>
            <SelectItem value='rating'>{t('sortByRating')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}>
          <SelectTrigger className='w-[120px]'>
            <SelectValue placeholder={t('order')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='desc'>{t('descending')}</SelectItem>
            <SelectItem value='asc'>{t('ascending')}</SelectItem>
          </SelectContent>
        </Select>
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
                  {tCommon('noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='flex items-center justify-end space-x-2 py-4'>
        <div className='text-xs text-muted-foreground py-4 flex-1'>
          {tCommon('displayItems', { count: data.length, total })}
        </div>
        <div>
          <AutoPagination
            page={table.getState().pagination.pageIndex + 1}
            pageSize={Math.ceil(total / PAGE_SIZE)}
            pathname='/manage/reviews'
          />
        </div>
      </div>
    </div>
  )
}
