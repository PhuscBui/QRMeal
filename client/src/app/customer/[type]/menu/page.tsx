'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, Filter, Star, Plus, Minus, ChefHat, MapPin, Package, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useCategoryListQuery } from '@/queries/useCategory'
import { useDishListQuery } from '@/queries/useDish'
import { TableInfo } from '@/types/common.type'

const sortOptions = [
  { value: 'popular', label: 'Popular' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating: High to Low' },
  { value: 'newest', label: 'Newest' }
]

export default function MenuPage() {
  const params = useParams()
  const router = useRouter()
  const orderType = params.type as string

  const { data: categoriesData } = useCategoryListQuery()
  const { data: dishesData } = useDishListQuery()
  const categories = categoriesData?.payload.result || []
  const dishes = dishesData?.payload.result || []

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [cart, setCart] = useState<Record<string, number>>({})
  const [showFilters, setShowFilters] = useState(false)
  const [tableInfo, setTableInfo] = useState<TableInfo | null>(null)

  // Order type specific configurations
  const orderTypeConfig = {
    'dine-in': {
      title: 'Menu - Eat at the restaurant',
      description: 'Choose and enjoy at the restaurant',
      icon: MapPin,
      color: 'text-blue-600',
      features: ['Delivery to your table', 'Fresh food', 'On-site experience']
    },
    takeaway: {
      title: 'Menu - Take away',
      description: 'Order and pick up at the restaurant',
      icon: Package,
      color: 'text-orange-600',
      features: ['Pre-order', 'Fast pick up', 'Fresh food']
    },
    delivery: {
      title: 'Menu - Delivery',
      description: 'Order and deliver',
      icon: Truck,
      color: 'text-green-600',
      features: ['Delivery to your door', 'Flexible payment', 'Order tracking row']
    }
  }

  const currentConfig = orderTypeConfig[orderType as keyof typeof orderTypeConfig]

  useEffect(() => {
    // Load table info for dine-in orders
    if (orderType === 'dine-in') {
      const storedTableInfo = localStorage.getItem('tableInfo')
      if (storedTableInfo) {
        setTableInfo(JSON.parse(storedTableInfo))
      } else {
        // Redirect to scan QR if no table info
        router.push('/customer/scan-qr')
      }
    }
  }, [orderType, router])

  const filteredDishes = dishes.filter((dish) => {
    const matchesSearch =
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || dish.category_id === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedDishes = [...filteredDishes].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'rating':
        return (b.avg_rating || 0) - (a.avg_rating || 0)
      case 'newest':
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      case 'popular':
      default:
        return (b.avg_rating || 0) - (a.avg_rating || 0) // Default to rating for popular
    }
  })

  const addToCart = (dishId: string) => {
    setCart((prev) => ({
      ...prev,
      [dishId]: (prev[dishId] || 0) + 1
    }))
  }

  const removeFromCart = (dishId: string) => {
    setCart((prev) => {
      const newCart = { ...prev }
      if (newCart[dishId] > 1) {
        newCart[dishId] -= 1
      } else {
        delete newCart[dishId]
      }
      return newCart
    })
  }

  const getCartItemCount = () => {
    return Object.values(cart).reduce((sum, count) => sum + count, 0)
  }

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [dishId, count]) => {
      const dish = dishes.find((d) => d._id === dishId)
      return total + (dish ? dish.price * count : 0)
    }, 0)
  }

  const handleProceedToCheckout = () => {
    // Store cart data for checkout
    localStorage.setItem('cart', JSON.stringify(cart))
    localStorage.setItem('orderType', orderType)
    router.push(`/customer/${orderType}/checkout`)
  }

  return (
    <div className='container mx-auto px-4 py-6'>
      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center gap-3 mb-4'>
          <div className={`p-2 rounded-lg bg-muted`}>
            <currentConfig.icon className={`h-6 w-6 ${currentConfig.color}`} />
          </div>
          <div>
            <h1 className='text-3xl font-bold'>{currentConfig.title}</h1>
            <p className='text-muted-foreground'>{currentConfig.description}</p>
          </div>
        </div>

        {/* Table Info for Dine-in */}
        {orderType === 'dine-in' && tableInfo && (
          <div className='flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg'>
            <MapPin className='h-4 w-4 text-blue-600' />
            <span className='text-sm font-medium text-blue-800 dark:text-blue-200'>
              {tableInfo.tableNumber} - {tableInfo.location} (Tối đa {tableInfo.capacity} người)
            </span>
          </div>
        )}

        {/* Order Type Features */}
        <div className='flex flex-wrap gap-2 mt-4'>
          {currentConfig.features.map((feature, index) => (
            <Badge key={index} variant='secondary' className='text-xs'>
              {feature}
            </Badge>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className='flex flex-col md:flex-row gap-4 mb-8'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
          <Input
            placeholder='Search for dishes...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-10'
          />
        </div>

        <div className='flex gap-2'>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className='w-48'>
              <SelectValue placeholder='Sắp xếp theo' />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant='outline'>
                <Filter className='h-4 w-4 mr-2' />
                Filter
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter</SheetTitle>
              </SheetHeader>
              <div className='space-y-4 '>
                <div>
                  <h3 className='font-medium mb-3 pl-2'>Category</h3>
                  <div className='space-y-2 pl-2'>
                    <label className='flex items-center space-x-2'>
                      <input
                        type='radio'
                        name='category'
                        value='all'
                        checked={selectedCategory === 'all'}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className='rounded'
                      />
                      <span>All</span>
                    </label>
                    {categories.map((category) => (
                      <label key={category._id} className='flex items-center space-x-2'>
                        <input
                          type='radio'
                          name='category'
                          value={category._id}
                          checked={selectedCategory === category._id}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className='rounded'
                        />
                        <span>
                          {category.name} ({category.dish_count || 0})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Categories */}
      <div className='mb-8'>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className='grid w-full grid-cols-2 md:grid-cols-6'>
            <TabsTrigger value='all' className='text-sm'>
              All
            </TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category._id} value={category._id} className='text-sm'>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Dishes Grid */}
      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
        {sortedDishes.map((dish) => (
          <Card key={dish._id} className='overflow-hidden hover:shadow-lg transition-shadow'>
            <div className='relative'>
              <Image
                src={dish.image || '/placeholder.svg?height=200&width=300&query=delicious food dish'}
                alt={dish.name}
                width={300}
                height={200}
                className='w-full h-48 object-cover'
              />
              <div className='absolute top-2 left-2 flex gap-2'>
                <Badge className='bg-red-500'>{dish.status}</Badge>
              </div>
              <Badge variant='secondary' className='absolute top-2 right-2'>
                {categories.find((c) => c._id === dish.category_id)?.name || 'Khác'}
              </Badge>
            </div>

            <CardContent className='p-4'>
              <div className='flex items-start justify-between mb-2'>
                <h3 className='font-semibold text-lg'>{dish.name}</h3>
                <div className='flex items-center gap-1'>
                  <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                  <span className='text-sm font-medium'>{dish.avg_rating?.toFixed(1) || '0.0'}</span>
                </div>
              </div>

              <p className='text-muted-foreground text-sm mb-3 line-clamp-2'>{dish.description}</p>

              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-2'>
                  <span className='text-lg font-bold text-primary'>{dish.price.toLocaleString('vi-VN')}đ</span>
                  <span className='text-sm text-muted-foreground line-through'>
                    {dish.price.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>

              <div className='flex items-center justify-between'>
                {cart[dish._id] ? (
                  <div className='flex items-center gap-2'>
                    <Button size='sm' variant='outline' onClick={() => removeFromCart(dish._id)}>
                      <Minus className='h-4 w-4' />
                    </Button>
                    <span className='font-medium'>{cart[dish._id]}</span>
                    <Button size='sm' variant='outline' onClick={() => addToCart(dish._id)}>
                      <Plus className='h-4 w-4' />
                    </Button>
                  </div>
                ) : (
                  <Button size='sm' onClick={() => addToCart(dish._id)} className='w-full'>
                    <Plus className='h-4 w-4 mr-2' />
                    Add to Cart
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cart Summary - Fixed Bottom on Mobile */}
      {getCartItemCount() > 0 && (
        <div className='fixed bottom-16 left-0 right-0 md:bottom-0 md:relative bg-background border-t border-border p-4 md:p-0 md:border-0'>
          <div className='container mx-auto'>
            <Card>
              <CardContent className='p-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <div className='relative'>
                      <ChefHat className='h-6 w-6' />
                      <Badge className='absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center'>
                        {getCartItemCount()}
                      </Badge>
                    </div>
                    <div>
                      <p className='font-medium'>{getCartItemCount()} items</p>
                      <p className='text-sm text-muted-foreground'>Total: {getCartTotal().toLocaleString('vi-VN')}đ</p>
                    </div>
                  </div>
                  <Button size='lg' className='md:w-auto w-auto' onClick={handleProceedToCheckout}>
                    <ChefHat className='h-4 w-4 mr-2' />
                    Thanh toán
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Empty State */}
      {sortedDishes.length === 0 && (
        <div className='text-center py-12'>
          <ChefHat className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
          <h3 className='text-lg font-medium mb-2'>No dish found</h3>
          <p className='text-muted-foreground mb-4'>Try changing your search keywords or filters</p>
          <Button
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
            }}
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  )
}
