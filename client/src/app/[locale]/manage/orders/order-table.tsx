/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import {
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
import {
  CreateOrderGroupResType,
  GetOrdersResType,
  PayOrdersResType,
  UpdateDeliveryResType,
  UpdateOrderResType
} from '@/schemaValidations/order.schema'
import AddOrder from '@/app/manage/orders/add-order'
import EditOrder from '@/app/manage/orders/edit-order'
import { createContext, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import AutoPagination from '@/components/auto-pagination'
import { getOrderStatus, handleErrorApi } from '@/lib/utils'
import { OrderStatusValues } from '@/constants/type'
import OrderStatics from '@/app/manage/orders/order-statics'
import orderTableColumns from '@/app/manage/orders/order-table-columns'
import { useOrderService } from '@/app/manage/orders/order.service'
import { Check, ChevronsUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { endOfDay, format, startOfDay } from 'date-fns'
import TableSkeleton from '@/app/manage/orders/table-skeleton'
import { toast } from 'sonner'
import { useGetOrderListQuery, useUpdateOrderMutation } from '@/queries/useOrder'
import { useTableListQuery } from '@/queries/useTable'
import { useAppContext } from '@/components/app-provider'
import { useTranslations } from 'next-intl'

// Updated context type to work with OrderGroup
export const OrderTableContext = createContext({
  setOrderIdEdit: (value: string | undefined) => {},
  orderIdEdit: undefined as string | undefined,
  changeStatus: (payload: {
    order_id: string
    dish_id: string
    status: (typeof OrderStatusValues)[number]
    quantity: number
  }) => {},
  orderObjectByGuestId: {} as OrderObjectByGuestID
})

export type StatusCountObject = Record<(typeof OrderStatusValues)[number], number>
export type Statics = {
  status: StatusCountObject
  table: Record<number, Record<string, StatusCountObject>>
}

// Updated types to work with OrderGroup structure
export type OrderObjectByGuestID = Record<string, GetOrdersResType['result']>
export type ServingGuestByTableNumber = Record<number, OrderObjectByGuestID>

const PAGE_SIZE = 10
const initFromDate = startOfDay(new Date())
const initToDate = endOfDay(new Date())

export default function OrderTable() {
  const searchParam = useSearchParams()
  const { socket } = useAppContext()
  const [openStatusFilter, setOpenStatusFilter] = useState(false)
  const [fromDate, setFromDate] = useState(initFromDate)
  const [toDate, setToDate] = useState(initToDate)
  const page = searchParam.get('page') ? Number(searchParam.get('page')) : 1
  const pageIndex = page - 1
  const [orderIdEdit, setOrderIdEdit] = useState<string | undefined>()

  // FIX: Add debugging logs to check data
  const orderListQuery = useGetOrderListQuery({
    fromDate,
    toDate
  })
  const refetchOrderList = orderListQuery.refetch
  const orderGroupList = useMemo(() => orderListQuery.data?.payload.result ?? [], [orderListQuery.data?.payload.result])

  const tableListQuery = useTableListQuery()
  const tableList = tableListQuery.data?.payload.result ?? []
  const tableListSortedByNumber = tableList.sort((a, b) => a.number - b.number)

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [pagination, setPagination] = useState({
    pageIndex,
    pageSize: PAGE_SIZE
  })

  const updateOrderMutation = useUpdateOrderMutation()

  // FIX: Enhanced orderObjectByGuestId to handle both customers and guests
  const processOrderGroups = (orderGroups: GetOrdersResType['result']) => {
    const orderObjectByGuestId: Record<string, GetOrdersResType['result']> = {}

    orderGroups.forEach((group) => {
      // FIX: Use both customer_id and guest_id
      const guestId = group.customer_id || group.guest_id
      if (guestId) {
        if (!orderObjectByGuestId[guestId]) {
          orderObjectByGuestId[guestId] = []
        }
        orderObjectByGuestId[guestId].push(group)
      }
    })

    return orderObjectByGuestId
  }

  const { statics, servingGuestByTableNumber } = useOrderService(orderGroupList)
  // FIX: Use our enhanced processing function
  const orderObjectByGuestId = processOrderGroups(orderGroupList)

  const changeStatus = async (body: {
    order_id: string
    dish_id: string
    status: (typeof OrderStatusValues)[number]
    quantity: number
  }) => {
    try {
      await updateOrderMutation.mutateAsync(body)
    } catch (error) {
      handleErrorApi({
        error
      })
    }
  }

  const table = useReactTable({
    data: orderGroupList,
    columns: orderTableColumns,
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

  const resetDateFilter = () => {
    setFromDate(initFromDate)
    setToDate(initToDate)
  }

  useEffect(() => {
    if (socket?.connected) {
      onConnect()
    }

    function onConnect() {
      console.log(socket?.id)
    }

    function onDisconnect() {
      console.log('disconnect')
    }

    function refetch() {
      const now = new Date()
      if (now >= fromDate && now <= toDate) {
        refetchOrderList()
      }
    }

    function onUpdateOrder(data: UpdateOrderResType['result']) {
      const {
        dish_snapshot: { name },
        quantity
      } = data
      toast(tCommon('success'), {
        description: t('itemUpdatedStatus', { name, quantity, status: getOrderStatus(data.status) })
      })
      refetch()
    }

    function onNewOrder(data: CreateOrderGroupResType['result']) {
      const guest = data.orderGroup.guest // FIX: Handle guest orders
      const customer = data.orderGroup.customer // FIX: Also handle customer
      const displayName = customer?.name || guest?.name || 'Unknown'

      const key = data.orders.length === 1 ? 'newOrderPlaced' : 'newOrdersPlaced'
      toast(tCommon('success'), {
        description: t(key, { 
          name: displayName, 
          tableNumber: data.orderGroup.table_number, 
          count: data.orders.length 
        })
      })
      refetch()
    }

    function OnPayOrder(data: PayOrdersResType['result']) {
      const guest = data[0].guest // FIX: Handle guest orders
      const customer = data[0].customer // FIX: Also handle customer
      const displayName = customer?.name || guest?.name || 'Unknown'

      toast(tCommon('success'), {
        description: t('paidOrder', { name: displayName })
      })
      refetch()
    }

    function OnUpdateDeliveryStatus(data: UpdateDeliveryResType['result']) {
      const { status, customer } = data

      toast.success(t('deliveryStatusUpdated', { name: customer, status }))
      refetch()
    }

    socket?.on('update-order', onUpdateOrder)
    socket?.on('new-order', onNewOrder)
    socket?.on('connect', onConnect)
    socket?.on('disconnect', onDisconnect)
    socket?.on('payment', OnPayOrder)
    socket?.on('delivery-status-update', OnUpdateDeliveryStatus)

    return () => {
      socket?.off('connect', onConnect)
      socket?.off('disconnect', onDisconnect)
      socket?.off('update-order', onUpdateOrder)
      socket?.off('new-order', onNewOrder)
      socket?.off('payment', OnPayOrder)
      socket?.off('delivery-status-update', OnUpdateDeliveryStatus)
    }
  }, [refetchOrderList, fromDate, toDate, socket])

  return (
    <OrderTableContext.Provider
      value={{
        orderIdEdit,
        setOrderIdEdit,
        changeStatus,
        orderObjectByGuestId
      }}
    >
      <div className='w-full'>
        <EditOrder id={orderIdEdit} setId={setOrderIdEdit} onSubmitSuccess={() => {}} />
        <div className='flex items-center'>
          <div className='flex flex-wrap gap-2'>
            <div className='flex items-center'>
              <span className='mr-2'>{t('from')}</span>
              <Input
                type='datetime-local'
                placeholder={t('from')}
                className='text-sm'
                value={format(fromDate, 'yyyy-MM-dd HH:mm').replace(' ', 'T')}
                onChange={(event) => setFromDate(new Date(event.target.value))}
              />
            </div>
            <div className='flex items-center'>
              <span className='mr-2'>{t('to')}</span>
              <Input
                type='datetime-local'
                placeholder={t('to')}
                value={format(toDate, 'yyyy-MM-dd HH:mm').replace(' ', 'T')}
                onChange={(event) => setToDate(new Date(event.target.value))}
              />
            </div>
            <Button className='' variant={'outline'} onClick={resetDateFilter}>
              {t('reset')}
            </Button>
          </div>
          <div className='ml-auto'>
            <AddOrder />
          </div>
        </div>
        <div className='flex flex-wrap items-center gap-4 py-4'>
          <Input
            placeholder={t('guestCustomerName')}
            value={(table.getColumn('guestName')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('guestName')?.setFilterValue(event.target.value)}
            className='max-w-[140px]'
          />
          <Input
            placeholder={t('table')}
            value={(table.getColumn('table_number')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('table_number')?.setFilterValue(event.target.value)}
            className='max-w-[80px]'
          />
          <Popover open={openStatusFilter} onOpenChange={setOpenStatusFilter}>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                role='combobox'
                aria-expanded={openStatusFilter}
                className='w-[150px] text-sm justify-between'
              >
                {table.getColumn('status')?.getFilterValue()
                  ? getOrderStatus(table.getColumn('status')?.getFilterValue() as (typeof OrderStatusValues)[number])
                  : t('groupStatus')}
                <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-[200px] p-0'>
              <Command>
                <CommandGroup>
                  <CommandList>
                    {OrderStatusValues.map((status) => (
                      <CommandItem
                        key={status}
                        value={status}
                        onSelect={(currentValue) => {
                          table
                            .getColumn('status')
                            ?.setFilterValue(
                              currentValue === table.getColumn('status')?.getFilterValue() ? '' : currentValue
                            )
                          setOpenStatusFilter(false)
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            table.getColumn('status')?.getFilterValue() === status ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {getOrderStatus(status)}
                      </CommandItem>
                    ))}
                  </CommandList>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <OrderStatics
          statics={statics}
          tableList={tableListSortedByNumber}
          servingGuestByTableNumber={servingGuestByTableNumber}
        />

        {orderListQuery.isPending && <TableSkeleton />}
        {!orderListQuery.isPending && (
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
                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={orderTableColumns.length} className='h-24 text-center'>
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
        <div className='flex items-center justify-end space-x-2 py-4'>
          <div className='text-xs text-muted-foreground py-4 flex-1 '>
            Display <strong>{table.getPaginationRowModel().rows.length}</strong> in{' '}
            <strong>{orderGroupList.length}</strong> order groups
          </div>
          <div>
            <AutoPagination
              page={table.getState().pagination.pageIndex + 1}
              pageSize={table.getPageCount()}
              pathname='/manage/orders'
            />
          </div>
        </div>
      </div>
    </OrderTableContext.Provider>
  )
}
