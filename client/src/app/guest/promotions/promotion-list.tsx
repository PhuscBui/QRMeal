'use client'

import { useMemo } from 'react'
import { Award, CreditCard, ShoppingBag, Star } from 'lucide-react'

import PromotionCard from '@/app/guest/promotions/promotion-card'
import { useGuestMe } from '@/queries/useGuest'
import { useGetGuestLoyaltyQuery } from '@/queries/useGuestLoyalty'
import { useGetGuestPromotionQuery } from '@/queries/useGuestPromotion'
import { usePromotionListQuery } from '@/queries/usePromotion'
import type { GuestLoyalty } from '@/schemaValidations/guest-loyalty.schema'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PromotionResType } from '@/schemaValidations/promotion.schema'

export default function PromotionList() {
  const { data, isLoading: isPromotionsLoading } = usePromotionListQuery()
  const promotions = useMemo(() => data?.payload.result ?? [], [data])

  const { data: guestResult, isLoading: isGuestLoading } = useGuestMe()
  const guest = useMemo(() => guestResult?.payload.result ?? null, [guestResult])

  const { data: guestLoyaltyData, isLoading: isLoyaltyLoading } = useGetGuestLoyaltyQuery({
    guestPhone: guest?.phone ?? '',
    enabled: Boolean(guest)
  })

  const guestLoyalty = useMemo(() => (guestLoyaltyData?.payload.result ?? null) as GuestLoyalty, [guestLoyaltyData])

  const { data: guestPromotionResult, isLoading: isGuestPromotionsLoading } = useGetGuestPromotionQuery({
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

  function canApplyPromotion(promotion: PromotionResType['result'], loyalty: GuestLoyalty | null): boolean {
    if (!loyalty) return false

    const now = new Date()

    // Kiểm tra ngày hiệu lực
    if (promotion.start_date && new Date(promotion.start_date) > now) return false
    if (promotion.end_date && new Date(promotion.end_date) < now) return false

    // Kiểm tra điều kiện về loyalty
    if (promotion.min_visits && loyalty.visit_count < promotion.min_visits) return false
    if (promotion.min_loyalty_points && loyalty.loyalty_points < promotion.min_loyalty_points) return false

    return true
  }

  const isLoading = isPromotionsLoading || isGuestLoading || isLoyaltyLoading || isGuestPromotionsLoading

  if (isLoading) {
    return <PromotionListSkeleton />
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold tracking-tight'>Current Promotions</h2>
        {guest && (
          <div className='text-sm text-muted-foreground'>
            Welcome back, <span className='font-bold'>{guest.name || 'Guest'}</span>
          </div>
        )}
      </div>

      {guestLoyalty && <LoyaltyCard loyalty={guestLoyalty} />}

      {promotions.length === 0 ? (
        <EmptyPromotions />
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-1 gap-4'>
          {promotions.map((promotion) => (
            <PromotionCard
              key={promotion._id}
              promotion={promotion}
              guestId={guest?._id ?? ''}
              guestPhone={guest?.phone ?? ''}
              isApply={isApply(promotion._id)}
              canApply={canApplyPromotion(promotion, guestLoyalty)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function LoyaltyCard({ loyalty }: { loyalty: GuestLoyalty }) {
  return (
    <Card className='bg-gradient-to-r from-violet-50 to-purple-50 border-violet-100'>
      <CardContent className='p-6'>
        <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
          <Award className='h-5 w-5 text-violet-500' />
          Your Loyalty Status
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* <div className='flex items-center gap-3'>
            <div className='bg-violet-100 p-2 rounded-full'>
              <ShoppingBag className='h-5 w-5 text-violet-600' />
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Total Spend</p>
              <p className='font-semibold text-lg'>${loyalty.total_spend}</p>
            </div>
          </div> */}

          <div className='flex items-center gap-3'>
            <div className='bg-violet-100 p-2 rounded-full'>
              <CreditCard className='h-5 w-5 text-violet-600' />
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Visit Count</p>
              <p className='font-semibold text-lg'>{loyalty.visit_count}</p>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            <div className='bg-violet-100 p-2 rounded-full'>
              <Star className='h-5 w-5 text-violet-600' />
            </div>
            <div>
              <p className='text-sm text-muted-foreground'>Loyalty Points</p>
              <p className='font-semibold text-lg'>{loyalty.loyalty_points}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyPromotions() {
  return (
    <div className='text-center py-16 px-4 rounded-lg border border-dashed'>
      <ShoppingBag className='h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50' />
      <h3 className='text-lg font-medium mb-2'>No Promotions Available</h3>
      <p className='text-muted-foreground max-w-md mx-auto'>
        There are no active promotions at the moment. Please check back later for exclusive offers and deals.
      </p>
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
