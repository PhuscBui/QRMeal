'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Gift, Star, Percent, Calendar, MapPin, Users, Award, Zap, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'

// Mock data - sẽ được thay thế bằng API thực tế
const promotions = [
  {
    id: '1',
    title: 'Giảm 20% cho đơn hàng đầu tiên',
    description: 'Áp dụng cho khách hàng mới, giảm tối đa 50,000đ',
    type: 'discount',
    discount: 20,
    maxDiscount: 50000,
    minOrder: 100000,
    validFrom: '2024-01-01',
    validTo: '2024-12-31',
    image: '/api/placeholder/400/200',
    isActive: true,
    isPopular: true,
    usageCount: 1250,
    totalUses: 2000,
    terms: [
      'Áp dụng cho khách hàng mới',
      'Giảm tối đa 50,000đ',
      'Đơn hàng tối thiểu 100,000đ',
      'Không áp dụng với khuyến mãi khác'
    ]
  },
  {
    id: '2',
    title: 'Mua 2 tặng 1 - Món chính',
    description: 'Mua 2 món chính bất kỳ, tặng 1 món chính có giá thấp nhất',
    type: 'buy2get1',
    discount: 50,
    validFrom: '2024-01-15',
    validTo: '2024-02-15',
    image: '/api/placeholder/400/200',
    isActive: true,
    isPopular: false,
    usageCount: 890,
    totalUses: 1500,
    terms: [
      'Áp dụng cho món chính',
      'Tặng món có giá thấp nhất',
      'Không áp dụng với combo',
      'Có thể kết hợp với khuyến mãi khác'
    ]
  },
  {
    id: '3',
    title: 'Freeship cho đơn hàng từ 200k',
    description: 'Miễn phí giao hàng cho đơn hàng từ 200,000đ',
    type: 'freeship',
    discount: 15000,
    minOrder: 200000,
    validFrom: '2024-01-01',
    validTo: '2024-06-30',
    image: '/api/placeholder/400/200',
    isActive: true,
    isPopular: true,
    usageCount: 2100,
    totalUses: 3000,
    terms: [
      'Đơn hàng tối thiểu 200,000đ',
      'Chỉ áp dụng giao hàng',
      'Không áp dụng với takeaway',
      'Có thể kết hợp với khuyến mãi khác'
    ]
  },
  {
    id: '4',
    title: 'Combo gia đình - Tiết kiệm 30%',
    description: 'Combo 4 món cho gia đình, tiết kiệm đến 30%',
    type: 'combo',
    discount: 30,
    originalPrice: 300000,
    salePrice: 210000,
    validFrom: '2024-01-20',
    validTo: '2024-02-20',
    image: '/api/placeholder/400/200',
    isActive: true,
    isPopular: false,
    usageCount: 450,
    totalUses: 800,
    terms: ['Combo cố định 4 món', 'Không thay đổi món trong combo', 'Chỉ áp dụng tại chỗ', 'Cần đặt trước 2 giờ']
  },
  {
    id: '5',
    title: 'Thẻ VIP - Ưu đãi đặc biệt',
    description: 'Thẻ VIP với nhiều ưu đãi độc quyền',
    type: 'vip',
    discount: 15,
    validFrom: '2024-01-01',
    validTo: '2024-12-31',
    image: '/api/placeholder/400/200',
    isActive: true,
    isPopular: true,
    usageCount: 320,
    totalUses: 500,
    terms: ['Giảm 15% tất cả món ăn', 'Ưu tiên giao hàng', 'Tặng món tráng miệng', 'Tích điểm gấp đôi']
  }
]

const loyaltyProgram = {
  currentPoints: 1250,
  nextLevelPoints: 2000,
  level: 'Gold',
  benefits: ['Giảm 5% tất cả đơn hàng', 'Tích điểm gấp 1.5x', 'Ưu tiên giao hàng', 'Tặng món tráng miệng']
}

const promotionTypes = {
  discount: { label: 'Giảm giá', icon: Percent, color: 'bg-red-500' },
  buy2get1: { label: 'Mua 2 tặng 1', icon: Gift, color: 'bg-green-500' },
  freeship: { label: 'Freeship', icon: MapPin, color: 'bg-blue-500' },
  combo: { label: 'Combo', icon: Users, color: 'bg-purple-500' },
  vip: { label: 'VIP', icon: Crown, color: 'bg-yellow-500' }
}

export default function PromotionsPage() {
  const [selectedTab, setSelectedTab] = useState('all')

  const filteredPromotions = promotions.filter((promo) => {
    if (selectedTab === 'all') return true
    return promo.type === selectedTab
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getPromotionTypeInfo = (type: string) => {
    return promotionTypes[type as keyof typeof promotionTypes] || promotionTypes.discount
  }

  const getUsagePercentage = (used: number, total: number) => {
    return Math.round((used / total) * 100)
  }

  return (
    <div className='container mx-auto px-4 py-6'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Khuyến mãi & Ưu đãi</h1>
        <p className='text-muted-foreground'>Khám phá những ưu đãi hấp dẫn dành cho bạn</p>
      </div>

      {/* Loyalty Program */}
      <Card className='mb-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-white'>
        <CardContent className='p-6'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <Crown className='h-8 w-8' />
              <div>
                <h3 className='text-xl font-bold'>Chương trình thành viên</h3>
                <p className='text-yellow-100'>Cấp độ: {loyaltyProgram.level}</p>
              </div>
            </div>
            <Badge className='bg-white text-orange-500 font-semibold'>{loyaltyProgram.currentPoints} điểm</Badge>
          </div>

          <div className='space-y-3'>
            <div className='flex justify-between text-sm'>
              <span>Tiến độ lên cấp tiếp theo</span>
              <span>
                {loyaltyProgram.currentPoints}/{loyaltyProgram.nextLevelPoints}
              </span>
            </div>
            <Progress
              value={getUsagePercentage(loyaltyProgram.currentPoints, loyaltyProgram.nextLevelPoints)}
              className='h-2 bg-white/20'
            />

            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-4'>
              {loyaltyProgram.benefits.map((benefit, index) => (
                <div key={index} className='flex items-center gap-2 text-sm'>
                  <Star className='h-4 w-4 fill-white' />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className='mb-8'>
        <TabsList className='grid w-full grid-cols-2 md:grid-cols-6'>
          <TabsTrigger value='all'>Tất cả</TabsTrigger>
          <TabsTrigger value='discount'>Giảm giá</TabsTrigger>
          <TabsTrigger value='buy2get1'>Mua 2 tặng 1</TabsTrigger>
          <TabsTrigger value='freeship'>Freeship</TabsTrigger>
          <TabsTrigger value='combo'>Combo</TabsTrigger>
          <TabsTrigger value='vip'>VIP</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Promotions Grid */}
      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
        {filteredPromotions.map((promo) => {
          const typeInfo = getPromotionTypeInfo(promo.type)
          const TypeIcon = typeInfo.icon
          const usagePercentage = getUsagePercentage(promo.usageCount, promo.totalUses)

          return (
            <Card key={promo.id} className='overflow-hidden hover:shadow-lg transition-shadow'>
              <div className='relative'>
                <Image
                  src={promo.image}
                  alt={promo.title}
                  width={400}
                  height={200}
                  className='w-full h-48 object-cover'
                />
                <div className='absolute top-3 left-3 flex gap-2'>
                  <Badge className={`${typeInfo.color} text-white`}>
                    <TypeIcon className='h-3 w-3 mr-1' />
                    {typeInfo.label}
                  </Badge>
                  {promo.isPopular && (
                    <Badge className='bg-red-500 text-white'>
                      <Zap className='h-3 w-3 mr-1' />
                      Hot
                    </Badge>
                  )}
                </div>
                <div className='absolute top-3 right-3'>
                  <Badge variant='secondary' className='bg-white/90 text-black'>
                    {promo.discount}%
                  </Badge>
                </div>
              </div>

              <CardContent className='p-4'>
                <h3 className='font-semibold text-lg mb-2'>{promo.title}</h3>
                <p className='text-muted-foreground text-sm mb-4 line-clamp-2'>{promo.description}</p>

                {/* Validity Period */}
                <div className='flex items-center gap-2 text-sm text-muted-foreground mb-4'>
                  <Calendar className='h-4 w-4' />
                  <span>
                    {formatDate(promo.validFrom)} - {formatDate(promo.validTo)}
                  </span>
                </div>

                {/* Usage Progress */}
                <div className='space-y-2 mb-4'>
                  <div className='flex justify-between text-sm'>
                    <span>Đã sử dụng</span>
                    <span>
                      {promo.usageCount}/{promo.totalUses}
                    </span>
                  </div>
                  <Progress value={usagePercentage} className='h-2' />
                </div>

                {/* Terms */}
                <div className='space-y-2 mb-4'>
                  <h4 className='font-medium text-sm'>Điều kiện:</h4>
                  <ul className='space-y-1'>
                    {promo.terms.slice(0, 2).map((term, index) => (
                      <li key={index} className='text-xs text-muted-foreground flex items-start gap-2'>
                        <span className='text-primary mt-1'>•</span>
                        <span>{term}</span>
                      </li>
                    ))}
                    {promo.terms.length > 2 && (
                      <li className='text-xs text-muted-foreground'>+{promo.terms.length - 2} điều kiện khác</li>
                    )}
                  </ul>
                </div>

                {/* Action Button */}
                <Button className='w-full' disabled={!promo.isActive}>
                  {promo.isActive ? 'Sử dụng ngay' : 'Hết hạn'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredPromotions.length === 0 && (
        <Card>
          <CardContent className='text-center py-12'>
            <Gift className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
            <h3 className='text-lg font-medium mb-2'>Không có khuyến mãi nào</h3>
            <p className='text-muted-foreground mb-4'>Hiện tại không có khuyến mãi nào trong danh mục này</p>
            <Button onClick={() => setSelectedTab('all')}>Xem tất cả khuyến mãi</Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <Button variant='outline' className='h-20 flex-col gap-2'>
              <Gift className='h-6 w-6' />
              <span className='text-sm'>Mã giảm giá</span>
            </Button>
            <Button variant='outline' className='h-20 flex-col gap-2'>
              <Award className='h-6 w-6' />
              <span className='text-sm'>Điểm thưởng</span>
            </Button>
            <Button variant='outline' className='h-20 flex-col gap-2'>
              <Crown className='h-6 w-6' />
              <span className='text-sm'>Thẻ VIP</span>
            </Button>
            <Button variant='outline' className='h-20 flex-col gap-2'>
              <Users className='h-6 w-6' />
              <span className='text-sm'>Mời bạn</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
