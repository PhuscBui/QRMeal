import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
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
import { useCustomerUsedPromotionMutation, useGetCustomerPromotionQuery } from '@/queries/useCustomerPromotion'
import { useGetGuestPromotionQuery, useUsedPromotionMutation } from '@/queries/useGuestPromotion'
import { useGetLoyaltyQuery } from '@/queries/useLoyalty'
import { usePayOrderMutation } from '@/queries/useOrder'
import { usePromotionListQuery } from '@/queries/usePromotion'
import { useCreateRevenueMutation } from '@/queries/useRevenue'
import { useCreatePaymentLinkMutation } from '@/queries/usePayment'
import { CustomerPromotionResType } from '@/schemaValidations/customer-promotion.schema'
import { GuestPromotionResType } from '@/schemaValidations/guest-promotion.schema'
import { GetOrdersResType, PayOrdersResType } from '@/schemaValidations/order.schema'
import { PromotionResType } from '@/schemaValidations/promotion.schema'
import { Check, X, CreditCard, Wallet, Building2, Smartphone } from 'lucide-react'
import Image from 'next/image'
import { Fragment, useMemo, useState } from 'react'
import { toast } from 'sonner'
import SepayPaymentDialog from '@/components/payment-qr-dialog'

// Payment method config
const paymentMethodConfig = {
  cash: {
    label: 'Tiền mặt',
    icon: Wallet
  },
  banking: {
    label: 'Chuyển khoản ngân hàng',
    icon: Building2
  },
  momo: {
    label: 'Ví MoMo',
    icon: Smartphone
  }
}

// Updated types to work with OrderGroup structure
type GuestOrCustomer = GetOrdersResType['result'][0]['guest'] | GetOrdersResType['result'][0]['customer']
type OrderGroups = GetOrdersResType['result']
type CustomerOrGuestPromotion = CustomerPromotionResType['result'] | GuestPromotionResType['result']

export default function OrderDetail({
  user,
  orders: orderGroups,
  onPaySuccess,
  orderType
}: {
  user: GuestOrCustomer
  orders: OrderGroups
  onPaySuccess?: (data: PayOrdersResType) => void
  orderType?: 'dine-in' | 'takeaway' | 'delivery'
}) {
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

  const isCustomer = user && 'role' in user && user.role === 'Customer'

  const { data } = useGetLoyaltyQuery({ customerId: user?._id as string, enabled: Boolean(isCustomer && user) })
  const loyaltyPoints = data?.payload.result.loyalty_points || 0
  const userVisits = data?.payload.result.visit_count || 0
  const [isBankingPaymentInProgress, setIsBankingPaymentInProgress] = useState(false)

  const purchasedOrderFilter = user ? allOrders.filter((order) => order.status === OrderStatus.Paid) : []

  const payOrderMutation = usePayOrderMutation()
  const createRevenueMutation = useCreateRevenueMutation()
  const promotionListQuery = usePromotionListQuery()

  const promotions = useMemo(() => promotionListQuery.data?.payload.result ?? [], [promotionListQuery.data])

  const updateGuestUsedPromotionMutation = useUsedPromotionMutation()
  const updateCustomerUsedPromotionMutation = useCustomerUsedPromotionMutation()

  const guestPromotionResult = useGetGuestPromotionQuery({
    enabled: Boolean(user && !isCustomer),
    guestId: user?._id as string
  })

  const customerPromotionResult = useGetCustomerPromotionQuery({
    enabled: Boolean(user && isCustomer),
    customerId: user?._id as string
  })

  const userPromotions = useMemo(() => {
    if (isCustomer) {
      return (customerPromotionResult.data?.payload.result ?? []) as Array<CustomerOrGuestPromotion>
    }
    return guestPromotionResult.data?.payload.result ?? []
  }, [customerPromotionResult.data?.payload.result, guestPromotionResult.data?.payload.result, isCustomer])

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
    return calculateFinalAmount(price, promotion, loyaltyPoints, dishItems, userVisits, orderType)
  }

  const calculateTotalDiscountValue = (price: number, promotion: PromotionResType['result'][]) => {
    return calculateTotalDiscount(promotion, price, loyaltyPoints, dishItems, userVisits, orderType)
  }

  // Get unpaid order groups
  const unpaidOrderGroups = useMemo(() => {
    return orderGroups.filter((group) => group.status !== OrderStatus.Paid && group.status !== OrderStatus.Cancelled)
  }, [orderGroups])

  // Open payment dialog
  const handleOpenPayment = () => {
    if (ordersFilterToPurchase.length === 0) {
      toast.error('No orders to pay')
      return
    }
    setIsPayDialogOpen(true)
    setSelectedPaymentMethod('cash')
  }

  const confirmPayment = async () => {
    if (!user) return

    switch (selectedPaymentMethod) {
      case 'banking':
        await handleBankingPayment()
        break
      case 'cash':
      case 'momo':
        await pay()
        break
      default:
        toast.error('Please select a payment method')
    }
  }

  const handleBankingPayment = async () => {
    try {
      setIsBankingPaymentInProgress(true)
      const orderGroupIds = unpaidOrderGroups.map((group) => group._id)
      const { finalAmount } = calculateTotalAmount(
        ordersFilterToPurchase.reduce((acc, order) => acc + order.quantity * order.dish_snapshot.price, 0),
        usePromotions
      )

      const result = await createPaymentLinkMutation.mutateAsync({
        order_group_ids: orderGroupIds,
        total_amount: finalAmount
      })

      setPaymentInfo({
        ...result.payload.result.payment_info,
        payment_id: result.payload.result.payment_id
      })

      setIsPayDialogOpen(false)
    } catch (error) {
      console.error('Error creating payment link:', error)
      toast.error('Unable to create payment link. Please try again!')
    } finally {
      setIsBankingPaymentInProgress(false)
    }
  }

  const pay = async () => {
    if (selectedPaymentMethod === 'banking' || isBankingPaymentInProgress) return
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

      const { finalAmount: total_amount, promotionsApplied: usedPromotions } = calculateTotalAmount(
        ordersFilterToPurchase.reduce((acc, order) => {
          return acc + order.quantity * order.dish_snapshot.price
        }, 0),
        usePromotions
      )

      await Promise.all([
        isCustomer
          ? createRevenueMutation.mutateAsync({
              customer_id: user._id,
              total_amount
            })
          : createRevenueMutation.mutateAsync({
              guest_id: user._id,
              guest_phone: user.phone,
              total_amount
            }),
        isCustomer
          ? await Promise.all(
              usedPromotions.map((promotion) =>
                updateCustomerUsedPromotionMutation.mutateAsync({
                  customer_id: user._id,
                  promotion_id: promotion,
                  order_group_ids: orderGroups.map((group) => group._id)
                })
              )
            )
          : await Promise.all(
              usedPromotions.map((promotion) =>
                updateGuestUsedPromotionMutation.mutateAsync({
                  guest_id: user._id,
                  promotion_id: promotion
                })
              )
            )
      ])

      setIsPayDialogOpen(false)
    } catch (error) {
      handleErrorApi({
        error
      })
    }
  }

  // Handle payment success for banking
  const handlePaymentSuccess = async () => {
    if (!user) return

    try {
      const is_customer = 'role' in user && user.role === 'Customer'
      let result = null

      // Gọi API để xác nhận thanh toán
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

      if (onPaySuccess) {
        onPaySuccess(result.payload)
      }

      const { finalAmount: total_amount, promotionsApplied: usedPromotions } = calculateTotalAmount(
        ordersFilterToPurchase.reduce((acc, order) => {
          return acc + order.quantity * order.dish_snapshot.price
        }, 0),
        usePromotions
      )

      // Create revenue và update promotions
      await Promise.all([
        isCustomer
          ? createRevenueMutation.mutateAsync({
              customer_id: user._id,
              total_amount
            })
          : createRevenueMutation.mutateAsync({
              guest_id: user._id,
              guest_phone: user.phone,
              total_amount
            }),
        isCustomer
          ? await Promise.all(
              usedPromotions.map((promotion) =>
                updateCustomerUsedPromotionMutation.mutateAsync({
                  customer_id: user._id,
                  promotion_id: promotion,
                  order_group_ids: orderGroups.map((group) => group._id)
                })
              )
            )
          : await Promise.all(
              usedPromotions.map((promotion) =>
                updateGuestUsedPromotionMutation.mutateAsync({
                  guest_id: user._id,
                  promotion_id: promotion
                })
              )
            )
      ])

      // Reset states
      setPaymentInfo(null)

      toast.success('Payment successful!')
    } catch (error) {
      console.error('Error after payment success:', error)
      toast.error('An error occurred after payment. Please try again!')
    }
  }

  // Close dialogs
  const handleClosePayment = () => {
    setIsPayDialogOpen(false)
    setPaymentInfo(null)
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

  const totalAmount = ordersFilterToPurchase.reduce((acc, order) => {
    return acc + order.quantity * order.dish_snapshot.price
  }, 0)

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
          <span>{formatCurrency(totalAmount)}</span>
        </Badge>

        {orderType === 'delivery' && (
          <Badge variant={'outline'}>
            <span>+ Shipping Fee: {formatCurrency(15000)}</span>
          </Badge>
        )}

        {usePromotions.length > 0 && (
          <Badge variant={'outline'}>
            <span>- {formatCurrency(calculateTotalDiscountValue(totalAmount, usePromotions).discount)}</span>
          </Badge>
        )}
      </div>

      <div className='space-x-1'>
        <span className='font-semibold'>Total After Discount:</span>
        <Badge variant={'default'}>
          <span>{formatCurrency(calculateTotalAmount(totalAmount, usePromotions).finalAmount)}</span>
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
          onClick={handleOpenPayment}
        >
          <CreditCard className='mr-2 h-4 w-4' />
          Pay all ({ordersFilterToPurchase.length} unpaid orders)
        </Button>
      </div>

      {/* Dialog chọn phương thức thanh toán */}
      <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <CreditCard className='h-5 w-5' />
              Payment Method
            </DialogTitle>
            <DialogDescription>Payment for {ordersFilterToPurchase.length} dishes</DialogDescription>
          </DialogHeader>

          <div className='space-y-6'>
            {/* Tóm tắt thanh toán */}
            <div className='bg-muted p-4 rounded-lg space-y-3'>
              <h4 className='font-medium text-sm'>Payment detail</h4>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span>Total:</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                {usePromotions.length > 0 && (
                  <div className='flex justify-between text-green-600'>
                    <span>Discount:</span>
                    <span>-{formatCurrency(calculateTotalDiscountValue(totalAmount, usePromotions).discount)}</span>
                  </div>
                )}
                <div className='border-t pt-2 mt-2'>
                  <div className='flex justify-between items-center font-semibold text-base'>
                    <span>Total Payment:</span>
                    <span className='text-lg text-primary'>
                      {formatCurrency(calculateTotalAmount(totalAmount, usePromotions).finalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chọn phương thức thanh toán */}
            <div>
              <h4 className='font-medium text-sm mb-3'>Select Payment Method</h4>
              <RadioGroup
                value={selectedPaymentMethod}
                onValueChange={setSelectedPaymentMethod}
                disabled={payOrderMutation.isPending}
              >
                {Object.entries(paymentMethodConfig).map(([key, info]) => {
                  const IconComp = info.icon
                  return (
                    <label
                      key={key}
                      className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPaymentMethod === key ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      } ${payOrderMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              <Button
                variant='outline'
                onClick={handleClosePayment}
                className='flex-1'
                disabled={payOrderMutation.isPending}
              >
                Hủy
              </Button>
              <Button onClick={confirmPayment} className='flex-1' disabled={payOrderMutation.isPending}>
                {payOrderMutation.isPending ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className='h-4 w-4 mr-2' />
                    Confirm Payment
                  </>
                )}
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
    </div>
  )
}
