import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { OrderStatus, PromotionType } from '@/constants/type'
import {
  OrderStatusIcon,
  calculateDiscount,
  formatCurrency,
  formatDateTimeToLocaleString,
  formatDateTimeToTimeString,
  getVietnameseOrderStatus,
  handleErrorApi
} from '@/lib/utils'
import { useGetGuestLoyaltyQuery, useUpdateGuestLoyaltyMutation } from '@/queries/useGuestLoyalty'
import { useGetGuestPromotionQuery, useUsedPromotionMutation } from '@/queries/useGuestPromotion'
import { usePayOrderMutation } from '@/queries/useOrder'
import { usePromotionListQuery } from '@/queries/usePromotion'
import { useCreateRevenueMutation } from '@/queries/useRevenue'
import { useCancelReservationMutation, useGetTableQuery } from '@/queries/useTable'
import { GuestPromotion, GuestPromotionResType } from '@/schemaValidations/guest-promotion.schema'
import { GetOrdersResType, PayOrdersResType } from '@/schemaValidations/order.schema'
import { PromotionResType } from '@/schemaValidations/promotion.schema'
import { Check, X } from 'lucide-react'
import Image from 'next/image'
import { Fragment, useMemo } from 'react'

// Updated types to work with OrderGroup structure
type GuestOrCustomer = GetOrdersResType['result'][0]['guest'] | GetOrdersResType['result'][0]['customer']
type OrderGroups = GetOrdersResType['result']
// type IndividualOrder = GetOrdersResType['result'][0]['orders'][0]

export default function OrderDetail({
  guest,
  orders: orderGroups,
  onPaySuccess
}: {
  guest: GuestOrCustomer
  orders: OrderGroups
  onPaySuccess?: (data: PayOrdersResType) => void
}) {
  // Flatten all orders from all order groups
  const allOrders = useMemo(() => {
    return orderGroups.flatMap((orderGroup) => orderGroup.orders)
  }, [orderGroups])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ordersFilterToPurchase = guest
    ? allOrders.filter((order) => order.status !== OrderStatus.Paid && order.status !== OrderStatus.Cancelled)
    : []

  const cancelReservation = useCancelReservationMutation()
  const table = useGetTableQuery({
    id: orderGroups[0]?.table_number as number,
    enabled: Boolean(orderGroups[0]?.table_number)
  })

  const guestLoyalty = useGetGuestLoyaltyQuery({
    guestPhone: guest?.phone || '',
    enabled: Boolean(guest?.phone)
  })
  const updateLoyalty = useUpdateGuestLoyaltyMutation()

  const purchasedOrderFilter = guest ? allOrders.filter((order) => order.status === OrderStatus.Paid) : []

  const payOrderMutation = usePayOrderMutation()
  const createRevenueMutation = useCreateRevenueMutation()
  const promotionListQuery = usePromotionListQuery()

  const promotions = useMemo(() => promotionListQuery.data?.payload.result ?? [], [promotionListQuery.data])

  const updateGuestUsedPromotionMutation = useUsedPromotionMutation()

  const { data: guestPromotionResult } = useGetGuestPromotionQuery({
    enabled: Boolean(guest),
    guestId: guest?._id as string
  })

  const guestPromotions = useMemo(
    () => (guestPromotionResult?.payload.result ?? []) as Array<GuestPromotion>,
    [guestPromotionResult]
  )

  const usePromotionIds = useMemo(() => {
    const usePromotions = guestPromotions.filter(
      (promotion: GuestPromotionResType['result']) => promotion.used === false
    )
    return usePromotions.map((promotion) => promotion.promotion_id)
  }, [guestPromotions])

  const usePromotions = useMemo(() => {
    return promotions.filter((promotion) => usePromotionIds.includes(promotion._id))
  }, [promotions, usePromotionIds])

  const minPrice = useMemo(() => {
    return ordersFilterToPurchase.reduce((min, order) => {
      return Math.min(min, order.dish_snapshot.price)
    }, Infinity)
  }, [ordersFilterToPurchase])

  const calculateTotalAmount = (price: number, promotion: PromotionResType['result'][]) => {
    if (promotion.length === 0) return price

    const totalDiscount = promotion.reduce((acc, promotion) => {
      if (promotion.discount_type === PromotionType.FreeItem) {
        // For free item promotions, find the cheapest item in the order
        const cheapestItem = ordersFilterToPurchase.reduce((min, order) => {
          const itemPrice = order.dish_snapshot.price
          return itemPrice < min ? itemPrice : min
        }, Infinity)
        return acc + cheapestItem
      }
      return acc + calculateDiscount(promotion, price)
    }, 0)

    return price - totalDiscount
  }

  const pay = async () => {
    if (payOrderMutation.isPending || !guest) return
    try {
      const result = await payOrderMutation.mutateAsync({
        guest_id: guest._id,
        is_customer: 'role' in guest && guest.role === 'customer'
      })
      if (onPaySuccess) {
        onPaySuccess(result.payload)
      }

      const total_amount = calculateTotalAmount(
        ordersFilterToPurchase.reduce((acc, order) => {
          return acc + order.quantity * order.dish_snapshot.price
        }, 0),
        usePromotions
      )

      await Promise.all([
        createRevenueMutation.mutateAsync({
          guest_id: guest._id,
          guest_phone: guest.phone,
          total_amount: total_amount
        }),
        cancelReservation.mutateAsync({
          token: table.data?.payload.result?.token || '',
          table_number: table.data?.payload.result?.number as number
        }),
        updateLoyalty.mutateAsync({
          guestPhone: guest.phone,
          total_spend: (guestLoyalty.data?.payload.result?.total_spend || 0) + total_amount,
          loyalty_points: (guestLoyalty.data?.payload.result?.loyalty_points || 0) + Math.floor(total_amount / 10000),
          visit_count: (guestLoyalty.data?.payload.result?.visit_count || 0) + 1
        }),
        await Promise.all(
          usePromotions.map((promotion) =>
            updateGuestUsedPromotionMutation.mutateAsync({
              guest_id: guest._id,
              promotion_id: promotion._id
            })
          )
        )
      ])
    } catch (error) {
      handleErrorApi({
        error
      })
    }
  }

  // Group orders by order group for better display
  const renderOrdersByGroup = () => {
    return orderGroups.map((orderGroup, groupIndex) => (
      <div key={orderGroup._id} className='space-y-1'>
        <div className='font-medium text-xs text-gray-600'>
          Order Group #{groupIndex + 1} - {orderGroup.order_type}
          <Badge variant='outline' className='ml-2'>
            {getVietnameseOrderStatus(orderGroup.status)}
          </Badge>
          {orderGroup.delivery && (
            <Badge variant='secondary' className='ml-1'>
              Delivery
            </Badge>
          )}
        </div>
        {orderGroup.orders.map((order, orderIndex) => (
          <div key={order._id} className='flex gap-2 items-center text-xs pl-4'>
            <span className='w-[15px]'>
              {groupIndex + 1}.{orderIndex + 1}
            </span>
            <span title={getVietnameseOrderStatus(order.status)}>
              {order.status === OrderStatus.Pending && <OrderStatusIcon.Pending className='w-4 h-4' />}
              {order.status === OrderStatus.Processing && <OrderStatusIcon.Processing className='w-4 h-4' />}
              {order.status === OrderStatus.Cancelled && <OrderStatusIcon.Cancelled className='w-4 h-4 text-red-400' />}
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
        ))}
        {orderGroup.delivery && (
          <div className='pl-4 text-xs text-gray-600'>
            <div>📍 {orderGroup.delivery.address}</div>
            <div>
              📞 {orderGroup.delivery.receiver_name} - {orderGroup.delivery.receiver_phone}
            </div>
            {orderGroup.delivery.shipper_info && <div>🚴 {orderGroup.delivery.shipper_info}</div>}
          </div>
        )}
      </div>
    ))
  }

  return (
    <div className='space-y-2 text-sm'>
      {guest && (
        <Fragment>
          <div className='space-x-1'>
            <span className='font-semibold'>Name:</span>
            <span>{guest.name}</span>
            <span className='font-semibold'>(#{guest._id})</span>
            {'role' in guest && guest.role === 'customer' && <Badge variant='secondary'>Customer</Badge>}
            <span>|</span>
            <span className='font-semibold'>Table:</span>
            <span>{'table_number' in guest ? guest.table_number : orderGroups[0]?.table_number ?? 'N/A'}</span>
          </div>
          <div className='space-x-1'>
            <span className='font-semibold'>Phone:</span>
            <span>{guest.phone}</span>
          </div>
          <div className='space-x-1'>
            <span className='font-semibold'>Create at:</span>
            <span>{formatDateTimeToLocaleString(guest.created_at)}</span>
          </div>
          {'email' in guest && (
            <div className='space-x-1'>
              <span className='font-semibold'>Email:</span>
              <span>{guest.email}</span>
            </div>
          )}
        </Fragment>
      )}

      <div className='space-y-1'>
        <div className='font-semibold'>Order Groups ({orderGroups.length}):</div>
        {renderOrdersByGroup()}
      </div>

      <div className='space-x-1'>
        <span className='font-semibold'>Total Orders:</span>
        <Badge variant='outline'>{allOrders.length} orders</Badge>
      </div>

      <div className='space-x-1'>
        <span className='font-semibold'>Promotion:</span>
        {usePromotions.length > 0 ? (
          usePromotions.map((promotion) => {
            return (
              <Badge key={promotion._id} variant={'outline'}>
                <span>{promotion.name}</span>
              </Badge>
            )
          })
        ) : (
          <Badge variant={'outline'}>No promotion</Badge>
        )}
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

        {usePromotions.length > 0 && (
          <Badge variant={'outline'}>
            <span>
              -
              {formatCurrency(
                usePromotions.reduce((acc, promotion) => {
                  return (
                    acc +
                    calculateDiscount(
                      promotion,
                      ordersFilterToPurchase.reduce((acc, order) => {
                        return acc + order.quantity * order.dish_snapshot.price
                      }, 0),
                      minPrice
                    )
                  )
                }, 0)
              )}
            </span>
          </Badge>
        )}
      </div>

      <div className='space-x-1'>
        <span className='font-semibold'>Total After Discount:</span>
        <Badge variant={'default'}>
          <span>
            {formatCurrency(
              calculateTotalAmount(
                ordersFilterToPurchase.reduce((acc, order) => {
                  return acc + order.quantity * order.dish_snapshot.price
                }, 0),
                usePromotions
              )
            )}
          </span>
        </Badge>
      </div>

      <div className='space-x-1'>
        <span className='font-semibold'>Payment Status:</span>
        <Badge variant={'outline'}>
          {purchasedOrderFilter.length > 0 && ordersFilterToPurchase.length === 0 ? (
            <span className='flex items-center'>
              <Check className='mr-2 h-4 w-4 text-green-500' /> Payment Complete
            </span>
          ) : (
            <span className='flex items-center'>
              <X className='mr-2 h-4 w-4 text-red-500' /> Payment Pending
              {purchasedOrderFilter.length > 0 && <span className='ml-1'>({purchasedOrderFilter.length} paid)</span>}
            </span>
          )}
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
          Pay all ({ordersFilterToPurchase.length} unpaid orders)
        </Button>
      </div>
    </div>
  )
}
