import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ReviewsTable from '@/features/manage/reviews/reviews-table'
import { useTranslations } from 'next-intl'
import { Suspense } from 'react'

export default function ReviewsPage() {
  const t = useTranslations('reviews')

  return (
    <main className='grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8'>
      <div className='space-y-2'>
        <Card x-chunk='dashboard-06-chunk-0'>
          <CardHeader>
            <CardTitle className='font-bold text-2xl'>{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense>
              <ReviewsTable />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
