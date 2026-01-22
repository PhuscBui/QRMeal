'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'
import { OrderStatus } from '@/constants/type'
import { CreditCard, Star, Building2 } from 'lucide-react'
import { formatCurrency, getOrderStatus } from '@/lib/utils'
import { useGuestGetOrderListQuery, useGuestMe } from '@/queries/useGuest'
import { useGetDishReviewsByMeQuery } from '@/queries/useDishReview'
import { PayOrdersResType, UpdateOrderResType } from '@/schemaValidations/order.schema'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { useAppContext } from '@/components/app-provider'
import DishReviewForm from '@/components/dish-review-form'
import ExistingReview from '@/components/existing-review'
import { useCreatePaymentLinkMutation } from '@/queries/usePayment'
import SepayPaymentDialog from '@/components/payment-qr-dialog'
import { useTranslations } from 'next-intl'

export default function OrdersCart() {
  const t = useTranslations('guestOrdersCart')
  const tCommon = useTranslations('common')

  // Payment method config
  const paymentMethodConfig = {
    banking: {
      label: t('bankTransfer'),
      icon: Building2
    }
  }
  const { data, refetch } = useGuestGetOrderListQuery()
  const [reviewingDish, setReviewingDish] = useState<{ id: string; name: string } | null>(null)
  const { data: userData } = useGuestMe()
  const user = userData?.payload.result ?? null
  const { data: dishReviewByUser } = useGetDishReviewsByMeQuery(Boolean(user?._id))

  // Payment states
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cash')
  const [paymentInfo, setPaymentInfo] = useState<{
    payment_id: string
    bank_name: string
    account_number: string
    account_name: string
    amount: number
    content: string
    qr_code_url: string
  } | null>(null)

  const createPaymentLinkMutation = useCreatePaymentLinkMutation()

  const orderGroups = useMemo(() => data?.payload.result ?? [], [data])
  const orders = useMemo(() => {
    return orderGroups.flatMap((orderGroup) =>
      orderGroup.orders.map((order) => ({
        ...order,
        order_group_id: orderGroup._id,
        table_number: orderGroup.table_number
      }))
    )
  }, [orderGroups])

  const { socket } = useAppContext()
  const { waitingForPaying, paid } = useMemo(() => {
    return orders.reduce(
      (result, order) => {
        if (
          order.status === OrderStatus.Delivered ||
          order.status === OrderStatus.Processing ||
          order.status === OrderStatus.Pending
        ) {
          return {
            ...result,
            waitingForPaying: {
              price: result.waitingForPaying.price + order.dish_snapshot.price * order.quantity,
              quantity: result.waitingForPaying.quantity + order.quantity
            }
          }
        }
        if (order.status === OrderStatus.Paid) {
          return {
            ...result,
            paid: {
              price: result.paid.price + order.dish_snapshot.price * order.quantity,
              quantity: result.paid.quantity + order.quantity
            }
          }
        }
        return result
      },
      {
        waitingForPaying: {
          price: 0,
          quantity: 0
        },
        paid: {
          price: 0,
          quantity: 0
        }
      }
    )
  }, [orders])

  // Get unpaid order groups
  const unpaidOrderGroups = useMemo(() => {
    return orderGroups.filter((group) => group.status !== OrderStatus.Paid && group.status !== OrderStatus.Cancelled)
  }, [orderGroups])

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

    function onPayment(data: PayOrdersResType['result']) {
      if (data.length > 0) {
        const orderGroup = data[0]
        const guestInfo = orderGroup.guest
        const totalOrders = data.reduce((sum, group) => sum + group.orders.length, 0)

        toast.success(t('paymentSuccessful'), {
          description: t('guestPaidForOrders', {
            name: guestInfo?.name ?? 'Guest',
            table: guestInfo?.table_number ?? 'N/A',
            count: totalOrders
          })
        })
      }
      refetch()
    }

    function onSepayPayment() {
      toast.success(t('paymentSuccessful'), {
        description: t('paymentPaidSuccessfully')
      })
      refetch()
    }

    socket?.on('update-order', onUpdateOrder)
    socket?.on('payment', onPayment)
    socket?.on('connect', onConnect)
    socket?.on('disconnect', onDisconnect)
    socket?.on('sepay-payment-success', onSepayPayment)

    return () => {
      socket?.off('connect', onConnect)
      socket?.off('disconnect', onDisconnect)
      socket?.off('update-order', onUpdateOrder)
      socket?.off('payment', onPayment)
      socket?.off('sepay-payment-success', onSepayPayment)
    }
  }, [refetch, socket, t, tCommon])

  const currentTable = orderGroups.length > 0 ? orderGroups[0].table_number : null

  const hasUserReview = (dishId: string) => {
    return dishReviewByUser?.payload.result.reviews.some((review) => review.dish_id === dishId) ?? false
  }

  // Open payment dialog
  const handleOpenPayment = () => {
    if (waitingForPaying.quantity === 0) {
      toast.error(t('noOrdersToPay'))
      return
    }
    setIsPayDialogOpen(true)
    setSelectedPaymentMethod('cash')
  }

  // Confirm payment
  const confirmPay = async () => {
    if (unpaidOrderGroups.length === 0) return

    // Nếu chọn chuyển khoản ngân hàng
    if (selectedPaymentMethod === 'banking') {
      try {
        const orderGroupIds = unpaidOrderGroups.map((group) => group._id)

        // Gọi API tạo payment link
        const result = await createPaymentLinkMutation.mutateAsync({
          order_group_ids: orderGroupIds,
          total_amount: waitingForPaying.price
        })

        // Set thông tin thanh toán và đóng dialog chọn phương thức
        setPaymentInfo({
          ...result.payload.result.payment_info,
          payment_id: result.payload.result.payment_id
        })

        setIsPayDialogOpen(false)
        // SepayPaymentDialog sẽ tự động mở
      } catch (error) {
        console.error('Error creating payment link:', error)
        toast.error(t('unableToCreatePaymentLink'))
      }
      return
    }
  }

  // Handle payment success for banking
  const handlePaymentSuccess = async () => {
    try {
      // Reset states
      setPaymentInfo(null)

      // Refetch orders to update status
      await refetch()

      toast.success(t('paymentSuccessful'))
    } catch (error) {
      console.error('Error after payment success:', error)
      toast.error(t('errorAfterPayment'))
    }
  }

  // Close dialogs
  const handleClosePayment = () => {
    setIsPayDialogOpen(false)
    setPaymentInfo(null)
  }

  return (
    <>
      {currentTable && (
        <div className='mb-4 p-3 rounded-lg'>
          <div className='text-sm font-semibold'>
            {t('table')}:{' '}
            <Badge variant='outline' className='ml-1'>
              {currentTable}
            </Badge>
          </div>
        </div>
      )}

      {orderGroups.map((orderGroup, groupIndex) => (
        <div key={orderGroup._id} className='mb-6'>
          <div className='text-sm font-medium text-gray-500 mb-3 border-b pb-2'>
            {t('orderGroup')} #{groupIndex + 1} • {new Date(orderGroup.created_at).toLocaleDateString('vi-VN')}
            <Badge variant='outline' className='ml-2'>
              {getOrderStatus(orderGroup.status)}
            </Badge>
          </div>

          {orderGroup.orders.map((order, orderIndex) => (
            <div key={order._id} className='mb-4'>
              <div className='flex gap-4 mb-3'>
                <div className='text-sm font-semibold'>{orderIndex + 1}</div>
                <div className='flex-shrink-0 relative'>
                  <Image
                    src={order.dish_snapshot.image || 'https://placehold.co/600x400'}
                    alt={order.dish_snapshot.name}
                    height={100}
                    width={100}
                    quality={100}
                    className='object-cover w-[80px] h-[80px] rounded-md'
                  />
                </div>
                <div className='space-y-1 flex-1'>
                  <h3 className='text-sm font-medium'>{order.dish_snapshot.name}</h3>
                  <div className='text-xs font-semibold'>
                    {formatCurrency(order.dish_snapshot.price)} x <Badge className='px-1'>{order.quantity}</Badge>
                  </div>
                  <div className='text-xs text-gray-500'>
                    {t('total')}: {formatCurrency(order.dish_snapshot.price * order.quantity)}
                  </div>
                </div>
                <div className='flex-shrink-0 ml-auto flex flex-col justify-center items-end gap-2'>
                  <Badge variant={order.status === OrderStatus.Paid ? 'default' : 'outline'}>
                    {getOrderStatus(order.status)}
                  </Badge>

                  {order.status === OrderStatus.Paid &&
                    order.dish_snapshot.dish_id &&
                    !hasUserReview(order.dish_snapshot.dish_id) && (
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() =>
                          setReviewingDish({
                            id: order.dish_snapshot.dish_id ?? '',
                            name: order.dish_snapshot.name
                          })
                        }
                        className='text-xs px-2 py-1 h-auto'
                      >
                        <Star size={12} className='mr-1' />
                        {t('rate')}
                      </Button>
                    )}
                </div>
              </div>

              {order.status === OrderStatus.Paid && (
                <ExistingReview dishId={order.dish_snapshot.dish_id ?? ''} userId={user?._id} />
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Thông tin thanh toán */}
      <div className='sticky bottom-0 border-t pt-4 space-y-2'>
        {paid.quantity > 0 && (
          <div className='w-full flex justify-between text-green-600 font-semibold'>
            <span>
              {t('paid')} • {paid.quantity} {paid.quantity === 1 ? t('item') : t('items')}
            </span>
            <span>{formatCurrency(paid.price)}</span>
          </div>
        )}

        {waitingForPaying.quantity > 0 && (
          <>
            <div className='w-full flex justify-between text-xl font-bold text-orange-600'>
              <span>
                {t('waitingForPayment')} • {waitingForPaying.quantity}{' '}
                {waitingForPaying.quantity === 1 ? t('item') : t('items')}
              </span>
              <span>{formatCurrency(waitingForPaying.price)}</span>
            </div>

            {/* Payment Button */}
            <Button className='w-full mt-2' size='lg' onClick={handleOpenPayment}>
              <CreditCard className='h-5 w-5 mr-2' />
              {t('payNow')}
            </Button>
          </>
        )}

        {orders.length === 0 && <div className='text-center text-gray-500 py-8'>{t('noOrders')}</div>}
      </div>

      {/* Modal đánh giá */}
      {reviewingDish && (
        <DishReviewForm
          dishId={reviewingDish.id}
          dishName={reviewingDish.name}
          onClose={() => setReviewingDish(null)}
        />
      )}

      {/* Dialog chọn phương thức thanh toán */}
      <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <CreditCard className='h-5 w-5' />
              {t('choosePaymentMethod')}
            </DialogTitle>
            <DialogDescription>{t('payForDishes', { count: waitingForPaying.quantity })}</DialogDescription>
          </DialogHeader>

          <div className='space-y-6'>
            {/* Tóm tắt thanh toán */}
            <div className='bg-muted p-4 rounded-lg space-y-3'>
              <h4 className='font-medium text-sm'>{t('paymentDetails')}</h4>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span>{t('numberOfDishes')}:</span>
                  <span>
                    {waitingForPaying.quantity} {t('dishes')}
                  </span>
                </div>
                <div className='border-t pt-2 mt-2'>
                  <div className='flex justify-between items-center font-semibold text-base'>
                    <span>{t('total')}:</span>
                    <span className='text-lg text-primary'>{formatCurrency(waitingForPaying.price)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Choose payment method */}
            <div>
              <h4 className='font-medium text-sm mb-3'>{t('choosePaymentMethod')}</h4>
              <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                {Object.entries(paymentMethodConfig).map(([key, info]) => {
                  const IconComp = info.icon
                  return (
                    <label
                      key={key}
                      className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPaymentMethod === key ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      } `}
                    >
                      <RadioGroupItem value={key} className='mt-1' />
                      <div className='flex items-start gap-3 flex-1'>
                        <IconComp className='h-5 w-5 mt-0.5 text-muted-foreground' />
                        <div className='space-y-1'>
                          <p className='font-medium text-sm'>{info.label}</p>
                        </div>
                      </div>
                    </label>
                  )
                })}
              </RadioGroup>
            </div>

            {/* Buttons */}
            <div className='flex gap-3'>
              <Button variant='outline' onClick={handleClosePayment} className='flex-1'>
                {tCommon('cancel')}
              </Button>
              <Button onClick={confirmPay} className='flex-1'>
                <CreditCard className='h-4 w-4 mr-2' />
                {t('confirmPayment')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog QR thanh toán */}
      <SepayPaymentDialog
        open={!!paymentInfo}
        onOpenChange={(open) => {
          if (!open) {
            handleClosePayment()
          }
        }}
        paymentInfo={paymentInfo}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  )
}
