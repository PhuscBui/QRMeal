import PromotionTable from '@/app/manage/promotions/promotions-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Suspense } from 'react'

export default function PromotionsPage() {
  return (
    <main className='grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8'>
      <div className='space-y-2'>
        <Card x-chunk='dashboard-06-chunk-0'>
          <CardHeader>
            <CardTitle className='font-bold text-2xl'>Promotions</CardTitle>
            <CardDescription>Promotions Management</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense>
              <PromotionTable />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
