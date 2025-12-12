import OrdersCart from '@/app/guest/orders/orders-cart'
import { useTranslations } from 'next-intl'

export default function OrdersPage() {
  const t = useTranslations('guestOrdersCart')
  
  return (
    <div className='max-w-[400px] mx-auto space-y-4'>
      <h1 className='text-center text-xl font-bold'>{t('pageTitle')}</h1>
      <OrdersCart />
    </div>
  )
}
