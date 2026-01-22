import BookingDetails from '@/app/guest/booking/booking-details'
import { useTranslations } from 'next-intl'

export default function BookingsPage() {
  const t = useTranslations('guestBooking')

  return (
    <div className='container py-6 max-w-md mx-auto'>
      <h1 className='text-2xl font-bold mb-4'>{t('pageTitle')}</h1>
      <BookingDetails />
    </div>
  )
}
