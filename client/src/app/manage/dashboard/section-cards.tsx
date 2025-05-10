import { ShoppingCart, TrendingDownIcon, TrendingUpIcon, Users, UsersRound } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'


interface SectionCardsProps {
  totalRevenue: number
  totalOrder: number
  newCustomers: number
  activeAccounts: number
}


export function SectionCards(
  {totalRevenue, totalOrder, newCustomers, activeAccounts}: SectionCardsProps
) {
  return (
    <div className='*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6'>
      <Card className='@container/card'>
        <CardHeader className='relative'>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>
            {totalRevenue}
          </CardTitle>
          <div className='absolute right-4 top-4'>
              <TrendingUpIcon className='size-10' />
          </div>
        </CardHeader>
       
      </Card>
      <Card className='@container/card'>
        <CardHeader className='relative'>
          <CardDescription>New Customers</CardDescription>
          <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>
            {newCustomers}
          </CardTitle>
          <div className='absolute right-4 top-4'>
             <Users className='size-10'/>
          </div>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
             Have {newCustomers} new customers
          </div>

        </CardFooter>
      </Card>
      <Card className='@container/card'>
        <CardHeader className='relative'>
          <CardDescription>Active Accounts</CardDescription>
          <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>
            {activeAccounts}
          </CardTitle>
          <div className='absolute right-4 top-4'>
             <UsersRound  className = 'size-10' />
          </div>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            Have {activeAccounts} active accounts
          </div>
        </CardFooter>
      </Card>
      <Card className='@container/card'>
        <CardHeader className='relative'>
          <CardDescription>Total Orders</CardDescription>
          <CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>
            {totalOrder}
          </CardTitle>
          <div className='absolute right-4 top-4'>
          
             <ShoppingCart  className = 'size-10' />
           
          </div>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            Have {totalOrder} total orders
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
