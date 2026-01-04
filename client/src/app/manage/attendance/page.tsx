'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckInOut } from '@/app/manage/attendance/check-in-out'
import { MyAttendance } from '@/app/manage/attendance/my-attendance'
import { useTranslations } from 'next-intl'
import { Suspense } from 'react'

export default function AttendancePage() {
  const t = useTranslations('attendance')
  
  return (
    <main className='grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8'>
      <div className='space-y-4'>
        <CheckInOut />
        <Card>
          <CardHeader>
            <CardTitle>{t('myAttendanceHistory')}</CardTitle>
            <CardDescription>{t('myAttendanceHistoryDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense>
              <MyAttendance />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

