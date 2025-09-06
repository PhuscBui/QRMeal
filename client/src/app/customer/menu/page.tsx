'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Search, Filter, Star, Plus, Minus, ChefHat, Clock, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

// Mock data - sẽ được thay thế bằng API thực tế
const categories = [
  { id: 'all', name: 'Tất cả', count: 72 },
  { id: 'main', name: 'Món chính', count: 25 },
  { id: 'appetizer', name: 'Khai vị', count: 15 },
  { id: 'dessert', name: 'Tráng miệng', count: 12 },
  { id: 'beverage', name: 'Đồ uống', count: 20 }
]

const dishes = [
  {
    id: '1',
    name: 'Phở Bò Tái',
    description: 'Phở bò truyền thống với thịt bò tái tươi ngon, nước dùng đậm đà',
    price: 45000,
    originalPrice: 50000,
    image: '/api/placeholder/300/200',
    rating: 4.8,
    reviewCount: 234,
    category: 'main',
    isPopular: true,
    isNew: false,
    prepTime: '15 phút',
    calories: 450,
    ingredients: ['Bánh phở', 'Thịt bò tái', 'Hành tây', 'Rau thơm'],
    allergens: ['Gluten', 'Sữa']
  },
  {
    id: '2',
    name: 'Bún Chả Hà Nội',
    description: 'Bún chả đặc sản Hà Nội với thịt nướng thơm ngon, nước mắm chua ngọt',
    price: 55000,
    originalPrice: 60000,
    image: '/api/placeholder/300/200',
    rating: 4.9,
    reviewCount: 189,
    category: 'main',
    isPopular: true,
    isNew: false,
    prepTime: '20 phút',
    calories: 520,
    ingredients: ['Bún tươi', 'Thịt nướng', 'Nước mắm', 'Rau sống'],
    allergens: ['Cá']
  },
  {
    id: '3',
    name: 'Gỏi Cuốn Tôm Thịt',
    description: 'Gỏi cuốn tươi mát với tôm và thịt, chấm nước mắm chua ngọt',
    price: 35000,
    originalPrice: 40000,
    image: '/api/placeholder/300/200',
    rating: 4.7,
    reviewCount: 156,
    category: 'appetizer',
    isPopular: false,
    isNew: true,
    prepTime: '10 phút',
    calories: 280,
    ingredients: ['Bánh tráng', 'Tôm', 'Thịt', 'Rau sống'],
    allergens: ['Tôm', 'Cá']
  },
  {
    id: '4',
    name: 'Chè Ba Màu',
    description: 'Chè truyền thống với 3 màu đẹp mắt, vị ngọt thanh',
    price: 25000,
    originalPrice: 30000,
    image: '/api/placeholder/300/200',
    rating: 4.6,
    reviewCount: 98,
    category: 'dessert',
    isPopular: false,
    isNew: false,
    prepTime: '5 phút',
    calories: 180,
    ingredients: ['Đậu xanh', 'Đậu đỏ', 'Thạch dừa', 'Nước cốt dừa'],
    allergens: ['Đậu']
  }
]

const sortOptions = [
  { value: 'popular', label: 'Phổ biến' },
  { value: 'price-low', label: 'Giá thấp đến cao' },
  { value: 'price-high', label: 'Giá cao đến thấp' },
  { value: 'rating', label: 'Đánh giá cao' },
  { value: 'newest', label: 'Mới nhất' }
]

export default function MenuPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [cart, setCart] = useState<Record<string, number>>({})
  const [showFilters, setShowFilters] = useState(false)

  const filteredDishes = dishes.filter((dish) => {
    const matchesSearch =
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || dish.category === selectedCategory
    return matchesSearch && matchesCategory
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
      const dish = dishes.find((d) => d.id === dishId)
      return total + (dish ? dish.price * count : 0)
    }, 0)
  }

  return (
    <div className='container mx-auto px-4 py-6'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Thực đơn</h1>
        <p className='text-muted-foreground'>Khám phá những món ăn ngon nhất của chúng tôi</p>
      </div>

      {/* Search and Filters */}
      <div className='flex flex-col md:flex-row gap-4 mb-8'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
          <Input
            placeholder='Tìm kiếm món ăn...'
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
                Bộ lọc
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Bộ lọc</SheetTitle>
              </SheetHeader>
              <div className='space-y-4 mt-6'>
                <div>
                  <h3 className='font-medium mb-3'>Danh mục</h3>
                  <div className='space-y-2'>
                    {categories.map((category) => (
                      <label key={category.id} className='flex items-center space-x-2'>
                        <input
                          type='radio'
                          name='category'
                          value={category.id}
                          checked={selectedCategory === category.id}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className='rounded'
                        />
                        <span>
                          {category.name} ({category.count})
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
          <TabsList className='grid w-full grid-cols-2 md:grid-cols-5'>
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className='text-sm'>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Dishes Grid */}
      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
        {filteredDishes.map((dish) => (
          <Card key={dish.id} className='overflow-hidden hover:shadow-lg transition-shadow'>
            <div className='relative'>
              <Image src={dish.image} alt={dish.name} width={300} height={200} className='w-full h-48 object-cover' />
              <div className='absolute top-2 left-2 flex gap-2'>
                {dish.isPopular && (
                  <Badge className='bg-red-500'>
                    <Flame className='h-3 w-3 mr-1' />
                    Phổ biến
                  </Badge>
                )}
                {dish.isNew && <Badge className='bg-green-500'>Mới</Badge>}
              </div>
              <Badge variant='secondary' className='absolute top-2 right-2'>
                {categories.find((c) => c.id === dish.category)?.name}
              </Badge>
            </div>

            <CardContent className='p-4'>
              <div className='flex items-start justify-between mb-2'>
                <h3 className='font-semibold text-lg'>{dish.name}</h3>
                <div className='flex items-center gap-1'>
                  <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                  <span className='text-sm font-medium'>{dish.rating}</span>
                  <span className='text-xs text-muted-foreground'>({dish.reviewCount})</span>
                </div>
              </div>

              <p className='text-muted-foreground text-sm mb-3 line-clamp-2'>{dish.description}</p>

              <div className='flex items-center gap-4 text-xs text-muted-foreground mb-3'>
                <div className='flex items-center gap-1'>
                  <Clock className='h-3 w-3' />
                  {dish.prepTime}
                </div>
                <div>{dish.calories} cal</div>
              </div>

              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-2'>
                  <span className='text-lg font-bold text-primary'>{dish.price.toLocaleString('vi-VN')}đ</span>
                  {dish.originalPrice > dish.price && (
                    <span className='text-sm text-muted-foreground line-through'>
                      {dish.originalPrice.toLocaleString('vi-VN')}đ
                    </span>
                  )}
                </div>
              </div>

              <div className='flex items-center justify-between'>
                {cart[dish.id] ? (
                  <div className='flex items-center gap-2'>
                    <Button size='sm' variant='outline' onClick={() => removeFromCart(dish.id)}>
                      <Minus className='h-4 w-4' />
                    </Button>
                    <span className='font-medium'>{cart[dish.id]}</span>
                    <Button size='sm' variant='outline' onClick={() => addToCart(dish.id)}>
                      <Plus className='h-4 w-4' />
                    </Button>
                  </div>
                ) : (
                  <Button size='sm' onClick={() => addToCart(dish.id)} className='w-full'>
                    <Plus className='h-4 w-4 mr-2' />
                    Thêm vào giỏ
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
                      <p className='font-medium'>{getCartItemCount()} món trong giỏ</p>
                      <p className='text-sm text-muted-foreground'>Tổng: {getCartTotal().toLocaleString('vi-VN')}đ</p>
                    </div>
                  </div>
                  <Button size='lg' className='md:w-auto w-full'>
                    Xem giỏ hàng
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredDishes.length === 0 && (
        <div className='text-center py-12'>
          <ChefHat className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
          <h3 className='text-lg font-medium mb-2'>Không tìm thấy món ăn</h3>
          <p className='text-muted-foreground mb-4'>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
          <Button
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
            }}
          >
            Xóa bộ lọc
          </Button>
        </div>
      )}
    </div>
  )
}
