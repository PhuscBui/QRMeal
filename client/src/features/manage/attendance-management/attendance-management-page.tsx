import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import AttendanceTable from '@/features/manage/attendance-management/attendance-table'
import { useTranslations } from 'next-intl'
import { Suspense } from 'react'

export default function AttendanceManagementPage() {
  const t = useTranslations('attendance')

  return (
    <main className='grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8'>
      <div className='space-y-2'>
        <Card>
          <CardHeader>
            <CardTitle className='font-bold text-2xl'>{t('attendanceManagement')}</CardTitle>
            <CardDescription>{t('attendanceManagementDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense>
              <AttendanceTable />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
