'use client'

import React, { useState } from 'react'
import { TrendingUp, TrendingDown, Star, Package, CreditCard, ChefHat, Award } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'

// Mock data for analytics
const analyticsData = {
  overview: {
    totalOrders: 45,
    totalSpent: 2500000,
    averageOrderValue: 55556,
    favoriteRestaurant: 'QRMeal Restaurant',
    memberSince: '2023-01-15',
    loyaltyLevel: 'Gold',
    loyaltyPoints: 1250
  },
  monthlyStats: {
    currentMonth: {
      orders: 8,
      spent: 450000,
      averageRating: 4.8,
      favoriteCategory: 'Món chính'
    },
    previousMonth: {
      orders: 12,
      spent: 680000,
      averageRating: 4.6,
      favoriteCategory: 'Đồ uống'
    }
  },
  orderTypes: [
    { type: 'dine-in', count: 20, percentage: 44, color: 'bg-blue-500' },
    { type: 'takeaway', count: 15, percentage: 33, color: 'bg-orange-500' },
    { type: 'delivery', count: 10, percentage: 23, color: 'bg-green-500' }
  ],
  favoriteCategories: [
    { name: 'Món chính', count: 25, percentage: 45 },
    { name: 'Đồ uống', count: 15, percentage: 27 },
    { name: 'Tráng miệng', count: 10, percentage: 18 },
    { name: 'Khai vị', count: 5, percentage: 10 }
  ],
  spendingPattern: [
    { month: 'T1', amount: 450000 },
    { month: 'T2', amount: 380000 },
    { month: 'T3', amount: 520000 },
    { month: 'T4', amount: 480000 },
    { month: 'T5', amount: 610000 },
    { month: 'T6', amount: 550000 }
  ],
  recentOrders: [
    {
      id: 'ORD-001',
      date: '2024-01-15',
      total: 185000,
      rating: 5,
      items: ['Phở Bò Tái', 'Bún Chả Hà Nội']
    },
    {
      id: 'ORD-002',
      date: '2024-01-10',
      total: 125000,
      rating: 4,
      items: ['Chè Ba Màu', 'Cà phê sữa đá']
    },
    {
      id: 'ORD-003',
      date: '2024-01-05',
      total: 95000,
      rating: 5,
      items: ['Bún Bò Huế', 'Nước ngọt']
    }
  ],
  achievements: [
    {
      id: '1',
      title: 'Khách hàng thân thiết',
      description: 'Đã đặt 50+ đơn hàng',
      icon: Award,
      unlocked: true,
      progress: 100
    },
    {
      id: '2',
      title: 'Người sành ăn',
      description: 'Đã thử 20+ món khác nhau',
      icon: ChefHat,
      unlocked: true,
      progress: 100
    },
    {
      id: '3',
      title: 'VIP Member',
      description: 'Đạt cấp độ VIP',
      icon: Star,
      unlocked: false,
      progress: 75
    },
    {
      id: '4',
      title: 'Tiết kiệm',
      description: 'Tiết kiệm 1,000,000đ từ khuyến mãi',
      icon: CreditCard,
      unlocked: false,
      progress: 60
    }
  ]
}

export default function OrderAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('6months')
  const [selectedTab, setSelectedTab] = useState('overview')

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ'
  }

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 100
    return Math.round(((current - previous) / previous) * 100)
  }

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? TrendingUp : TrendingDown
  }

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const ordersGrowth = calculateGrowth(
    analyticsData.monthlyStats.currentMonth.orders,
    analyticsData.monthlyStats.previousMonth.orders
  )
  const spendingGrowth = calculateGrowth(
    analyticsData.monthlyStats.currentMonth.spent,
    analyticsData.monthlyStats.previousMonth.spent
  )

  return (
    <div className='container mx-auto px-4 py-6 max-w-6xl'>
      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold mb-2'>Thống kê đơn hàng</h1>
            <p className='text-muted-foreground'>Phân tích thói quen đặt hàng của bạn</p>
          </div>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className='w-48'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='1month'>1 tháng qua</SelectItem>
              <SelectItem value='3months'>3 tháng qua</SelectItem>
              <SelectItem value='6months'>6 tháng qua</SelectItem>
              <SelectItem value='1year'>1 năm qua</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className='space-y-6'>
        <TabsList className='grid w-full grid-cols-2 md:grid-cols-4'>
          <TabsTrigger value='overview'>Tổng quan</TabsTrigger>
          <TabsTrigger value='spending'>Chi tiêu</TabsTrigger>
          <TabsTrigger value='preferences'>Sở thích</TabsTrigger>
          <TabsTrigger value='achievements'>Thành tích</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value='overview' className='space-y-6'>
          {/* Key Metrics */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-muted-foreground'>Tổng đơn hàng</p>
                    <p className='text-2xl font-bold'>{analyticsData.overview.totalOrders}</p>
                  </div>
                  <Package className='h-8 w-8 text-muted-foreground' />
                </div>
                <div className='flex items-center gap-1 mt-2'>
                  {React.createElement(getGrowthIcon(ordersGrowth), {
                    className: `h-4 w-4 ${getGrowthColor(ordersGrowth)}`
                  })}
                  <span className={`text-sm ${getGrowthColor(ordersGrowth)}`}>{Math.abs(ordersGrowth)}%</span>
                  <span className='text-sm text-muted-foreground'>so với tháng trước</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-muted-foreground'>Tổng chi tiêu</p>
                    <p className='text-2xl font-bold'>{formatCurrency(analyticsData.overview.totalSpent)}</p>
                  </div>
                  <CreditCard className='h-8 w-8 text-muted-foreground' />
                </div>
                <div className='flex items-center gap-1 mt-2'>
                  {React.createElement(getGrowthIcon(spendingGrowth), {
                    className: `h-4 w-4 ${getGrowthColor(spendingGrowth)}`
                  })}
                  <span className={`text-sm ${getGrowthColor(spendingGrowth)}`}>{Math.abs(spendingGrowth)}%</span>
                  <span className='text-sm text-muted-foreground'>so với tháng trước</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-muted-foreground'>Giá trị trung bình</p>
                    <p className='text-2xl font-bold'>{formatCurrency(analyticsData.overview.averageOrderValue)}</p>
                  </div>
                  <TrendingUp className='h-8 w-8 text-muted-foreground' />
                </div>
                <p className='text-sm text-muted-foreground mt-2'>Mỗi đơn hàng</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-muted-foreground'>Cấp độ thành viên</p>
                    <p className='text-2xl font-bold'>{analyticsData.overview.loyaltyLevel}</p>
                  </div>
                  <Award className='h-8 w-8 text-muted-foreground' />
                </div>
                <p className='text-sm text-muted-foreground mt-2'>{analyticsData.overview.loyaltyPoints} điểm</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Đơn hàng gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {analyticsData.recentOrders.map((order) => (
                  <div key={order.id} className='flex items-center justify-between p-4 border rounded-lg'>
                    <div>
                      <h4 className='font-medium'>#{order.id}</h4>
                      <p className='text-sm text-muted-foreground'>
                        {order.date} • {order.items.join(', ')}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='font-semibold'>{formatCurrency(order.total)}</p>
                      <div className='flex items-center gap-1'>
                        <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                        <span className='text-sm'>{order.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spending Tab */}
        <TabsContent value='spending' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Spending Pattern */}
            <Card>
              <CardHeader>
                <CardTitle>Xu hướng chi tiêu</CardTitle>
                <CardDescription>Chi tiêu theo tháng</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {analyticsData.spendingPattern.map((month, index) => (
                    <div key={index} className='space-y-2'>
                      <div className='flex justify-between text-sm'>
                        <span>{month.month}</span>
                        <span>{formatCurrency(month.amount)}</span>
                      </div>
                      <Progress
                        value={(month.amount / Math.max(...analyticsData.spendingPattern.map((m) => m.amount))) * 100}
                        className='h-2'
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Types */}
            <Card>
              <CardHeader>
                <CardTitle>Loại đơn hàng</CardTitle>
                <CardDescription>Phân bố theo loại đơn hàng</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {analyticsData.orderTypes.map((type, index) => (
                    <div key={index} className='space-y-2'>
                      <div className='flex justify-between text-sm'>
                        <span className='capitalize'>{type.type.replace('-', ' ')}</span>
                        <span>
                          {type.count} đơn ({type.percentage}%)
                        </span>
                      </div>
                      <Progress value={type.percentage} className='h-2' />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value='preferences' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Danh mục yêu thích</CardTitle>
              <CardDescription>Món ăn bạn thường đặt nhất</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {analyticsData.favoriteCategories.map((category, index) => (
                  <div key={index} className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span>{category.name}</span>
                      <span>
                        {category.count} món ({category.percentage}%)
                      </span>
                    </div>
                    <Progress value={category.percentage} className='h-2' />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value='achievements' className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {analyticsData.achievements.map((achievement) => {
              const Icon = achievement.icon
              return (
                <Card
                  key={achievement.id}
                  className={achievement.unlocked ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : ''}
                >
                  <CardContent className='p-6'>
                    <div className='flex items-start gap-4'>
                      <div
                        className={`p-3 rounded-full ${
                          achievement.unlocked ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <Icon className='h-6 w-6' />
                      </div>
                      <div className='flex-1'>
                        <h4 className='font-medium mb-2'>{achievement.title}</h4>
                        <p className='text-sm text-muted-foreground mb-3'>{achievement.description}</p>
                        <div className='space-y-2'>
                          <div className='flex justify-between text-sm'>
                            <span>Tiến độ</span>
                            <span>{achievement.progress}%</span>
                          </div>
                          <Progress value={achievement.progress} className='h-2' />
                        </div>
                        {achievement.unlocked && <Badge className='mt-2 bg-green-500 text-white'>Đã đạt được</Badge>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
