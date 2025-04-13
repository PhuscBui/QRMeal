import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { OrderStatus } from '@/constants/type'
import {
  OrderStatusIcon,
  formatCurrency,
  formatDateTimeToLocaleString,
  formatDateTimeToTimeString,
  getVietnameseOrderStatus,
  handleErrorApi
} from '@/lib/utils'
import { usePayForGuestMutation } from '@/queries/useOrder'
import { GetOrdersResType, PayGuestOrdersResType } from '@/schemaValidations/order.schema'
import Image from 'next/image'
import { Fragment } from 'react'

type Guest = GetOrdersResType['result'][0]['guest']
type Orders = GetOrdersResType['result']
export default function OrderGuestDetail({
  guest,
  orders,
  onPaySuccess
}: {
  guest: Guest
  orders: Orders
  onPaySuccess?: (data: PayGuestOrdersResType) => void
}) {
  const ordersFilterToPurchase = guest
    ? orders.filter((order) => order.status !== OrderStatus.Paid && order.status !== OrderStatus.Rejected)
    : []
  const purchasedOrderFilter = guest ? orders.filter((order) => order.status === OrderStatus.Paid) : []
  const payForGuestMutation = usePayForGuestMutation()

  const pay = async () => {
    if (payForGuestMutation.isPending || !guest) return
    try {
      const result = await payForGuestMutation.mutateAsync({
        guestId: guest._id
      })
      if (onPaySuccess) {
        onPaySuccess(result.payload)
      }
    } catch (error) {
      handleErrorApi({
        error
      })
    }
  }
  return (
    <div className='space-y-2 text-sm'>
      {guest && (
        <Fragment>
          <div className='space-x-1'>
            <span className='font-semibold'>Name:</span>
            <span>{guest.name}</span>
            <span className='font-semibold'>(#{guest._id})</span>
            <span>|</span>
            <span className='font-semibold'>Table:</span>
            <span>{guest.table_number}</span>
          </div>
          <div className='space-x-1'>
            <span className='font-semibold'>Create at:</span>
            <span>{formatDateTimeToLocaleString(guest.created_at)}</span>
          </div>
        </Fragment>
      )}

      <div className='space-y-1'>
        <div className='font-semibold'>Orders:</div>
        {orders.map((order, index) => {
          return (
            <div key={order._id} className='flex gap-2 items-center text-xs'>
              <span className='w-[10px]'>{index + 1}</span>
              <span title={getVietnameseOrderStatus(order.status)}>
                {order.status === OrderStatus.Pending && <OrderStatusIcon.Pending className='w-4 h-4' />}
                {order.status === OrderStatus.Processing && <OrderStatusIcon.Processing className='w-4 h-4' />}
                {order.status === OrderStatus.Rejected && <OrderStatusIcon.Rejected className='w-4 h-4 text-red-400' />}
                {order.status === OrderStatus.Delivered && <OrderStatusIcon.Delivered className='w-4 h-4' />}
                {order.status === OrderStatus.Paid && <OrderStatusIcon.Paid className='w-4 h-4 text-yellow-400' />}
              </span>
              <Image
                src={order.dish_snapshot.image || 'https://placehold.co/600x400'}
                alt={order.dish_snapshot.name}
                title={order.dish_snapshot.name}
                width={30}
                height={30}
                className='h-[30px] w-[30px] rounded object-cover'
              />
              <span className='truncate w-[70px] sm:w-[100px]' title={order.dish_snapshot.name}>
                {order.dish_snapshot.name}
              </span>
              <span className='font-semibold' title={`Total: ${order.quantity}`}>
                x{order.quantity}
              </span>
              <span className='italic'>{formatCurrency(order.quantity * order.dish_snapshot.price)}</span>
              <span
                className='hidden sm:inline'
                title={`Create: ${formatDateTimeToLocaleString(
                  order.created_at
                )} | Update at: ${formatDateTimeToLocaleString(order.updated_at)}
          `}
              >
                {formatDateTimeToLocaleString(order.created_at)}
              </span>
              <span
                className='sm:hidden'
                title={`Create: ${formatDateTimeToLocaleString(
                  order.created_at
                )} | Update at: ${formatDateTimeToLocaleString(order.updated_at)}
          `}
              >
                {formatDateTimeToTimeString(order.created_at)}
              </span>
            </div>
          )
        })}
      </div>

      <div className='space-x-1'>
        <span className='font-semibold'>Not yet paid:</span>
        <Badge>
          <span>
            {formatCurrency(
              ordersFilterToPurchase.reduce((acc, order) => {
                return acc + order.quantity * order.dish_snapshot.price
              }, 0)
            )}
          </span>
        </Badge>
      </div>
      <div className='space-x-1'>
        <span className='font-semibold'>Paid:</span>
        <Badge variant={'outline'}>
          <span>
            {formatCurrency(
              purchasedOrderFilter.reduce((acc, order) => {
                return acc + order.quantity * order.dish_snapshot.price
              }, 0)
            )}
          </span>
        </Badge>
      </div>

      <div>
        <Button
          className='w-full'
          size={'sm'}
          variant={'secondary'}
          disabled={ordersFilterToPurchase.length === 0}
          onClick={pay}
        >
          Pay all ({ordersFilterToPurchase.length} orders)
        </Button>
      </div>
    </div>
  )
}
