'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Search, Filter, Star, Plus, Minus, ChefHat, MapPin, Package, Truck, Camera } from 'lucide-react'
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
import { DishReviewsModal } from '@/components/dish-reviews-modal'
import { DishResType } from '@/schemaValidations/dish.schema'
import { ImageSearchModal } from '@/components/image-search-modal'
import { DishRecommendations } from '@/components/dish-recommendations'
import { useTranslations } from 'next-intl'

export default function MenuPage() {
  const params = useParams()
  const router = useRouter()
  const orderType = params.type as string
  const t = useTranslations('customerMenu')
  const tCommon = useTranslations('common')
  const tMenu = useTranslations('menu')

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
  const [selectedDish, setSelectedDish] = useState<DishResType['result'] | null>(null)
  const [showImageSearch, setShowImageSearch] = useState(false)

  const sortOptions = [
    { value: 'popular', label: t('popular') },
    { value: 'price-low', label: t('priceLowToHigh') },
    { value: 'price-high', label: t('priceHighToLow') },
    { value: 'rating', label: t('ratingHighToLow') },
    { value: 'newest', label: t('newest') }
  ]

  // Order type specific configurations
  const orderTypeConfig = {
    'dine-in': {
      title: t('dineInTitle'),
      description: t('dineInDesc'),
      icon: MapPin,
      color: 'text-blue-600',
      features: [t('deliveryToTable'), t('freshFood'), t('onSiteExperience')]
    },
    takeaway: {
      title: t('takeawayTitle'),
      description: t('takeawayDesc'),
      icon: Package,
      color: 'text-orange-600',
      features: [t('preOrder'), t('fastPickup'), t('freshFood')]
    },
    delivery: {
      title: t('deliveryTitle'),
      description: t('deliveryDesc'),
      icon: Truck,
      color: 'text-green-600',
      features: [t('deliveryToDoor'), t('flexiblePayment'), t('orderTracking')]
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
    <div className='container mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-24 sm:pb-6'>
      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center gap-3 mb-4'>
          <div className={`p-2 rounded-lg bg-muted`}>
            <currentConfig.icon className={`h-6 w-6 ${currentConfig.color}`} />
          </div>
          <div className='flex-1 min-w-0'>
            <h1 className='text-2xl sm:text-3xl font-bold truncate'>{currentConfig.title}</h1>
            <p className='text-muted-foreground text-sm sm:text-base'>{currentConfig.description}</p>
          </div>
        </div>

        {/* Table Info for Dine-in */}
        {orderType === 'dine-in' && tableInfo && (
          <div className='flex items-center gap-2 p-2 sm:p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg'>
            <MapPin className='h-4 w-4 text-blue-600 flex-shrink-0' />
            <span className='text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-200 truncate'>
              {tableInfo.tableNumber} - {tableInfo.location} ({t('maxPeople', { count: tableInfo.capacity })})
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
      <div className='flex flex-col gap-3 md:gap-4 mb-8'>
        <div className='relative w-full'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10' />
          <Input
            placeholder={t('searchDishes')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-10 w-full'
          />
        </div>

        <div className='flex flex-col sm:flex-row gap-2'>
          <Button 
            variant='outline' 
            onClick={() => setShowImageSearch(true)} 
            className='gap-2 w-full sm:w-auto flex-shrink-0'
          >
            <Camera className='h-4 w-4' />
            <span className='hidden sm:inline'>{t('searchByImage')}</span>
            <span className='sm:hidden'>Tìm ảnh</span>
          </Button>

          <div className='flex gap-2 w-full sm:w-auto'>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className='flex-1 sm:w-48 min-w-0'>
                <SelectValue placeholder={t('sortBy')} />
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
                <Button variant='outline' className='flex-shrink-0'>
                  <Filter className='h-4 w-4 sm:mr-2' />
                  <span className='hidden sm:inline'>{tCommon('filter')}</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>{tCommon('filter')}</SheetTitle>
                </SheetHeader>
                <div className='space-y-4 '>
                  <div>
                    <h3 className='font-medium mb-3 pl-2'>{tCommon('category')}</h3>
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
                        <span>{tCommon('all')}</span>
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
      </div>

      {/* Categories */}
      <div className='mb-6 sm:mb-8'>
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className='flex flex-wrap w-full gap-1.5 sm:gap-2 h-auto p-1 overflow-x-auto'>
            <TabsTrigger value='all' className='text-xs sm:text-sm whitespace-nowrap px-2 sm:px-3'>
              {tCommon('all')}
            </TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category._id} value={category._id} className='text-xs sm:text-sm whitespace-nowrap px-2 sm:px-3'>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* 👉 GỢI Ý MÓN CHO CUSTOMER HIỆN TẠI */}
      <div className='mb-8'>
        <DishRecommendations
          onSelectDish={(dish) => {
            addToCart(dish._id)
            const element = document.getElementById(`dish-${dish._id}`)
            element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }}
        />
      </div>

      {/* Dishes Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8'>
        {sortedDishes.map((dish) => (
          <Card key={dish._id} className='overflow-hidden hover:shadow-lg transition-shadow' id={`dish-${dish._id}`}>
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
                {categories.find((c) => c._id === dish.category_id)?.name || t('other')}
              </Badge>
            </div>

            <CardContent className='p-3 sm:p-4'>
              <div className='flex items-start justify-between mb-2 gap-2'>
                <h3 className='font-semibold text-base sm:text-lg flex-1 min-w-0'>{dish.name}</h3>
                <div className='flex items-center gap-1 flex-shrink-0'>
                  <button
                    onClick={() => setSelectedDish(dish)}
                    className='flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors'
                  >
                    <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                    <span className='text-sm font-medium'>{dish.avg_rating?.toFixed(1) || '0.0'}</span>
                  </button>
                </div>
              </div>

              <p className='text-muted-foreground text-sm mb-3 line-clamp-2'>{dish.description}</p>

              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-2'>
                  <span className='text-base sm:text-lg font-bold text-primary'>{dish.price.toLocaleString('vi-VN')}đ</span>
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
                    {tMenu('addToCart')}
                  </Button>
                )}
              </div>
            </CardContent>
            {selectedDish && (
              <DishReviewsModal dish={selectedDish} isOpen={true} onClose={() => setSelectedDish(null)} />
            )}
          </Card>
        ))}
      </div>

      {/* Cart Summary - Fixed Bottom on Mobile */}
      {getCartItemCount() > 0 && (
        <div className='fixed bottom-16 left-0 right-0 md:bottom-0 md:relative bg-background border-t border-border p-3 sm:p-4 md:p-0 md:border-0 z-50 md:z-auto'>
          <div className='container mx-auto'>
            <Card>
              <CardContent className='p-3 sm:p-4'>
                <div className='flex items-center justify-between gap-2 sm:gap-4'>
                  <div className='flex items-center gap-2 sm:gap-4 min-w-0 flex-1'>
                    <div className='relative flex-shrink-0'>
                      <ChefHat className='h-5 w-5 sm:h-6 sm:w-6' />
                      <Badge className='absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center'>
                        {getCartItemCount()}
                      </Badge>
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='font-medium text-sm sm:text-base truncate'>{getCartItemCount()} {tCommon('items')}</p>
                      <p className='text-xs sm:text-sm text-muted-foreground truncate'>{tCommon('total')}: {getCartTotal().toLocaleString('vi-VN')}đ</p>
                    </div>
                  </div>
                  <Button size='sm' className='sm:size-lg flex-shrink-0' onClick={handleProceedToCheckout}>
                    <ChefHat className='h-4 w-4 mr-1 sm:mr-2' />
                    <span className='hidden sm:inline'>{tCommon('continue')}</span>
                    <span className='sm:hidden'>Tiếp</span>
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
          <h3 className='text-lg font-medium mb-2'>{t('noDishFound')}</h3>
          <p className='text-muted-foreground mb-4'>{t('tryChanging')}</p>
          <Button
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
            }}
          >
            {t('clearFilters')}
          </Button>
        </div>
      )}

      <ImageSearchModal
        isOpen={showImageSearch}
        onClose={() => setShowImageSearch(false)}
        onDishSelect={(dish) => {
          // Tự động thêm vào cart hoặc scroll đến món đó
          addToCart(dish._id)
          // Hoặc scroll đến món đó trong danh sách
          const element = document.getElementById(`dish-${dish._id}`)
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }}
      />
    </div>
  )
}
