'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GetOrdersResType } from '@/schemaValidations/order.schema'
import { useContext } from 'react'
import { formatCurrency, formatDateTimeToLocaleString, getVietnameseOrderStatus, simpleMatchText } from '@/lib/utils'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { OrderStatus, OrderStatusValues } from '@/constants/type'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { OrderTableContext } from '@/app/manage/orders/order-table'
import OrderGuestDetail from '@/app/manage/orders/order-guest-detail'
import { Pen } from 'lucide-react'

type OrderItem = GetOrdersResType['result'][0]
const orderTableColumns: ColumnDef<OrderItem>[] = [
  {
    accessorKey: 'table_number',
    header: 'Table',
    cell: ({ row }) => <div>{row.getValue('table_number')}</div>,
    filterFn: (row, columnId, filterValue: string) => {
      if (filterValue === undefined) return true
      return simpleMatchText(String(row.getValue(columnId)), String(filterValue))
    }
  },
  {
    id: 'guestName',
    header: 'Guest',
    cell: function Cell({ row }) {
      const { orderObjectByGuestId }: { orderObjectByGuestId: Record<string, OrderItem[]> } =
        useContext(OrderTableContext)
      const guest = row.original.guest
      return (
        <div>
          {!guest && (
            <div>
              <span>Deleted</span>
            </div>
          )}
          {guest && (
            <Popover>
              <PopoverTrigger>
                <div>
                  <span>{guest.name}</span>
                  <span className='font-semibold'>(#{guest._id})</span>
                </div>
              </PopoverTrigger>
              <PopoverContent className='w-[320px] sm:w-[440px]'>
                <OrderGuestDetail guest={guest} orders={orderObjectByGuestId[guest._id]} />
              </PopoverContent>
            </Popover>
          )}
        </div>
      )
    },
    filterFn: (row, columnId, filterValue: string) => {
      if (filterValue === undefined) return true
      return simpleMatchText(row.original.guest?.name ?? 'Deleted', String(filterValue))
    }
  },
  {
    id: 'dishName',
    header: 'Món ăn',
    cell: ({ row }) => (
      <div className='flex items-center gap-2'>
        <Popover>
          <PopoverTrigger asChild>
            <Image
              src={row.original.dish_snapshot.image || `https://placehold.co/600x400`}
              alt={row.original.dish_snapshot.name}
              width={50}
              height={50}
              className='rounded-md object-cover w-[50px] h-[50px] cursor-pointer'
            />
          </PopoverTrigger>
          <PopoverContent>
            <div className='flex flex-wrap gap-2'>
              <Image
                src={row.original.dish_snapshot.image || `https://placehold.co/600x400`}
                alt={row.original.dish_snapshot.name}
                width={100}
                height={100}
                className='rounded-md object-cover w-[100px] h-[100px]'
              />
              <div className='space-y-1 text-sm'>
                <h3 className='font-semibold'>{row.original.dish_snapshot.name}</h3>
                <div className='italic'>{formatCurrency(row.original.dish_snapshot.price)}</div>
                <div>{row.original.dish_snapshot.description}</div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <span>{row.original.dish_snapshot.name}</span>
            <Badge className='px-1' variant={'secondary'}>
              x{row.original.quantity}
            </Badge>
          </div>
          <span className='italic'>{formatCurrency(row.original.dish_snapshot.price * row.original.quantity)}</span>
        </div>
      </div>
    )
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: function Cell({ row }) {
      const { changeStatus } = useContext(OrderTableContext)
      const changeOrderStatus = async (status: (typeof OrderStatusValues)[number]) => {
        changeStatus({
          order_id: row.original._id,
          dish_id: row.original.dish_snapshot.dish_id!,
          status: status,
          quantity: row.original.quantity
        })
      }
      return (
        <Select
          onValueChange={(value: (typeof OrderStatusValues)[number]) => {
            changeOrderStatus(value)
          }}
          defaultValue={OrderStatus.Pending}
          value={row.getValue('status')}
        >
          <SelectTrigger className='w-[140px]'>
            <SelectValue placeholder='Theme' />
          </SelectTrigger>
          <SelectContent>
            {OrderStatusValues.map((status) => (
              <SelectItem key={status} value={status}>
                {getVietnameseOrderStatus(status)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }
  },
  {
    id: 'orderHandlerName',
    header: 'Order Handler',
    cell: ({ row }) => <div>{row.original.order_handler?.name ?? ''}</div>
  },
  {
    accessorKey: 'created_at',
    header: () => <div>Create / Update at</div>,
    cell: ({ row }) => (
      <div className='space-y-2 text-sm'>
        <div className='flex items-center space-x-4'>{formatDateTimeToLocaleString(row.getValue('created_at'))}</div>
        <div className='flex items-center space-x-4'>
          {formatDateTimeToLocaleString(row.original.updated_at as unknown as string)}
        </div>
      </div>
    )
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: function Actions({ row }) {
      const { setOrderIdEdit } = useContext(OrderTableContext)
      const openEditOrder = () => {
        setOrderIdEdit(row.original._id)
      }

      return (
        <div className='flex gap-2'>
          <Button variant='default' className='h-8 w-8 p-0' onClick={openEditOrder}>
            <Pen className='h-4 w-4' />
          </Button>
        </div>
      )
    }
  }
]

export default orderTableColumns
