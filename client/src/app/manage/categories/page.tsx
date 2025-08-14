import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { CategoryManager } from '@/app/manage/categories/category-manager'
import { Suspense } from 'react'

export default function Categories() {
  return (
    <main className='grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8'>
      <div className='space-y-2'>
        <Card x-chunk='dashboard-06-chunk-0'>
          <CardHeader>
            <CardTitle className='font-bold text-2xl'>Categories</CardTitle>
            <CardDescription>Categories Management</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense>
              <CategoryManager />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
