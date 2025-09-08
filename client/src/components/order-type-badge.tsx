import { MapPin, Package, Truck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface OrderTypeBadgeProps {
  orderType: 'dine-in' | 'takeaway' | 'delivery'
  showIcon?: boolean
  className?: string
}

const orderTypeConfig = {
  'dine-in': {
    label: 'Tại chỗ',
    icon: MapPin,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    iconColor: 'text-blue-600'
  },
  'takeaway': {
    label: 'Mang về',
    icon: Package,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    iconColor: 'text-orange-600'
  },
  'delivery': {
    label: 'Giao hàng',
    icon: Truck,
    color: 'bg-green-100 text-green-800 border-green-200',
    iconColor: 'text-green-600'
  }
}

export function OrderTypeBadge({ orderType, showIcon = true, className = '' }: OrderTypeBadgeProps) {
  const config = orderTypeConfig[orderType]
  const Icon = config.icon

  return (
    <Badge className={`${config.color} ${className}`}>
      {showIcon && <Icon className={`h-3 w-3 mr-1 ${config.iconColor}`} />}
      {config.label}
    </Badge>
  )
}
