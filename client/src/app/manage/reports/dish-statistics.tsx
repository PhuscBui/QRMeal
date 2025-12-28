'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DishStatisticsResType } from '@/schemaValidations/reports.schema'
import { useTranslations } from 'next-intl'
import { formatCurrency } from '@/lib/utils'

interface DishStatisticsProps {
  data: DishStatisticsResType['result']
}

export function DishStatistics({ data }: DishStatisticsProps) {
  const t = useTranslations('reports')

  return (
    <div className='grid gap-4 md:grid-cols-3'>
      {/* Best Sellers */}
      <Card>
        <CardHeader>
          <CardTitle>{t('bestSellers')}</CardTitle>
          <CardDescription>{t('bestSellersDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {data.bestSellers.length > 0 ? (
              data.bestSellers.map((dish, index) => (
                <div key={dish.dishId} className='flex items-center gap-3'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold'>
                    {index + 1}
                  </div>
                  <Avatar className='h-10 w-10'>
                    <AvatarImage src={dish.dishImage} alt={dish.dishName} />
                    <AvatarFallback>{dish.dishName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className='flex-1'>
                    <div className='font-medium'>{dish.dishName}</div>
                    <div className='text-xs text-muted-foreground'>
                      {t('quantity')}: {dish.totalQuantity} | {formatCurrency(dish.totalRevenue)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className='text-center text-sm text-muted-foreground'>{t('noData')}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Least Ordered */}
      <Card>
        <CardHeader>
          <CardTitle>{t('leastOrdered')}</CardTitle>
          <CardDescription>{t('leastOrderedDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {data.leastOrdered.length > 0 ? (
              data.leastOrdered.map((dish, index) => (
                <div key={dish.dishId} className='flex items-center gap-3'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold'>
                    {index + 1}
                  </div>
                  <Avatar className='h-10 w-10'>
                    <AvatarImage src={dish.dishImage} alt={dish.dishName} />
                    <AvatarFallback>{dish.dishName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className='flex-1'>
                    <div className='font-medium'>{dish.dishName}</div>
                    <div className='text-xs text-muted-foreground'>
                      {t('quantity')}: {dish.totalQuantity} | {formatCurrency(dish.totalRevenue)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className='text-center text-sm text-muted-foreground'>{t('noData')}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Never Ordered */}
      <Card>
        <CardHeader>
          <CardTitle>{t('neverOrdered')}</CardTitle>
          <CardDescription>{t('neverOrderedDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {data.neverOrdered.length > 0 ? (
              data.neverOrdered.map((dish, index) => (
                <div key={dish.dishId} className='flex items-center gap-3'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-sm font-bold'>
                    {index + 1}
                  </div>
                  <Avatar className='h-10 w-10'>
                    <AvatarImage src={dish.dishImage} alt={dish.dishName} />
                    <AvatarFallback>{dish.dishName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className='flex-1'>
                    <div className='font-medium'>{dish.dishName}</div>
                    <div className='text-xs text-muted-foreground'>{t('notOrderedYet')}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className='text-center text-sm text-muted-foreground'>{t('noData')}</div>
            )}
          </div>
          <div className='mt-4 border-t pt-4 text-sm text-muted-foreground'>
            {t('summary', {
              total: data.totalDishes,
              ordered: data.orderedDishes,
              neverOrdered: data.totalDishes - data.orderedDishes
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

