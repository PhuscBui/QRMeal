'use client'
import { ShoppingCart, TrendingUpIcon, Users, UsersRound } from 'lucide-react'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useTranslations } from 'next-intl'

interface SectionCardsProps {
  totalRevenue: number
  totalOrder: number
  newCustomers: number
  activeAccounts: number
}

export function SectionCards({ totalRevenue, totalOrder, newCustomers, activeAccounts }: SectionCardsProps) {
  const t = useTranslations('dashboard')

  return (
    <div className='*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6'>
      <Card className='@container/card'>
        <CardHeader className='relative'>
          <CardDescription>{t('totalRevenue')}</CardDescription>
          <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>{totalRevenue}</CardTitle>
          <div className='absolute right-4 top-4'>
            <TrendingUpIcon className='size-10' />
          </div>
        </CardHeader>
      </Card>
      <Card className='@container/card'>
        <CardHeader className='relative'>
          <CardDescription>{t('newCustomers')}</CardDescription>
          <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>{newCustomers}</CardTitle>
          <div className='absolute right-4 top-4'>
            <Users className='size-10' />
          </div>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>{t('haveNewCustomers', { count: newCustomers })}</div>
        </CardFooter>
      </Card>
      <Card className='@container/card'>
        <CardHeader className='relative'>
          <CardDescription>{t('activeAccounts')}</CardDescription>
          <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>{activeAccounts}</CardTitle>
          <div className='absolute right-4 top-4'>
            <UsersRound className='size-10' />
          </div>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            {t('haveActiveAccounts', { count: activeAccounts })}
          </div>
        </CardFooter>
      </Card>
      <Card className='@container/card'>
        <CardHeader className='relative'>
          <CardDescription>{t('totalOrders')}</CardDescription>
          <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>{totalOrder}</CardTitle>
          <div className='absolute right-4 top-4'>
            <ShoppingCart className='size-10' />
          </div>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>{t('haveTotalOrders', { count: totalOrder })}</div>
        </CardFooter>
      </Card>
    </div>
  )
}
