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
import { usePayForGuestMutation } from '@/queries/useOrder'
import { usePromotionListQuery } from '@/queries/usePromotion'
import { useCreateRevenueMutation } from '@/queries/useRevenue'
import { useCancelReservationMutation, useGetTableQuery } from '@/queries/useTable'
import { GuestPromotion, GuestPromotionResType } from '@/schemaValidations/guest-promotion.schema'
import { GetOrdersResType, PayGuestOrdersResType } from '@/schemaValidations/order.schema'
import { PromotionResType } from '@/schemaValidations/promotion.schema'
import { Check, X } from 'lucide-react'
import Image from 'next/image'
import { Fragment, useMemo } from 'react'

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

  const cancelReservation = useCancelReservationMutation()
  const table = useGetTableQuery({ id: guest?.table_number as number, enabled: Boolean(guest?.table_number) })
  const guestloyalty = useGetGuestLoyaltyQuery({
    guestPhone: guest?.phone || '',
    enabled: Boolean(guest?.phone)
  })
  const updateLoyalty = useUpdateGuestLoyaltyMutation()

  const purchasedOrderFilter = guest ? orders.filter((order) => order.status === OrderStatus.Paid) : []
  console.log('ordersFilterToPurchase', purchasedOrderFilter)
  const payForGuestMutation = usePayForGuestMutation()
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
    if (payForGuestMutation.isPending || !guest) return
    try {
      const result = await payForGuestMutation.mutateAsync({
        guestId: guest._id
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
          table_number: table.data?.payload.result?.number as number,
          guest_id: guest._id
        }),
        updateLoyalty.mutateAsync({
          guestPhone: guest.phone,
          total_spend: (guestloyalty.data?.payload.result?.total_spend || 0) + total_amount,
          loyalty_points: (guestloyalty.data?.payload.result?.loyalty_points || 0) + Math.floor(total_amount / 10000),
          visit_count: (guestloyalty.data?.payload.result?.visit_count || 0) + 1
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
        <span className='font-semibold'>Paid:</span>
        <Badge variant={'outline'}>
          <span>
            {purchasedOrderFilter.reduce((acc, order) => {
              return acc + order.quantity * order.dish_snapshot.price
            }, 0) > 0 ? (
              <span className='flex items-center'>
                <Check className='mr-2 h-4 w-4' /> Payment Complete
              </span>
            ) : (
              <span className='flex items-center'>
                <X className='mr-2 h-4 w-4' /> Payment Not Complete
              </span>
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
