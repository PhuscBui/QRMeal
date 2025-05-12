import dishApiRequest from '@/apiRequests/dish'
import { formatCurrency } from '@/lib/utils'
import type { DishListResType } from '@/schemaValidations/dish.schema'
import Image from 'next/image'
import { ChefHat, Clock, Star, MapPin, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function Home() {
  let dishList: DishListResType['result'] = []
  try {
    const data = await dishApiRequest.list()
    const {
      payload: { result }
    } = data
    dishList = result
  } catch (error) {
    console.log(error)
    return <div>Something went wrong</div>
  }

  return (
    <main className='w-full'>
      {/* Hero Section */}
      <section className='relative h-[500px] overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-r from-black/70 to-black/50 z-10'></div>
        <Image
          src='/restaurant-background.png'
          width={1920}
          height={1080}
          quality={100}
          alt='Restaurant Banner'
          className='absolute inset-0 w-full h-full object-cover'
          priority
        />
        <div className='relative z-20 h-full flex flex-col justify-center items-center px-4 sm:px-10 md:px-20 text-white'>
          <h1 className='text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight'>
            QRMeal Restaurant
          </h1>
          <p className='text-center text-lg sm:text-xl max-w-2xl mb-8 text-gray-100'>
            Experience the finest Vietnamese cuisine with our carefully crafted dishes
          </p>
          <div className='flex flex-col sm:flex-row gap-4'>
            <Link href='#dish'>
            <Button size='lg' className='bg-amber-500 hover:bg-amber-600 text-white'>
              Explore Menu
              </Button>
            </Link>
            <Link href='/reserve'>
              <Button size='lg'>Book a Table</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-16 bg-amber-50'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='bg-white p-6 rounded-xl shadow-sm flex flex-col items-center text-center'>
              <div className='bg-amber-100 p-3 rounded-full mb-4'>
                <ChefHat className='h-6 w-6 text-amber-600' />
              </div>
              <h3 className='text-lg font-semibold mb-2'>Master Chefs</h3>
              <p className='text-gray-600'>
                Our dishes are prepared by experienced chefs with passion for Vietnamese cuisine
              </p>
            </div>
            <div className='bg-white p-6 rounded-xl shadow-sm flex flex-col items-center text-center'>
              <div className='bg-amber-100 p-3 rounded-full mb-4'>
                <Star className='h-6 w-6 text-amber-600' />
              </div>
              <h3 className='text-lg font-semibold mb-2'>Quality Food</h3>
              <p className='text-gray-600'>
                We use only the freshest ingredients to ensure the highest quality of our dishes
              </p>
            </div>
            <div className='bg-white p-6 rounded-xl shadow-sm flex flex-col items-center text-center'>
              <div className='bg-amber-100 p-3 rounded-full mb-4'>
                <Clock className='h-6 w-6 text-amber-600' />
              </div>
              <h3 className='text-lg font-semibold mb-2'>Fast Service</h3>
              <p className='text-gray-600'>Quick and attentive service to make your dining experience pleasant</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dishes Section */}
      <section id='dish' className='py-16 container mx-auto px-4'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold mb-4'>Our Delicious Dishes</h2>
          <p className='text-gray-600 max-w-2xl mx-auto'>
            Discover our menu of authentic Vietnamese cuisine, prepared with love and tradition
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          {dishList.map((dish) => (
            <div
              key={dish._id}
              className='bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col sm:flex-row'
            >
              <div className='sm:w-[180px] h-[180px] flex-shrink-0 overflow-hidden'>
                <Image
                  src={dish.image || 'https://placehold.co/400x400'}
                  width={400}
                  height={400}
                  quality={90}
                  alt={dish.name}
                  className='w-full h-full object-cover transition-transform duration-300 hover:scale-105'
                />
              </div>
              <div className='p-5 flex flex-col flex-grow'>
                <div className='flex justify-between items-start mb-2'>
                  <h3 className='text-xl font-semibold'>{dish.name}</h3>
                  <span className='bg-amber-100 text-amber-800 text-sm font-medium px-2.5 py-0.5 rounded-full'>
                    {formatCurrency(dish.price)}
                  </span>
                </div>
                <p className='text-gray-600 mb-4 flex-grow'>{dish.description}</p>
                <Button
                  variant='ghost'
                  className='self-start text-amber-600 hover:text-amber-700 hover:bg-amber-50 p-0 flex items-center gap-1'
                >
                  Order now <ArrowRight className='h-4 w-4 ml-1' />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial Section */}
      <section className='py-16 bg-gray-50'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold mb-4'>What Our Customers Say</h2>
            <p className='text-gray-600 max-w-2xl mx-auto'>
              Don&apos;t just take our word for it, see what our customers have to say
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='bg-white p-6 rounded-xl shadow-sm'>
                <div className='flex items-center mb-4'>
                  <div className='flex text-amber-400'>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className='h-4 w-4 fill-current' />
                    ))}
                  </div>
                </div>
                <p className='text-gray-600 mb-4 italic'>
                  &quot;The food at QRMeal Restaurant is absolutely delicious. The flavors are authentic and the service
                  is excellent. Highly recommended!&quot;
                </p>
                <div className='flex items-center'>
                  <div className='w-10 h-10 bg-gray-200 rounded-full mr-3'></div>
                  <div>
                    <p className='font-medium'>Customer {i}</p>
                    <p className='text-sm text-gray-500'>Regular Visitor</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact/Location Section */}
      <section className='py-16 bg-amber-600 text-white'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-12 items-center'>
            <div>
              <h2 className='text-3xl font-bold mb-6'>Visit Us Today</h2>
              <p className='mb-8 text-amber-100'>
                We&apos;re conveniently located in the heart of the city. Come experience the best Vietnamese cuisine!
              </p>
              <div className='flex items-start mb-4'>
                <MapPin className='h-5 w-5 mr-3 mt-0.5 text-amber-200' />
                <p>123 Restaurant Street, Ho Chi Minh City, Vietnam</p>
              </div>
              <div className='flex items-start mb-4'>
                <Clock className='h-5 w-5 mr-3 mt-0.5 text-amber-200' />
                <div>
                  <p className='font-medium'>Opening Hours:</p>
                  <p>Monday - Sunday: 10:00 AM - 10:00 PM</p>
                </div>
              </div>
              <Button className='mt-4 bg-white text-amber-600 hover:bg-amber-100'>Get Directions</Button>
            </div>
            <div className='rounded-xl overflow-hidden shadow-lg h-[300px] relative'>
              <Image
                src='/footer.png'
                width={800}
                height={600}
                quality={90}
                alt='Restaurant Interior'
                className='w-full h-full object-cover'
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-900 text-white py-12'>
        <div className='container mx-auto px-4'>
          <div className='text-center'>
            <h2 className='text-2xl font-bold mb-6'>QRMeal Restaurant</h2>
            <p className='mb-8 max-w-md mx-auto text-gray-400'>
              Bringing the authentic taste of Vietnam to your table since 2010
            </p>
            <div className='flex justify-center space-x-4 mb-8'>{/* Social media icons would go here */}</div>
            <p className='text-sm text-gray-500'>
              © {new Date().getFullYear()} QRMeal Restaurant. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
