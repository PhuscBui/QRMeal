'use client'

import { Calendar, Percent, ShoppingBag, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PromotionResType } from '@/schemaValidations/promotion.schema'
import { PromotionType } from '@/constants/type'
import { useAddGuestPromotionMutation, useDeleteGuestPromotionMutation } from '@/queries/useGuestPromotion'
import { toast } from 'sonner'
import { handleErrorApi } from '@/lib/utils'

interface PromotionCardProps {
  promotion: PromotionResType['result']
  guestId: string
  guestPhone: string
  isApply?: boolean
  canApply?: boolean
  isUsed?: boolean
}

export default function PromotionCard({
  promotion,
  guestId,
  guestPhone,
  isApply,
  canApply,
  isUsed
}: PromotionCardProps) {
  const addPromotion = useAddGuestPromotionMutation()
  const deletePromotion = useDeleteGuestPromotionMutation()

  const handleApplyPromotion = async () => {
    if (addPromotion.isPending) return
    try {
      const result = await addPromotion.mutateAsync({
        guest_id: guestId,
        guest_phone: guestPhone,
        promotion_id: promotion._id
      })

      toast.success('Success', {
        description: result.payload.message
      })
    } catch (error) {
      handleErrorApi({
        error
      })
    }
  }

  const handleDeletePromotion = async () => {
    if (deletePromotion.isPending) return
    try {
      const result = await deletePromotion.mutateAsync({
        guest_id: guestId,
        promotion_id: promotion._id
      })

      toast.success('Success', {
        description: result.payload.message
      })
    } catch (error) {
      handleErrorApi({
        error
      })
    }
  }

  const formatDiscount = () => {
    switch (promotion.discount_type) {
      case PromotionType.Percent:
        return `Giảm ${promotion.discount_value}%`
      case PromotionType.FreeItem:
        return `Tặng sản phẩm: ${promotion.discount_value}`
      case PromotionType.LoyaltyPoints:
        return `Tặng ${promotion.discount_value} điểm tích lũy`
      case PromotionType.Discount:
      default:
        return `Giảm ${promotion.discount_value.toLocaleString()}₫`
    }
  }

  const renderPromotionIcon = () => {
    switch (promotion.discount_type) {
      case PromotionType.Percent:
        return <Percent className='h-4 w-4 mr-2 text-primary' />
      case PromotionType.FreeItem:
        return <ShoppingBag className='h-4 w-4 mr-2 text-primary' />
      case PromotionType.LoyaltyPoints:
        return <Award className='h-4 w-4 mr-2 text-primary' />
      case PromotionType.Discount:
      default:
        return <Percent className='h-4 w-4 mr-2 text-primary' />
    }
  }

  return (
    <div className='border rounded-lg p-4 shadow-sm bg-card'>
      <div className='flex justify-between items-start'>
        <h3 className='font-semibold text-lg'>{promotion.name}</h3>
        {promotion.is_active ? (
          <Badge variant='outline' className='bg-green-50 text-green-700 border-green-200'>
            Active
          </Badge>
        ) : (
          <Badge variant='outline' className='bg-gray-50 text-gray-500 border-gray-200'>
            Inactive
          </Badge>
        )}
      </div>

      <p className='text-sm text-muted-foreground mt-1 mb-3'>{promotion.description}</p>

      <div className='space-y-2 mb-4'>
        <div className='flex items-center text-sm'>
          {renderPromotionIcon()}
          <span>{formatDiscount()}</span>
        </div>

        {promotion.min_spend > 0 && (
          <div className='flex items-center text-sm'>
            <ShoppingBag className='h-4 w-4 mr-2 text-primary' />
            <span>Đơn tối thiểu: {promotion.min_spend.toLocaleString()}₫</span>
          </div>
        )}

        {promotion.min_visits > 0 && (
          <div className='flex items-center text-sm'>
            <ShoppingBag className='h-4 w-4 mr-2 text-primary' />
            <span>Số lần ghé thăm tối thiểu: {promotion.min_visits}</span>
          </div>
        )}

        {promotion.min_loyalty_points > 0 && (
          <div className='flex items-center text-sm'>
            <Award className='h-4 w-4 mr-2 text-primary' />
            <span>Điểm thành viên tối thiểu: {promotion.min_loyalty_points}</span>
          </div>
        )}

        <div className='flex items-center text-sm'>
          <Calendar className='h-4 w-4 mr-2 text-primary' />
          <span>
            {new Date(promotion.start_date).toLocaleDateString('vi-VN')} -{' '}
            {new Date(promotion.end_date).toLocaleDateString('vi-VN')}
          </span>
        </div>
      </div>

      <div className='flex justify-end gap-2'>
        {isUsed && (
          <Badge variant='outline' className='bg-red-50 text-red-700 border-red-200'>
            Used
          </Badge>
        )}

        <Button
          variant='destructive'
          onClick={handleDeletePromotion}
          disabled={deletePromotion.isPending || !isApply || isUsed}
          hidden={isUsed}
        >
          Cancel apply
        </Button>
        <Button
          variant='default'
          onClick={handleApplyPromotion}
          disabled={!promotion.is_active || addPromotion.isPending || isApply || !canApply || isUsed}
          hidden={isUsed}
        >
          {addPromotion.isPending ? 'Applying...' : 'Apply'}
        </Button>
      </div>
    </div>
  )
}
