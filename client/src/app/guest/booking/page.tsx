import BookingDetails from "@/app/guest/booking/booking-details"

export default function BookingsPage() {
  return (
    <div className="container py-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Thông tin đặt bàn</h1>
      <BookingDetails />
    </div>
  )
}
