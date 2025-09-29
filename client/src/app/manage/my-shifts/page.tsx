import MyShifts from '@/app/manage/my-shifts/my-shifts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { Suspense } from 'react'

export default function EmployeeShiftsPage() {
  return (
    <main className='grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8'>
      <div className='space-y-2'>
        <Card>
          <CardHeader>
            <CardTitle className='font-bold text-2xl'>My Shifts</CardTitle>
            <CardDescription>View your scheduled work shifts and hours.</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading...</div>}>
              <MyShifts />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
