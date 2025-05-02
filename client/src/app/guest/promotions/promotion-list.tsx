'use client'

import PromotionCard from '@/app/guest/promotions/promotion-card'
import { useGuestMe } from '@/queries/useGuest'
import { useGetGuestPromotionQuery } from '@/queries/useGuestPromotion'
import { usePromotionListQuery } from '@/queries/usePromotion'
import { useMemo } from 'react'

export default function PromotionList() {
  const { data } = usePromotionListQuery()
  const promotions = useMemo(() => data?.payload.result ?? [], [data])
  const { data: guestResult } = useGuestMe()
  const guest = useMemo(() => guestResult?.payload.result ?? null, [guestResult])

  const { data: guestPromotionResult } = useGetGuestPromotionQuery({
    enabled: Boolean(guest),
    guestId: guest?._id as string
  })

  const guestPromotions = useMemo(
    () => (guestPromotionResult?.payload.result ?? []) as Array<{ promotion_id: string }>,
    [guestPromotionResult]
  )

  const isApply = (promotionId: string) => {
    return guestPromotions.some((promotion: { promotion_id: string }) => promotion.promotion_id === promotionId)
  }

  if (promotions.length === 0) {
    return (
      <div className='text-center py-10'>
        <p className='text-muted-foreground'>No promotions available at the moment.</p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {promotions.map((promotion) => (
        <PromotionCard
          key={promotion._id}
          promotion={promotion}
          guestId={guest?._id ?? ''}
          guestPhone={guest?.phone ?? ''}
          isApply={isApply(promotion._id)}
        />
      ))}
    </div>
  )
}
