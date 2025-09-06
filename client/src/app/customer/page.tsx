'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Star, Clock, MapPin, ChefHat, Award, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RestaurantInfo } from '@/components/restaurant-info'
import { useCategoryListQuery } from '@/queries/useCategory'
import { useDishListQuery } from '@/queries/useDish'

const promotions = [
  {
    id: '1',
    title: 'Giảm 20% cho đơn hàng đầu tiên',
    description: 'Áp dụng cho khách hàng mới',
    discount: '20%',
    validUntil: '31/12/2024'
  },
  {
    id: '2',
    title: 'Mua 2 tặng 1',
    description: 'Áp dụng cho tất cả món ăn',
    discount: '50%',
    validUntil: '15/01/2025'
  }
]

export default function CustomerHomePage() {
  const { data: categoriesData } = useCategoryListQuery()
  const { data: dishesData } = useDishListQuery()
  const [searchQuery, setSearchQuery] = useState('')
  const categories = categoriesData?.payload.result || []
  const dishes = dishesData?.payload.result || []
  const featuredDishes = dishes.slice(0, 6) // Lấy 6 món nổi bật đầu tiên
  return (
    <div className='container mx-auto px-4 py-6 space-y-8'>
      {/* Hero Section */}
      <div className='relative rounded-2xl overflow-hidden bg-gradient-to-r from-orange-500 to-red-500 text-white'>
        <div className='absolute inset-0 bg-black/20' />
        <div className='relative p-8 md:p-12'>
          <div className='max-w-2xl'>
            <h1 className='text-3xl md:text-5xl font-bold mb-4'>Welcome to QRMeal</h1>
            <p className='text-lg md:text-xl mb-6 opacity-90'>Enjoy the best dishes with dedicated service</p>
            <div className='flex flex-col sm:flex-row gap-4'>
              <Button size='lg' className=''>
                <ChefHat className='mr-2 h-5 w-5' />
                View Menu
              </Button>
              <Button size='lg' variant='secondary' className=''>
                <MapPin className='mr-2 h-5 w-5' />
                Find Restaurant
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className='relative max-w-2xl mx-auto'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
        <Input
          placeholder='Search for food, restaurants...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='pl-10 h-12 text-lg'
        />
      </div>

      {/* Restaurant Info */}
      <RestaurantInfo />

      {/* Categories */}
      <div>
        <h2 className='text-2xl font-bold mb-6'>Categories</h2>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {categories.map((category) => (
            <Link key={category.name} href={`/customer/menu?category=${category.name}`}>
              <Card className='hover:shadow-lg transition-shadow cursor-pointer'>
                <CardContent className='p-6 text-center'>
                  <h3 className='font-medium mb-1'>{category.name}</h3>
                  <p className='text-sm text-muted-foreground'>{category.dish_count} dishes</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Dishes */}
      <div>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold'>Outstanding Dishes</h2>
          <Link href='/customer/menu'>
            <Button variant='outline'>View All</Button>
          </Link>
        </div>
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {featuredDishes.map((dish) => (
            <Card key={dish._id} className='overflow-hidden hover:shadow-lg transition-shadow'>
              <div className='relative'>
                <Image
                  src={dish.image || ''}
                  alt={dish.name}
                  width={300}
                  height={200}
                  className='w-full h-48 object-cover'
                />
                <Badge className='absolute top-2 left-2 bg-red-500'>{dish.status}</Badge>
                <Badge variant='secondary' className='absolute top-2 right-2'>
                  {dish.category_name || 'Uncategorized'}
                </Badge>
              </div>
              <CardContent className='p-4'>
                <div className='flex items-start justify-between mb-2'>
                  <h3 className='font-semibold text-lg'>{dish.name}</h3>
                  <div className='flex items-center gap-1'>
                    <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                    <span className='text-sm font-medium'>{dish.avg_rating}</span>
                  </div>
                </div>
                <p className='text-muted-foreground text-sm mb-3 line-clamp-2'>{dish.description}</p>
                <div className='flex items-center justify-between'>
                  <span className='text-lg font-bold text-primary'>{dish.price.toLocaleString('vi-VN')}đ</span>
                  <Button size='sm'>Add to Cart</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Promotions */}
      <div>
        <h2 className='text-2xl font-bold mb-6'>Khuyến mãi hôm nay</h2>
        <div className='grid md:grid-cols-2 gap-6'>
          {promotions.map((promo) => (
            <Card key={promo.id} className='border-orange-200 bg-orange-50 dark:bg-orange-950/20'>
              <CardContent className='p-6'>
                <div className='flex items-start justify-between mb-4'>
                  <div>
                    <h3 className='font-semibold text-lg mb-2'>{promo.title}</h3>
                    <p className='text-muted-foreground'>{promo.description}</p>
                  </div>
                  <Badge className='bg-orange-500 text-white text-lg px-3 py-1'>-{promo.discount}</Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>Có hiệu lực đến: {promo.validUntil}</span>
                  <Button size='sm' variant='outline'>
                    Sử dụng ngay
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
          <CardDescription>Dễ dàng truy cập các tính năng chính</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <Link href='/customer/menu'>
              <Button variant='outline' className='w-full h-20 flex-col gap-2'>
                <ChefHat className='h-6 w-6' />
                <span>Xem thực đơn</span>
              </Button>
            </Link>
            <Link href='/customer/orders'>
              <Button variant='outline' className='w-full h-20 flex-col gap-2'>
                <Clock className='h-6 w-6' />
                <span>Theo dõi đơn hàng</span>
              </Button>
            </Link>
            <Link href='/customer/promotions'>
              <Button variant='outline' className='w-full h-20 flex-col gap-2'>
                <Award className='h-6 w-6' />
                <span>Khuyến mãi</span>
              </Button>
            </Link>
            <Link href='/customer/account/profile'>
              <Button variant='outline' className='w-full h-20 flex-col gap-2'>
                <Users className='h-6 w-6' />
                <span>Tài khoản</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
