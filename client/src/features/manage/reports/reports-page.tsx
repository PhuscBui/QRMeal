'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

import { useRevenueStatisticsQuery, useDishStatisticsQuery } from '@/queries/useReports'
import { format, startOfDay, endOfDay, subDays } from 'date-fns'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { RevenueChart } from '@/features/manage/reports/revenue-chart'
import { DishStatistics } from '@/features/manage/reports/dish-statistics'

export default function ReportsPage() {
  const t = useTranslations('reports')
  const tCommon = useTranslations('common')

  const [fromDate, setFromDate] = useState(startOfDay(subDays(new Date(), 30)))
  const [toDate, setToDate] = useState(endOfDay(new Date()))
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day')

  const query = {
    fromDate: fromDate.toISOString(),
    toDate: toDate.toISOString(),
    period
  }

  const revenueQuery = useRevenueStatisticsQuery(true, query)
  const dishQuery = useDishStatisticsQuery(true, query)

  const resetDateFilter = () => {
    setFromDate(startOfDay(subDays(new Date(), 30)))
    setToDate(endOfDay(new Date()))
  }

  return (
    <main className='grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8'>
      <div className='space-y-2'>
        <Card>
          <CardHeader>
            <CardTitle className='font-bold text-2xl'>{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex flex-wrap items-center gap-4 py-4'>
              <div className='flex items-center gap-2'>
                <span className='text-sm'>{tCommon('from')}</span>
                <Input
                  type='datetime-local'
                  className='text-sm'
                  value={format(fromDate, 'yyyy-MM-dd HH:mm').replace(' ', 'T')}
                  onChange={(event) => setFromDate(new Date(event.target.value))}
                />
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-sm'>{tCommon('to')}</span>
                <Input
                  type='datetime-local'
                  className='text-sm'
                  value={format(toDate, 'yyyy-MM-dd HH:mm').replace(' ', 'T')}
                  onChange={(event) => setToDate(new Date(event.target.value))}
                />
              </div>
              <Button variant='outline' onClick={resetDateFilter}>
                {tCommon('reset')}
              </Button>
              <div className='flex items-center gap-2'>
                <span className='text-sm'>{t('period')}</span>
                <Button variant={period === 'day' ? 'default' : 'outline'} onClick={() => setPeriod('day')}>
                  {t('day')}
                </Button>
                <Button variant={period === 'week' ? 'default' : 'outline'} onClick={() => setPeriod('week')}>
                  {t('week')}
                </Button>
                <Button variant={period === 'month' ? 'default' : 'outline'} onClick={() => setPeriod('month')}>
                  {t('month')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {revenueQuery.isLoading || dishQuery.isLoading ? (
          <div className='flex items-center justify-center py-12'>
            <div className='text-muted-foreground'>{tCommon('loading')}</div>
          </div>
        ) : revenueQuery.isError || dishQuery.isError ? (
          <div className='flex items-center justify-center py-12'>
            <div className='text-destructive'>{tCommon('error')}</div>
          </div>
        ) : (
          <>
            <RevenueChart data={revenueQuery.data?.payload.result ?? []} />
            <DishStatistics
              data={
                dishQuery.data?.payload.result ?? {
                  bestSellers: [],
                  leastOrdered: [],
                  neverOrdered: [],
                  totalDishes: 0,
                  orderedDishes: 0
                }
              }
            />
          </>
        )}
      </div>
    </main>
  )
}
