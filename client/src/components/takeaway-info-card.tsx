import { Package, Clock, Phone, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TakeawayInfo {
  customerName: string
  customerPhone: string
  pickupTime?: string
  status?: 'pending' | 'ready' | 'picked-up' | 'cancelled'
}

interface TakeawayInfoCardProps {
  takeawayInfo: TakeawayInfo
  showStatus?: boolean
  showPickupTime?: boolean
  className?: string
}

const takeawayStatusConfig = {
  pending: { label: 'Chờ chuẩn bị', color: 'bg-yellow-100 text-yellow-800' },
  ready: { label: 'Sẵn sàng lấy', color: 'bg-green-100 text-green-800' },
  'picked-up': { label: 'Đã lấy', color: 'bg-blue-100 text-blue-800' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' }
}

export function TakeawayInfoCard({ 
  takeawayInfo, 
  showStatus = true,
  showPickupTime = true,
  className = '' 
}: TakeawayInfoCardProps) {
  const statusConfig = takeawayInfo.status 
    ? takeawayStatusConfig[takeawayInfo.status] 
    : null

  return (
    <Card className={`border-orange-200 bg-orange-50 dark:bg-orange-950/20 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Package className="h-4 w-4 text-orange-600" />
          Thông tin mua mang về
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Customer Info */}
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-orange-600" />
          <div>
            <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
              {takeawayInfo.customerName}
            </p>
            <p className="text-sm text-orange-700 dark:text-orange-300">
              {takeawayInfo.customerPhone}
            </p>
          </div>
        </div>

        {/* Pickup Time */}
        {showPickupTime && takeawayInfo.pickupTime && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Thời gian lấy:</p>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                {new Date(takeawayInfo.pickupTime).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        )}

        {/* Status */}
        {showStatus && statusConfig && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-orange-700 dark:text-orange-300">Trạng thái:</span>
            <Badge className={statusConfig.color}>
              {statusConfig.label}
            </Badge>
          </div>
        )}

        {/* Instructions */}
        <div className="pt-2 border-t border-orange-200 dark:border-orange-800">
          <p className="text-xs text-orange-700 dark:text-orange-300">
            💡 Vui lòng đến quầy lấy món khi nhận được thông báo "Sẵn sàng lấy"
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
