import OrdersCart from '@/app/guest/orders/orders-cart'
import { getTranslations } from 'next-intl/server'

export default async function OrdersPage() {
  const t = await getTranslations('guestOrders')
  
  return (
    <div className='max-w-[400px] mx-auto space-y-4'>
      <h1 className='text-center text-xl font-bold'>{t('orders')}</h1>
      <OrdersCart />
    </div>
  )
}

