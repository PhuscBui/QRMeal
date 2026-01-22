'use client'

import { useMemo } from 'react'
import { ShoppingBag } from 'lucide-react'

import { useGuestMe } from '@/queries/useGuest'
import { useGetGuestPromotionByPhoneQuery, useGetGuestPromotionQuery } from '@/queries/useGuestPromotion'
import { usePromotionListQuery } from '@/queries/usePromotion'
import { Skeleton } from '@/components/ui/skeleton'
import { PromotionResType } from '@/schemaValidations/promotion.schema'
import { GuestPromotion } from '@/schemaValidations/guest-promotion.schema'
import { useTranslations } from 'next-intl'
import PromotionCard from '@/features/guests/promotions/promotion-card'

export default function PromotionList() {
  const t = useTranslations('guestPromotions')

  const { data, isLoading: isPromotionsLoading } = usePromotionListQuery()
  const promotions = useMemo(
    () =>
      data?.payload.result.filter(
        (promotion) => promotion.applicable_to === 'guest' || promotion.applicable_to === 'both'
      ) ?? [],
    [data]
  )

  const { data: guestResult, isLoading: isGuestLoading } = useGuestMe()
  const guest = useMemo(() => guestResult?.payload.result ?? null, [guestResult])

  const { data: guestPromotionResult, isLoading: isGuestPromotionsLoading } = useGetGuestPromotionQuery({
    enabled: Boolean(guest),
    guestId: guest?._id as string
  })

  const guestPromotions = useMemo(
    () => (guestPromotionResult?.payload.result ?? []) as Array<{ promotion_id: string }>,
    [guestPromotionResult]
  )

  const { data: guestPromotionByPhoneResult } = useGetGuestPromotionByPhoneQuery({
    enabled: Boolean(guest),
    guestPhone: guest?.phone as string
  })

  const guestPromotionsByPhone = useMemo(
    () => (guestPromotionByPhoneResult?.payload.result ?? []) as Array<GuestPromotion>,
    [guestPromotionByPhoneResult]
  )

  // Filter used promotions
  const usedPromotionIds = useMemo(() => {
    const usedPromotions = guestPromotionsByPhone.filter((promotion) => promotion.used)
    return usedPromotions.map((promotion) => promotion.promotion_id)
  }, [guestPromotionsByPhone])

  const isApply = (promotionId: string) => {
    return guestPromotions.some((promotion: { promotion_id: string }) => promotion.promotion_id === promotionId)
  }

  function canApplyPromotion(promotion: PromotionResType['result']): boolean {
    const now = new Date()

    // Check validity period
    if (promotion.start_date && new Date(promotion.start_date) > now) return false
    if (promotion.end_date && new Date(promotion.end_date) < now) return false

    // Check if promotion is active
    if (!promotion.is_active) return false

    // Check applicable_to constraint
    if (promotion.applicable_to === 'customer') return false

    return true
  }

  const isUsed = (promotionId: string) => {
    return usedPromotionIds.includes(promotionId)
  }

  const isLoading = isPromotionsLoading || isGuestLoading || isGuestPromotionsLoading

  // Group promotions by category for better organization
  const groupedPromotions = useMemo(() => {
    const groups: Record<string, typeof promotions> = {
      discount: [],
      buy_x_get_y: [],
      loyalty: [],
      other: []
    }

    if (isLoading) {
      return <PromotionListSkeleton />
    }

    promotions.forEach((promotion) => {
      if (groups[promotion.category]) {
        groups[promotion.category].push(promotion)
      } else {
        groups.other.push(promotion)
      }
    })

    return groups
  }, [isLoading, promotions])

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        {guest && (
          <div className='text-sm text-muted-foreground'>
            {t('hello')} <span className='font-bold'>{guest.name || t('guest')}</span>
          </div>
        )}
      </div>

      {Array.isArray(promotions) && promotions.length === 0 ? (
        <EmptyPromotions />
      ) : (
        <div className='space-y-8'>
          {Object.entries(groupedPromotions).map(([category, categoryPromotions]) => {
            if (categoryPromotions?.length === 0) return null

            const getCategoryTitle = (cat: string) => {
              switch (cat) {
                case 'discount':
                  return t('discountPromotion')
                case 'buy_x_get_y':
                  return t('buyXGetY')
                case 'loyalty':
                  return t('loyaltyPromotion')
                default:
                  return t('otherPromotion')
              }
            }

            return (
              <div key={category}>
                <h3 className='text-xl font-semibold mb-4 text-muted-foreground'>
                  {getCategoryTitle(category)} ({categoryPromotions?.length})
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-1 gap-4'>
                  {Array.isArray(categoryPromotions) &&
                    categoryPromotions.map(
                      (promotion: {
                        _id: string
                        name: string
                        description: string
                        category: 'discount' | 'buy_x_get_y' | 'combo' | 'freeship'
                        start_date: Date
                        end_date: Date
                        is_active: boolean
                        applicable_to: 'guest' | 'customer' | 'both'
                        discount_type?: 'percentage' | 'fixed' | undefined
                        discount_value?: number | undefined
                        conditions?:
                          | {
                              min_spend?: number | undefined
                              min_visits?: number | undefined
                              min_loyalty_points?: number | undefined
                              buy_quantity?: number | undefined
                              get_quantity?: number | undefined
                              applicable_items?: string[] | undefined
                            }
                          | undefined
                      }) => (
                        <PromotionCard
                          key={promotion._id}
                          promotion={promotion}
                          guestId={guest?._id ?? ''}
                          guestPhone={guest?.phone ?? ''}
                          isApply={isApply(promotion._id)}
                          canApply={canApplyPromotion(promotion)}
                          isUsed={isUsed(promotion._id)}
                        />
                      )
                    )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function EmptyPromotions() {
  const t = useTranslations('guestPromotions')

  return (
    <div className='text-center py-16 px-4 rounded-lg border border-dashed'>
      <ShoppingBag className='h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50' />
      <h3 className='text-lg font-medium mb-2'>{t('noPromotionsAvailable')}</h3>
      <p className='text-muted-foreground max-w-md mx-auto'>{t('noPromotionsDesc')}</p>
    </div>
  )
}

function PromotionListSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-5 w-32' />
      </div>

      <Skeleton className='h-40 w-full' />

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className='h-64 w-full' />
          ))}
      </div>
    </div>
  )
}
