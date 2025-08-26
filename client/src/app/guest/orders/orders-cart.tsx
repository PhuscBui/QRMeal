'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { OrderStatus } from '@/constants/type'
import { Star } from 'lucide-react'
import { useState } from 'react'

import { formatCurrency, getVietnameseOrderStatus } from '@/lib/utils'
import { useGuestGetOrderListQuery } from '@/queries/useGuest'
import {
  useAddDishReviewMutation,
  useDishReviewListQuery,
  useGetDishReviewsByGuestQuery
} from '@/queries/useDishReview'
import { PayOrdersResType, UpdateOrderResType } from '@/schemaValidations/order.schema'
import Image from 'next/image'
import { useEffect, useMemo } from 'react'
import { useAppContext } from '@/components/app-provider'

// Component đánh giá món ăn
function DishReviewForm({ dishId, dishName, onClose }: { dishId: string; dishName: string; onClose: () => void }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [hoveredRating, setHoveredRating] = useState(0)

  const addReviewMutation = useAddDishReviewMutation()
  const { refetch } = useGetDishReviewsByGuestQuery(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast.error('Vui lòng chọn số sao đánh giá')
      return
    }

    try {
      await addReviewMutation.mutateAsync({
        dish_id: dishId,
        rating,
        comment: comment.trim() || undefined
      })

      toast.success('Cảm ơn bạn đã đánh giá!')
      await refetch()
      onClose()
    } catch (error) {
      toast.error('Có lỗi xảy ra khi gửi đánh giá')
      console.error(error)
    }
  }

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg p-6 max-w-md w-full'>
        <h3 className='text-lg font-semibold mb-4'>Đánh giá món ăn</h3>
        <p className='text-gray-600 mb-4'>{dishName}</p>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Rating stars */}
          <div>
            <label className='block text-sm font-medium mb-2'>Đánh giá của bạn</label>
            <div className='flex gap-1'>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type='button'
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className='p-1'
                >
                  <Star
                    size={24}
                    className={`transition-colors ${
                      star <= (hoveredRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className='block text-sm font-medium mb-2'>Nhận xét (tùy chọn)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder='Chia sẻ trải nghiệm của bạn về món ăn này...'
              className='w-full p-3 border border-gray-300 rounded-md resize-none h-20'
              maxLength={500}
            />
            <p className='text-xs text-gray-500 mt-1'>{comment.length}/500</p>
          </div>

          {/* Buttons */}
          <div className='flex gap-3 pt-2'>
            <Button type='button' variant='outline' onClick={onClose} className='flex-1'>
              Hủy
            </Button>
            <Button type='submit' disabled={addReviewMutation.isPending} className='flex-1'>
              {addReviewMutation.isPending ? 'Đang gửi...' : 'Gửi đánh giá'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Component hiển thị đánh giá đã có
function ExistingReview({ dishId }: { dishId: string }) {
  const { data: reviewData } = useDishReviewListQuery(dishId)
  console.log('Review data:', reviewData)

  // Giả sử khách hàng hiện tại có thể có đánh giá (cần điều chỉnh logic này theo hệ thống auth)
  const userReview = reviewData?.payload.result.reviews?.[0] // Simplified for demo

  if (!userReview) return null

  return (
    <div className='mt-2 p-2 bg-gray-50 rounded-md'>
      <div className='flex items-center gap-1 mb-1'>
        <span className='text-sm font-medium'>Đánh giá của bạn:</span>
        <div className='flex'>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={14}
              className={star <= userReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
            />
          ))}
        </div>
      </div>
      {userReview.comment && <p className='text-sm text-gray-600'>{userReview.comment}</p>}
    </div>
  )
}

export default function OrdersCart() {
  const { data, refetch } = useGuestGetOrderListQuery()
  const [reviewingDish, setReviewingDish] = useState<{ id: string; name: string } | null>(null)

  // Pass a dishId or relevant identifier as required by the hook
  const { data: dishReviewByUser } = useGetDishReviewsByGuestQuery(true)

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
      toast('Success', {
        description: `The item ${name} (SL: ${quantity}) has just been updated with the status "${getVietnameseOrderStatus(
          data.status
        )}"`
      })
      refetch()
    }

    function onPayment(data: PayOrdersResType['result']) {
      if (data.length > 0) {
        const orderGroup = data[0]
        const guestInfo = orderGroup.guest
        const totalOrders = data.reduce((sum, group) => sum + group.orders.length, 0)

        toast.success('Thanh toán thành công!', {
          description: `${guestInfo?.name} tại bàn ${guestInfo?.table_number} đã thanh toán ${totalOrders} món ăn. Bạn có thể đánh giá món ăn ngay bây giờ!`
        })
      }
      refetch()
    }

    socket?.on('update-order', onUpdateOrder)
    socket?.on('payment', onPayment)
    socket?.on('connect', onConnect)
    socket?.on('disconnect', onDisconnect)

    return () => {
      socket?.off('connect', onConnect)
      socket?.off('disconnect', onDisconnect)
      socket?.off('update-order', onUpdateOrder)
      socket?.off('payment', onPayment)
    }
  }, [refetch, socket])

  const currentTable = orderGroups.length > 0 ? orderGroups[0].table_number : null

  // Hàm kiểm tra xem món ăn đã có review chưa
  const hasUserReview = (dishId: string) => {
    return dishReviewByUser?.payload.result.reviews.some((review) => review.dish_id === dishId) ?? false
  }

  return (
    <>
      {currentTable && (
        <div className='mb-4 p-3 rounded-lg'>
          <div className='text-sm font-semibold'>
            Table:{' '}
            <Badge variant='outline' className='ml-1'>
              {currentTable}
            </Badge>
          </div>
        </div>
      )}

      {orderGroups.map((orderGroup, groupIndex) => (
        <div key={orderGroup._id} className='mb-6'>
          <div className='text-sm font-medium text-gray-500 mb-3 border-b pb-2'>
            Order group #{groupIndex + 1} • {new Date(orderGroup.created_at).toLocaleDateString('vi-VN')}
            <Badge variant='outline' className='ml-2'>
              {getVietnameseOrderStatus(orderGroup.status)}
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
                    Tổng: {formatCurrency(order.dish_snapshot.price * order.quantity)}
                  </div>
                </div>
                <div className='flex-shrink-0 ml-auto flex flex-col justify-center items-end gap-2'>
                  <Badge variant={order.status === OrderStatus.Paid ? 'default' : 'outline'}>
                    {getVietnameseOrderStatus(order.status)}
                  </Badge>

                  {/* Nút đánh giá cho món ăn đã thanh toán - CHỈ hiện khi CHƯA có review */}
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
                        Đánh giá
                      </Button>
                    )}
                </div>
              </div>

              {/* Hiển thị đánh giá đã có (nếu có) */}
              {order.status === OrderStatus.Paid && <ExistingReview dishId={order.dish_snapshot.dish_id ?? ''} />}
            </div>
          ))}
        </div>
      ))}

      {/* Thông tin thanh toán */}
      <div className='sticky bottom-0 border-t pt-4 space-y-2'>
        {paid.quantity > 0 && (
          <div className='w-full flex justify-between text-green-600 font-semibold'>
            <span>Paid • {paid.quantity} item</span>
            <span>{formatCurrency(paid.price)}</span>
          </div>
        )}

        {waitingForPaying.quantity > 0 && (
          <div className='w-full flex justify-between text-xl font-bold text-orange-600'>
            <span>Waiting for payment • {waitingForPaying.quantity} item</span>
            <span>{formatCurrency(waitingForPaying.price)}</span>
          </div>
        )}

        {orders.length === 0 && <div className='text-center text-gray-500 py-8'>No orders yet</div>}
      </div>

      {/* Modal đánh giá */}
      {reviewingDish && (
        <DishReviewForm
          dishId={reviewingDish.id}
          dishName={reviewingDish.name}
          onClose={() => setReviewingDish(null)}
        />
      )}
    </>
  )
}
