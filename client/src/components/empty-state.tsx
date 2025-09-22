import { Calendar, Gift, Heart, LucideIcon, Package, Search, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, className = '' }: EmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent className='text-center py-12'>
        <Icon className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
        <h3 className='text-lg font-medium mb-2'>{title}</h3>
        <p className='text-muted-foreground mb-4'>{description}</p>
        {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
      </CardContent>
    </Card>
  )
}

// Predefined empty states for common use cases
export function EmptyOrders() {
  return (
    <EmptyState
      icon={Package}
      title='Chưa có đơn hàng nào'
      description='Bạn chưa có đơn hàng nào. Hãy đặt món ăn đầu tiên của bạn!'
      actionLabel='Đặt hàng ngay'
      onAction={() => {
        // Navigate to menu
        window.location.href = '/customer/menu'
      }}
    />
  )
}

export function EmptyReservations() {
  return (
    <EmptyState
      icon={Calendar}
      title='Chưa có đặt bàn nào'
      description='Bạn chưa đặt bàn nào. Hãy đặt bàn để thưởng thức bữa ăn tại nhà hàng!'
      actionLabel='Đặt bàn ngay'
      onAction={() => {
        // Open reservation dialog
        console.log('Open reservation dialog')
      }}
    />
  )
}

export function EmptyPromotions() {
  return (
    <EmptyState
      icon={Gift}
      title='Không có khuyến mãi nào'
      description='Hiện tại không có khuyến mãi nào trong danh mục này'
      actionLabel='Xem tất cả khuyến mãi'
      onAction={() => {
        // Navigate to all promotions
        window.location.href = '/customer/promotions'
      }}
    />
  )
}

export function EmptySearch() {
  return (
    <EmptyState
      icon={Search}
      title='Không tìm thấy kết quả'
      description='Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để tìm thấy những gì bạn cần'
      actionLabel='Xóa bộ lọc'
      onAction={() => {
        // Clear search and filters
        console.log('Clear search and filters')
      }}
    />
  )
}

export function EmptyFavorites() {
  return (
    <EmptyState
      icon={Heart}
      title='Chưa có món yêu thích'
      description='Bạn chưa thêm món ăn nào vào danh sách yêu thích'
      actionLabel='Khám phá thực đơn'
      onAction={() => {
        // Navigate to menu
        window.location.href = '/customer/menu'
      }}
    />
  )
}

export function EmptyCart() {
  return (
    <EmptyState
      icon={ShoppingCart}
      title='Giỏ hàng trống'
      description='Thêm món ăn vào giỏ hàng để bắt đầu đặt hàng'
      actionLabel='Xem thực đơn'
      onAction={() => {
        // Navigate to menu
        window.location.href = '/customer/menu'
      }}
    />
  )
}
