import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import PromotionList from '@/app/guest/promotions/promotion-list'
import { useTranslations } from 'next-intl'

export default function PromotionsPage() {
  const t = useTranslations('guestPromotions')

  return (
    <main className='container max-w-md mx-auto px-4 py-6'>
      <h1 className='text-2xl font-bold mb-6'>{t('pageTitle')}</h1>
      <Suspense fallback={<PromotionListSkeleton />}>
        <PromotionList />
      </Suspense>
    </main>
  )
}

function PromotionListSkeleton() {
  return (
    <div className='space-y-4'>
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <div key={i} className='border rounded-lg p-4 space-y-3'>
            <Skeleton className='h-6 w-3/4' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-2/3' />
            <div className='flex justify-between items-center pt-2'>
              <Skeleton className='h-4 w-1/4' />
              <Skeleton className='h-9 w-24' />
            </div>
          </div>
        ))}
    </div>
  )
}
