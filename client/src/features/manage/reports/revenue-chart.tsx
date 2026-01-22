'use client'

import * as React from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RevenueStatisticsResType } from '@/schemaValidations/reports.schema'
import { useTranslations } from 'next-intl'
import { formatCurrency } from '@/lib/utils'

interface RevenueChartProps {
  data: RevenueStatisticsResType['result']
}

export function RevenueChart({ data }: RevenueChartProps) {
  const t = useTranslations('reports')
  const [period, setPeriod] = React.useState<'day' | 'week' | 'month'>('day')

  const chartConfig = {
    totalRevenue: {
      label: t('revenue'),
      color: 'hsl(var(--chart-1))'
    }
  } satisfies ChartConfig

  const formatPeriod = (periodValue: string) => {
    if (period === 'day') {
      return periodValue
    } else if (period === 'week') {
      return periodValue
    } else {
      return periodValue
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>{t('revenueStatistics')}</CardTitle>
            <CardDescription>{t('revenueStatisticsDesc')}</CardDescription>
          </div>
          <Select value={period} onValueChange={(value) => setPeriod(value as 'day' | 'week' | 'month')}>
            <SelectTrigger className='w-[120px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='day'>{t('byDay')}</SelectItem>
              <SelectItem value='week'>{t('byWeek')}</SelectItem>
              <SelectItem value='month'>{t('byMonth')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='h-[300px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='hsl(var(--border))' />
              <XAxis
                dataKey='period'
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatPeriod}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => formatCurrency(value)}
                width={80}
              />
              <ChartTooltip
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />}
              />
              <Bar dataKey='totalRevenue' fill='hsl(var(--chart-1))' radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

