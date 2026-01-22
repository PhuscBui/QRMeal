import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import UnifiedShiftManagement from '@/features/manage/shifts/shift-table'
import { useTranslations } from 'next-intl'
import { Suspense } from 'react'

export default function ShiftsPage() {
  const t = useTranslations('shift')

  return (
    <main className='grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8'>
      <div className='space-y-2'>
        <Card x-chunk='dashboard-06-chunk-0'>
          <CardHeader>
            <CardTitle className='font-bold text-2xl'>{t('shiftManagement')}</CardTitle>
            <CardDescription>{t('manageEmployeeShifts')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>{t('loading')}</div>}>
              <UnifiedShiftManagement />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
