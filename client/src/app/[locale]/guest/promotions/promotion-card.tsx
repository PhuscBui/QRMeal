'use client'

import { Calendar, Percent, ShoppingBag, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PromotionResType } from '@/schemaValidations/promotion.schema'
import { useAddGuestPromotionMutation, useDeleteGuestPromotionMutation } from '@/queries/useGuestPromotion'
import { toast } from 'sonner'
import { handleErrorApi } from '@/lib/utils'
import { useState } from 'react'
import { PhoneDialog } from '@/app/guest/promotions/phone-dialog'
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('guestPromotions')
  
  const addPromotion = useAddGuestPromotionMutation()
  const deletePromotion = useDeleteGuestPromotionMutation()
  const [openPhoneDialog, setOpenPhoneDialog] = useState(false)
  const [tempPhone, setTempPhone] = useState<string | null>(guestPhone)

  const handleApplyPromotion = async (phone?: string) => {
    if (addPromotion.isPending) return
    try {
      const result = await addPromotion.mutateAsync({
        guest_id: guestId,
        guest_phone: phone || tempPhone || '',
        promotion_id: promotion._id
      })

      toast.success('Success', {
        description: result.payload.message
      })
    } catch (error) {
      handleErrorApi({ error })
    }
  }

  const handleClickApply = () => {
    if (!guestPhone && !tempPhone) {
      setOpenPhoneDialog(true)
      return
    }
    handleApplyPromotion()
  }

  const handleDeletePromotion = async () => {
    if (deletePromotion.isPending) return
    try {
      const result = await deletePromotion.mutateAsync({
        guest_id: guestId,
        promotion_id: promotion._id
      })

      toast.success(t('success'), {
        description: result.payload.message
      })
    } catch (error) {
      handleErrorApi({
        error
      })
    }
  }

  const formatDiscount = () => {
    // Handle different promotion categories
    if (promotion.category === 'buy_x_get_y') {
      const buyQty = promotion.conditions?.buy_quantity || 0
      const getQty = promotion.conditions?.get_quantity || 0
      return t('buyXGetYFormat', { buy: buyQty, get: getQty })
    }

    // Handle discount category with different discount types
    if (promotion.category === 'discount' && promotion.discount_type && promotion.discount_value !== undefined) {
      switch (promotion.discount_type) {
        case 'percentage':
          return t('discountPercent', { percent: promotion.discount_value })
        case 'fixed':
          return t('discountFixed', { amount: promotion.discount_value.toLocaleString() })
        default:
          return t('discountFixed', { amount: promotion.discount_value.toLocaleString() })
      }
    }

    // Handle loyalty category
    if (promotion.category === 'loyalty') {
      return t('membershipPromotion')
    }

    return t('specialPromotion')
  }

  const renderPromotionIcon = () => {
    if (promotion.category === 'buy_x_get_y') {
      return <ShoppingBag className='h-4 w-4 mr-2 text-primary' />
    }

    if (promotion.category === 'discount' && promotion.discount_type) {
      switch (promotion.discount_type) {
        case 'percentage':
          return <Percent className='h-4 w-4 mr-2 text-primary' />
        case 'fixed':
          return <Percent className='h-4 w-4 mr-2 text-primary' />
        default:
          return <Percent className='h-4 w-4 mr-2 text-primary' />
      }
    }

    if (promotion.category === 'loyalty') {
      return <Award className='h-4 w-4 mr-2 text-primary' />
    }

    return <Percent className='h-4 w-4 mr-2 text-primary' />
  }

  const getCategoryBadge = () => {
    switch (promotion.category) {
      case 'discount':
        return t('discount')
      case 'buy_x_get_y':
        return t('buyXGetYFree')
      case 'loyalty':
        return t('member')
      default:
        return promotion.category
    }
  }

  return (
    <div className='border rounded-lg p-4 shadow-sm bg-card'>
      <div className='flex justify-between items-start mb-2'>
        <div className='flex-1'>
          <h3 className='font-semibold text-lg'>{promotion.name}</h3>
          <Badge variant='secondary' className='mt-1'>
            {getCategoryBadge()}
          </Badge>
        </div>
        {promotion.is_active ? (
          <Badge variant='outline' className='bg-green-50 text-green-700 border-green-200'>
            {t('active')}
          </Badge>
        ) : (
          <Badge variant='outline' className='bg-gray-50 text-gray-500 border-gray-200'>
            {t('inactive')}
          </Badge>
        )}
      </div>

      <p className='text-sm text-muted-foreground mt-2 mb-3'>{promotion.description}</p>

      <div className='space-y-2 mb-4'>
        <div className='flex items-center text-sm font-medium'>
          {renderPromotionIcon()}
          <span>{formatDiscount()}</span>
        </div>

        {promotion.conditions?.min_spend && promotion.conditions.min_spend > 0 && (
          <div className='flex items-center text-sm'>
            <ShoppingBag className='h-4 w-4 mr-2 text-muted-foreground' />
            <span>{t('minimumOrder', { amount: promotion.conditions.min_spend.toLocaleString() })}</span>
          </div>
        )}

        {promotion.conditions?.min_visits && promotion.conditions.min_visits > 0 && (
          <div className='flex items-center text-sm'>
            <ShoppingBag className='h-4 w-4 mr-2 text-muted-foreground' />
            <span>{t('minimumVisits', { count: promotion.conditions.min_visits })}</span>
          </div>
        )}

        {promotion.conditions?.min_loyalty_points && promotion.conditions.min_loyalty_points > 0 && (
          <div className='flex items-center text-sm'>
            <Award className='h-4 w-4 mr-2 text-muted-foreground' />
            <span>{t('minimumLoyaltyPoints', { points: promotion.conditions.min_loyalty_points })}</span>
          </div>
        )}

        <div className='flex items-center text-sm'>
          <Calendar className='h-4 w-4 mr-2 text-muted-foreground' />
          <span>
            {new Date(promotion.start_date).toLocaleDateString('vi-VN')} -{' '}
            {new Date(promotion.end_date).toLocaleDateString('vi-VN')}
          </span>
        </div>

        <div className='flex items-center text-sm'>
          <span className='text-muted-foreground'>{t('appliesTo')} </span>
          <Badge variant='outline' className='ml-2'>
            {promotion.applicable_to === 'both' ? t('all') : promotion.applicable_to === 'guest' ? t('guest') : t('customer')}
          </Badge>
        </div>
      </div>

      <div className='flex justify-end gap-2'>
        {isUsed && (
          <Badge variant='outline' className='bg-red-50 text-red-700 border-red-200'>
            {t('used')}
          </Badge>
        )}

        {!isUsed && isApply && (
          <Button variant='destructive' size='sm' onClick={handleDeletePromotion} disabled={deletePromotion.isPending}>
            {deletePromotion.isPending ? t('canceling') : t('cancelApplication')}
          </Button>
        )}

        <div className='flex justify-end gap-2'>
          {!isUsed && !isApply && (
            <Button
              variant='default'
              size='sm'
              onClick={handleClickApply}
              disabled={!promotion.is_active || addPromotion.isPending || !canApply}
            >
              {addPromotion.isPending ? t('applying') : t('apply')}
            </Button>
          )}
        </div>

        <PhoneDialog
          open={openPhoneDialog}
          onClose={() => setOpenPhoneDialog(false)}
          onSave={(phone) => {
            setTempPhone(phone)
            setOpenPhoneDialog(false)
            handleApplyPromotion(phone)
          }}
        />
      </div>
    </div>
  )
}
