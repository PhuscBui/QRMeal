'use client'

import { useState } from 'react'
import { Edit, Save, X, Camera, Star, Award, Clock, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Mock data - sẽ được thay thế bằng API thực tế
const userProfile = {
  id: '1',
  name: 'Nguyễn Văn A',
  email: 'nguyenvana@email.com',
  phone: '0123456789',
  avatar: '/api/placeholder/100/100',
  dateOfBirth: '1990-01-01',
  gender: 'male',
  address: '123 Đường ABC, Quận 1, TP.HCM',
  joinDate: '2023-01-15',
  loyaltyLevel: 'Gold',
  loyaltyPoints: 1250,
  totalOrders: 45,
  totalSpent: 2500000,
  favoriteCategories: ['Món chính', 'Đồ uống', 'Tráng miệng'],
  dietaryPreferences: ['Không cay', 'Ít đường'],
  allergies: ['Tôm', 'Cua']
}

const orderHistory = [
  {
    id: 'ORD-001',
    date: '2024-01-15',
    total: 185000,
    status: 'delivered',
    items: ['Phở Bò Tái', 'Bún Chả Hà Nội']
  },
  {
    id: 'ORD-002',
    date: '2024-01-10',
    total: 125000,
    status: 'delivered',
    items: ['Chè Ba Màu', 'Cà phê sữa đá']
  }
]

const achievements = [
  {
    id: '1',
    title: 'Khách hàng thân thiết',
    description: 'Đã đặt 50+ đơn hàng',
    icon: Star,
    unlocked: true,
    date: '2024-01-10'
  },
  {
    id: '2',
    title: 'Người sành ăn',
    description: 'Đã thử 20+ món khác nhau',
    icon: Award,
    unlocked: true,
    date: '2024-01-05'
  },
  {
    id: '3',
    title: 'VIP Member',
    description: 'Đạt cấp độ VIP',
    icon: CreditCard,
    unlocked: false,
    date: null
  }
]

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState(userProfile)
  const [activeTab, setActiveTab] = useState('profile')

  const handleSave = () => {
    // Logic to save profile
    console.log('Saving profile:', profile)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setProfile(userProfile)
    setIsEditing(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ'
  }

  return (
    <div className='container mx-auto px-4 py-6 max-w-4xl'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Tài khoản của tôi</h1>
        <p className='text-muted-foreground'>Quản lý thông tin cá nhân và tài khoản</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='profile'>Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value='orders'>Lịch sử đơn hàng</TabsTrigger>
          <TabsTrigger value='achievements'>Thành tích</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value='profile' className='space-y-6'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle>Thông tin cá nhân</CardTitle>
                {!isEditing ? (
                  <Button variant='outline' onClick={() => setIsEditing(true)}>
                    <Edit className='h-4 w-4 mr-2' />
                    Chỉnh sửa
                  </Button>
                ) : (
                  <div className='flex gap-2'>
                    <Button onClick={handleSave}>
                      <Save className='h-4 w-4 mr-2' />
                      Lưu
                    </Button>
                    <Button variant='outline' onClick={handleCancel}>
                      <X className='h-4 w-4 mr-2' />
                      Hủy
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Avatar Section */}
              <div className='flex items-center gap-6'>
                <div className='relative'>
                  <Avatar className='h-24 w-24'>
                    <AvatarImage src={profile.avatar} alt={profile.name} />
                    <AvatarFallback>
                      {profile.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button size='sm' className='absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0'>
                      <Camera className='h-4 w-4' />
                    </Button>
                  )}
                </div>
                <div>
                  <h3 className='text-xl font-semibold'>{profile.name}</h3>
                  <p className='text-muted-foreground'>{profile.email}</p>
                  <Badge className='mt-2'>{profile.loyaltyLevel}</Badge>
                </div>
              </div>

              {/* Profile Form */}
              <div className='grid md:grid-cols-2 gap-6'>
                <div>
                  <Label htmlFor='name'>Họ và tên</Label>
                  <Input
                    id='name'
                    value={profile.name}
                    onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    type='email'
                    value={profile.email}
                    onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor='phone'>Số điện thoại</Label>
                  <Input
                    id='phone'
                    value={profile.phone}
                    onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor='dateOfBirth'>Ngày sinh</Label>
                  <Input
                    id='dateOfBirth'
                    type='date'
                    value={profile.dateOfBirth}
                    onChange={(e) => setProfile((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <Label htmlFor='gender'>Giới tính</Label>
                  <Select
                    value={profile.gender}
                    onValueChange={(value) => setProfile((prev) => ({ ...prev, gender: value }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='male'>Nam</SelectItem>
                      <SelectItem value='female'>Nữ</SelectItem>
                      <SelectItem value='other'>Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor='address'>Địa chỉ</Label>
                  <Textarea
                    id='address'
                    value={profile.address}
                    onChange={(e) => setProfile((prev) => ({ ...prev, address: e.target.value }))}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
              </div>

              {/* Dietary Preferences */}
              <div>
                <Label>Thói quen ăn uống</Label>
                <div className='mt-2 space-y-2'>
                  <div>
                    <Label className='text-sm text-muted-foreground'>Món yêu thích:</Label>
                    <div className='flex flex-wrap gap-2 mt-1'>
                      {profile.favoriteCategories.map((category, index) => (
                        <Badge key={index} variant='secondary'>
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className='text-sm text-muted-foreground'>Sở thích:</Label>
                    <div className='flex flex-wrap gap-2 mt-1'>
                      {profile.dietaryPreferences.map((pref, index) => (
                        <Badge key={index} variant='outline'>
                          {pref}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className='text-sm text-muted-foreground'>Dị ứng:</Label>
                    <div className='flex flex-wrap gap-2 mt-1'>
                      {profile.allergies.map((allergy, index) => (
                        <Badge key={index} variant='destructive'>
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Stats */}
          <div className='grid md:grid-cols-3 gap-6'>
            <Card>
              <CardContent className='p-6 text-center'>
                <div className='flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-4'>
                  <Clock className='h-6 w-6 text-primary' />
                </div>
                <h3 className='text-2xl font-bold'>{profile.totalOrders}</h3>
                <p className='text-muted-foreground'>Đơn hàng đã đặt</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-6 text-center'>
                <div className='flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-4'>
                  <CreditCard className='h-6 w-6 text-primary' />
                </div>
                <h3 className='text-2xl font-bold'>{formatCurrency(profile.totalSpent)}</h3>
                <p className='text-muted-foreground'>Tổng chi tiêu</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className='p-6 text-center'>
                <div className='flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-4'>
                  <Award className='h-6 w-6 text-primary' />
                </div>
                <h3 className='text-2xl font-bold'>{profile.loyaltyPoints}</h3>
                <p className='text-muted-foreground'>Điểm thưởng</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value='orders' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử đơn hàng gần đây</CardTitle>
              <CardDescription>Xem chi tiết các đơn hàng đã đặt</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {orderHistory.map((order) => (
                  <div key={order.id} className='flex items-center justify-between p-4 border rounded-lg'>
                    <div>
                      <h4 className='font-medium'>#{order.id}</h4>
                      <p className='text-sm text-muted-foreground'>
                        {formatDate(order.date)} • {order.items.join(', ')}
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='font-semibold'>{formatCurrency(order.total)}</p>
                      <Badge variant='outline'>{order.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value='achievements' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle>Thành tích của bạn</CardTitle>
              <CardDescription>Khám phá các thành tích đã đạt được</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid md:grid-cols-2 gap-4'>
                {achievements.map((achievement) => {
                  const Icon = achievement.icon
                  return (
                    <div
                      key={achievement.id}
                      className={`p-4 border rounded-lg ${
                        achievement.unlocked ? 'bg-green-50 dark:bg-green-950/20' : 'bg-muted/50'
                      }`}
                    >
                      <div className='flex items-start gap-3'>
                        <div
                          className={`p-2 rounded-full ${
                            achievement.unlocked ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <Icon className='h-5 w-5' />
                        </div>
                        <div className='flex-1'>
                          <h4 className='font-medium'>{achievement.title}</h4>
                          <p className='text-sm text-muted-foreground mb-2'>{achievement.description}</p>
                          {achievement.unlocked && achievement.date && (
                            <p className='text-xs text-green-600 dark:text-green-400'>
                              Đạt được: {formatDate(achievement.date)}
                            </p>
                          )}
                        </div>
                        {achievement.unlocked && (
                          <Badge className='bg-green-500 text-white'>
                            <Star className='h-3 w-3 mr-1' />
                            Đã đạt
                          </Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
