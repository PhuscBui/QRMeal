'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GetOrdersResType } from '@/schemaValidations/order.schema'
import { useContext } from 'react'
import { formatCurrency, formatDateTimeToLocaleString, getOrderStatus, simpleMatchText } from '@/lib/utils'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { OrderStatus, OrderStatusValues } from '@/constants/type'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { OrderTableContext } from '@/app/manage/orders/order-table'
import OrderDetail from '@/app/manage/orders/order-detail'
import { DeliveryInfoComponent } from '@/app/manage/orders/delivery-info'
import { Pen } from 'lucide-react'

type OrderGroup = GetOrdersResType['result'][0]

const orderTableColumns: ColumnDef<OrderGroup>[] = [
  {
    accessorKey: 'table_number',
    header: 'Table',
    cell: ({ row }) => <div>{row.getValue('table_number') || 'N/A'}</div>,
    filterFn: (row, columnId, filterValue: string) => {
      if (filterValue === undefined) return true
      const tableNumber = row.getValue(columnId)
      return simpleMatchText(String(tableNumber || ''), String(filterValue))
    }
  },
  {
    id: 'guestName',
    header: 'Guest/Customer',
    cell: function Cell({ row }) {
      const { orderObjectByGuestId }: { orderObjectByGuestId: Record<string, OrderGroup[]> } =
        useContext(OrderTableContext)
      const guest = row.original.guest
      const customer = row.original.customer

      // FIX: Priority for customer or guest info
      const displayInfo = customer || guest
      // FIX: Use both customer_id and guest_id
      const guestId = row.original.customer_id || row.original.guest_id

      const orders = guestId
        ? orderObjectByGuestId[guestId].filter((t) => t.order_type === row.original.order_type) || []
        : []

      return (
        <div>
          {!displayInfo && (
            <div>
              <span>Deleted</span>
            </div>
          )}
          {displayInfo && (
            <Popover>
              <PopoverTrigger>
                <div>
                  <span>{displayInfo.name}</span>
                  <span className='font-semibold'>(#{displayInfo._id})</span>
                  {customer && (
                    <Badge variant='secondary' className='ml-1'>
                      Customer
                    </Badge>
                  )}
                  {guest && !customer && (
                    <Badge variant='outline' className='ml-1'>
                      Guest
                    </Badge>
                  )}
                </div>
              </PopoverTrigger>
              <PopoverContent className='w-[320px] sm:w-[440px]'>
                <OrderDetail user={displayInfo} orders={orders} orderType={row.original.order_type || 'dine-in'} />
              </PopoverContent>
            </Popover>
          )}
        </div>
      )
    },
    filterFn: (row, columnId, filterValue: string) => {
      if (filterValue === undefined) return true
      const guest = row.original.guest
      const customer = row.original.customer
      // FIX: Search in both customer and guest names
      const name = customer?.name || guest?.name || 'Deleted'
      return simpleMatchText(name, String(filterValue))
    }
  },

  {
    id: 'orders',
    header: 'Orders',
    cell: ({ row }) => {
      const orders = row.original.orders
      const totalItems = orders.reduce((sum, order) => sum + order.quantity, 0)
      const totalAmount = orders.reduce((sum, order) => sum + order.dish_snapshot.price * order.quantity, 0)

      return (
        <div className='space-y-2'>
          <div className='flex flex-wrap gap-2'>
            {orders.slice(0, 2).map((order) => (
              <Popover key={order._id}>
                <PopoverTrigger asChild>
                  <Image
                    src={order.dish_snapshot.image || `https://placehold.co/600x400`}
                    alt={order.dish_snapshot.name}
                    width={40}
                    height={40}
                    className='rounded-md object-cover w-[40px] h-[40px] cursor-pointer'
                  />
                </PopoverTrigger>
                <PopoverContent>
                  <div className='flex flex-wrap gap-2'>
                    <Image
                      src={order.dish_snapshot.image || `https://placehold.co/600x400`}
                      alt={order.dish_snapshot.name}
                      width={100}
                      height={100}
                      className='rounded-md object-cover w-[100px] h-[100px]'
                    />
                    <div className='space-y-1 text-sm'>
                      <h3 className='font-semibold'>{order.dish_snapshot.name}</h3>
                      <div className='italic'>{formatCurrency(order.dish_snapshot.price)}</div>
                      <div>{order.dish_snapshot.description}</div>
                      <Badge variant='secondary'>x{order.quantity}</Badge>
                      <div>Status: {getOrderStatus(order.status)}</div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            ))}
            {orders.length > 2 && (
              <div className='w-[40px] h-[40px] rounded-md bg-gray-200 flex items-center justify-center text-sm'>
                +{orders.length - 2}
              </div>
            )}
          </div>
          <div className='text-sm space-y-1'>
            <div>
              Total items: <Badge variant='outline'>{totalItems}</Badge>
            </div>
            <div className='font-semibold'>{formatCurrency(totalAmount)}</div>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: 'status',
    header: 'Group Status',
    cell: function Cell({ row }) {
      return (
        <Badge variant={row.original.status === OrderStatus.Delivered ? 'default' : 'secondary'}>
          {getOrderStatus(row.original.status)}
        </Badge>
      )
    }
  },
  {
    id: 'orderType',
    header: 'Type',
    cell: ({ row }) => (
      <Badge variant={row.original.order_type === 'dine-in' ? 'default' : 'destructive'}>
        {row.original.order_type === 'dine-in' ? 'Dine In' : 'Delivery'}
      </Badge>
    )
  },
  {
    id: 'deliveryInfo',
    header: 'Delivery',
    cell: ({ row }) => {
      const orderGroup = row.original as GetOrdersResType['result'][0]
      const delivery = orderGroup.delivery
      return <DeliveryInfoComponent order_group_id={orderGroup._id} delivery={delivery} />
    }
  },
  {
    accessorKey: 'created_at',
    header: () => <div>Create / Update at</div>,
    cell: ({ row }) => (
      <div className='space-y-2 text-sm'>
        <div className='flex items-center space-x-4'>{formatDateTimeToLocaleString(row.getValue('created_at'))}</div>
        <div className='flex items-center space-x-4'>{formatDateTimeToLocaleString(row.original.updated_at)}</div>
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
          <Popover>
            <PopoverTrigger asChild>
              <Button variant='outline' size='sm'>
                Manage Orders
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-96'>
              <div className='space-y-3'>
                <h4 className='font-semibold'>Individual Orders</h4>
                {row.original.orders.map((order) => (
                  <div key={order._id} className='flex items-center justify-between p-2 border rounded'>
                    <div className='flex items-center gap-2'>
                      <Image
                        src={order.dish_snapshot.image || `https://placehold.co/600x400`}
                        alt={order.dish_snapshot.name}
                        width={30}
                        height={30}
                        className='rounded'
                      />
                      <span className='text-sm'>{order.dish_snapshot.name}</span>
                      <Badge variant='outline'>x{order.quantity}</Badge>
                    </div>
                    <IndividualOrderStatusSelect order={order} />
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )
    }
  }
]

// Component for individual order status management
function IndividualOrderStatusSelect({ order }: { order: GetOrdersResType['result'][0]['orders'][0] }) {
  const { changeStatus } = useContext(OrderTableContext)

  const changeOrderStatus = async (status: (typeof OrderStatusValues)[number]) => {
    changeStatus({
      order_id: order._id,
      dish_id: order.dish_snapshot.dish_id!,
      status: status,
      quantity: order.quantity
    })
  }

  return (
    <Select
      onValueChange={(value: (typeof OrderStatusValues)[number]) => {
        changeOrderStatus(value)
      }}
      value={order.status}
    >
      <SelectTrigger className='w-[120px]'>
        <SelectValue placeholder='Status' />
      </SelectTrigger>
      <SelectContent>
        {OrderStatusValues.map((status) => (
          <SelectItem key={status} value={status}>
            {getOrderStatus(status)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default orderTableColumns
