import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { OrderStatus } from '@/constants/type'
import { calculateFinalAmount, calculateTotalDiscount } from '@/lib/promotion-utils'
import {
  OrderStatusIcon,
  formatCurrency,
  formatDateTimeToLocaleString,
  formatDateTimeToTimeString,
  getOrderStatus,
  handleErrorApi
} from '@/lib/utils'
import { useGetCustomerPromotionQuery } from '@/queries/useCustomerPromotion'
import { useGetGuestPromotionQuery, useUsedPromotionMutation } from '@/queries/useGuestPromotion'
import { useGetLoyaltyQuery } from '@/queries/useLoyalty'
import { usePayOrderMutation } from '@/queries/useOrder'
import { usePromotionListQuery } from '@/queries/usePromotion'
import { useCreateRevenueMutation } from '@/queries/useRevenue'
import { CustomerPromotionResType } from '@/schemaValidations/customer-promotion.schema'
import { GuestPromotionResType } from '@/schemaValidations/guest-promotion.schema'
import { GetOrdersResType, PayOrdersResType } from '@/schemaValidations/order.schema'
import { PromotionResType } from '@/schemaValidations/promotion.schema'
import { Check, X } from 'lucide-react'
import Image from 'next/image'
import { Fragment, useMemo } from 'react'
import { toast } from 'sonner'

// Updated types to work with OrderGroup structure
type GuestOrCustomer = GetOrdersResType['result'][0]['guest'] | GetOrdersResType['result'][0]['customer']
type OrderGroups = GetOrdersResType['result']
type CustomerOrGuestPromotion = CustomerPromotionResType['result'] | GuestPromotionResType['result']

export default function OrderDetail({
  user,
  orders: orderGroups,
  onPaySuccess
}: {
  user: GuestOrCustomer
  orders: OrderGroups
  onPaySuccess?: (data: PayOrdersResType) => void
}) {
  // Flatten all orders from all order groups
  const allOrders = useMemo(() => {
    return orderGroups.flatMap((orderGroup) => orderGroup.orders)
  }, [orderGroups])

  const ordersFilterToPurchase = useMemo(() => {
    return user
      ? allOrders.filter((order) => order.status !== OrderStatus.Paid && order.status !== OrderStatus.Cancelled)
      : []
  }, [user, allOrders])

  const dishItems = useMemo(() => {
    return allOrders
      .map((order) => ({
        id: order.dish_snapshot.dish_id,
        price: order.dish_snapshot.price
      }))
      .filter((item) => typeof item.id === 'string' && item.id !== null) as { id: string; price: number }[]
  }, [allOrders])

  const { data } = useGetLoyaltyQuery({ customerId: user?._id as string, enabled: Boolean(user) })
  const loyaltyPoints = data?.payload.result.loyalty_points || 0
  const userVisits = data?.payload.result.visit_count || 0

  const purchasedOrderFilter = user ? allOrders.filter((order) => order.status === OrderStatus.Paid) : []

  const payOrderMutation = usePayOrderMutation()
  const createRevenueMutation = useCreateRevenueMutation()
  const promotionListQuery = usePromotionListQuery()

  const promotions = useMemo(() => promotionListQuery.data?.payload.result ?? [], [promotionListQuery.data])

  const updateGuestUsedPromotionMutation = useUsedPromotionMutation()

  const guestPromotionResult = useGetGuestPromotionQuery({
    enabled: Boolean(user),
    guestId: user?._id as string
  })

  const customerPromotionResult = useGetCustomerPromotionQuery({
    enabled: Boolean(user),
    customerId: user?._id as string
  })

  const userPromotions = useMemo(() => {
    if (user && 'role' in user && user.role === 'Customer') {
      return (customerPromotionResult.data?.payload.result ?? []) as Array<CustomerOrGuestPromotion>
    }
    return guestPromotionResult.data?.payload.result ?? []
  }, [customerPromotionResult.data?.payload.result, guestPromotionResult.data?.payload.result, user])

  const usePromotionIds = useMemo(() => {
    const usePromotions = Array.isArray(userPromotions)
      ? userPromotions.filter(
          (promotion: CustomerOrGuestPromotion) => typeof promotion.used === 'boolean' && promotion.used === false
        )
      : []
    return usePromotions.map((promotion: CustomerOrGuestPromotion) => promotion.promotion_id)
  }, [userPromotions])

  const usePromotions = useMemo(() => {
    return promotions.filter((promotion) => usePromotionIds.includes(promotion._id))
  }, [promotions, usePromotionIds])

  const calculateTotalAmount = (price: number, promotion: PromotionResType['result'][]) => {
    return calculateFinalAmount(price, promotion, loyaltyPoints, dishItems, userVisits)
  }

  const calculateTotalDiscountValue = (price: number, promotion: PromotionResType['result'][]) => {
    return calculateTotalDiscount(promotion, price, loyaltyPoints, dishItems, userVisits)
  }

  const pay = async () => {
    if (payOrderMutation.isPending || !user) return
    try {
      const is_customer = 'role' in user && user.role === 'Customer'
      let result = null
      if (is_customer) {
        result = await payOrderMutation.mutateAsync({
          customer_id: user._id,
          is_customer
        })
      } else {
        result = await payOrderMutation.mutateAsync({
          guest_id: user._id,
          is_customer
        })
      }

      toast.success(result.payload.message)

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
          guest_id: user._id,
          guest_phone: user.phone,
          total_amount: total_amount
        }),
        await Promise.all(
          usePromotions.map((promotion) =>
            updateGuestUsedPromotionMutation.mutateAsync({
              guest_id: user._id,
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
          Order Group #{groupIndex + 1}
          <Badge variant='outline' className='ml-2'>
            {getOrderStatus(orderGroup.status)}
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
            <span title={getOrderStatus(order.status)}>
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
      {user && (
        <Fragment>
          <div className='space-x-1'>
            <span className='font-semibold'>Name:</span>
            <span>{user.name}</span>
            <span className='font-semibold'>(#{user._id})</span>
            {'role' in user && user.role === 'Customer' && <Badge variant='secondary'>Customer</Badge>}
            <span>|</span>
            <span className='font-semibold'>Table:</span>
            <span>{'table_number' in user ? user.table_number : orderGroups[0]?.table_number ?? 'N/A'}</span>
          </div>
          <div className='space-x-1'>
            <span className='font-semibold'>Phone:</span>
            <span>{user.phone}</span>
          </div>
          <div className='space-x-1'>
            <span className='font-semibold'>Create at:</span>
            <span>{formatDateTimeToLocaleString(user.created_at)}</span>
          </div>
          {'email' in user && (
            <div className='space-x-1'>
              <span className='font-semibold'>Email:</span>
              <span>{user.email}</span>
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
              {formatCurrency(
                calculateTotalDiscountValue(
                  ordersFilterToPurchase.reduce((acc, order) => {
                    return acc + order.quantity * order.dish_snapshot.price
                  }, 0),
                  usePromotions
                )
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
