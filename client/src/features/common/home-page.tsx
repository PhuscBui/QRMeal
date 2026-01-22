import dishApiRequest from '@/apiRequests/dish'
import { formatCurrency } from '@/lib/utils'
import type { DishListResType } from '@/schemaValidations/dish.schema'
import Image from 'next/image'
import { ChefHat, Clock, Star, MapPin, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/routing'
import { getTranslations } from 'next-intl/server'

export default async function HomePage() {
  const t = await getTranslations('home')
  const tCommon = await getTranslations('common')

  let dishList: DishListResType['result'] = []
  try {
    const data = await dishApiRequest.list()
    const {
      payload: { result }
    } = data
    dishList = result
  } catch (error) {
    console.log(error)
    return <div>{tCommon('error')}</div>
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
            {t('title')}
          </h1>
          <p className='text-center text-lg sm:text-xl max-w-2xl mb-8 text-gray-100'>{t('subtitle')}</p>
          <div className='flex flex-col sm:flex-row gap-4'>
            <Link href='#dish'>
              <Button size='lg' className='bg-amber-500 hover:bg-amber-600 text-white'>
                {t('exploreMenu')}
              </Button>
            </Link>
            <Link href='/booking-tables'>
              <Button size='lg'>{t('bookTable')}</Button>
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
              <h3 className='text-lg font-semibold mb-2'>{t('masterChefs')}</h3>
              <p className='text-gray-600'>{t('masterChefsDesc')}</p>
            </div>
            <div className='bg-white p-6 rounded-xl shadow-sm flex flex-col items-center text-center'>
              <div className='bg-amber-100 p-3 rounded-full mb-4'>
                <Star className='h-6 w-6 text-amber-600' />
              </div>
              <h3 className='text-lg font-semibold mb-2'>{t('qualityFood')}</h3>
              <p className='text-gray-600'>{t('qualityFoodDesc')}</p>
            </div>
            <div className='bg-white p-6 rounded-xl shadow-sm flex flex-col items-center text-center'>
              <div className='bg-amber-100 p-3 rounded-full mb-4'>
                <Clock className='h-6 w-6 text-amber-600' />
              </div>
              <h3 className='text-lg font-semibold mb-2'>{t('fastService')}</h3>
              <p className='text-gray-600'>{t('fastServiceDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dishes Section */}
      <section id='dish' className='py-16 container mx-auto px-4'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold mb-4'>{t('ourDeliciousDishes')}</h2>
          <p className='text-gray-600 max-w-2xl mx-auto'>{t('dishesDescription')}</p>
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
                  {t('orderNow')} <ArrowRight className='h-4 w-4 ml-1' />
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
            <h2 className='text-3xl font-bold mb-4'>{t('whatCustomersSay')}</h2>
            <p className='text-gray-600 max-w-2xl mx-auto'>{t('whatCustomersSay')}</p>
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
                <p className='text-gray-600 mb-4 italic'>&quot;{t('customerTestimonial')}&quot;</p>
                <div className='flex items-center'>
                  <div className='w-10 h-10 bg-gray-200 rounded-full mr-3'></div>
                  <div>
                    <p className='font-medium'>
                      {tCommon('name')} {i}
                    </p>
                    <p className='text-sm text-gray-500'>{t('regularVisitor')}</p>
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
              <h2 className='text-3xl font-bold mb-6'>{t('visitToday')}</h2>
              <p className='mb-8 text-amber-100'>{t('visitDescription')}</p>
              <div className='flex items-start mb-4'>
                <MapPin className='h-5 w-5 mr-3 mt-0.5 text-amber-200' />
                <p>{t('address')}</p>
              </div>
              <div className='flex items-start mb-4'>
                <Clock className='h-5 w-5 mr-3 mt-0.5 text-amber-200' />
                <div>
                  <p className='font-medium'>{t('openingHours')}</p>
                  <p>{t('hours')}</p>
                </div>
              </div>
              <Button className='mt-4 bg-white text-amber-600 hover:bg-amber-100'>{t('getDirections')}</Button>
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
            <h2 className='text-2xl font-bold mb-6'>{t('title')}</h2>
            <p className='mb-8 max-w-md mx-auto text-gray-400'>{t('footerTagline')}</p>
            <div className='flex justify-center space-x-4 mb-8'>{/* Social media icons would go here */}</div>
            <p className='text-sm text-gray-500'>
              © {new Date().getFullYear()} {t('title')}. {t('allRightsReserved')}.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
