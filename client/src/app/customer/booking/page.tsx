import BookingDetails from '@/app/guest/booking/booking-details'

export default function BookingsPage() {
  return (
    <div className='container py-6 max-w-md mx-auto'>
      <h1 className='text-2xl font-bold mb-4'>Table reservation information</h1>
      <BookingDetails />
    </div>
  )
}
