import { Truck, MapPin, Phone, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface DeliveryInfo {
  address: string
  receiverName: string
  receiverPhone: string
  deliveryStatus?: 'pending' | 'confirmed' | 'preparing' | 'on-the-way' | 'delivered' | 'cancelled'
  estimatedTime?: string
  shipperInfo?: string
}

interface DeliveryInfoCardProps {
  deliveryInfo: DeliveryInfo
  showStatus?: boolean
  showEstimatedTime?: boolean
  className?: string
}

const deliveryStatusConfig = {
  pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
  preparing: { label: 'Đang chuẩn bị', color: 'bg-orange-100 text-orange-800' },
  'on-the-way': { label: 'Đang giao', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Đã giao', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' }
}

export function DeliveryInfoCard({ 
  deliveryInfo, 
  showStatus = true,
  showEstimatedTime = true,
  className = '' 
}: DeliveryInfoCardProps) {
  const statusConfig = deliveryInfo.deliveryStatus 
    ? deliveryStatusConfig[deliveryInfo.deliveryStatus] 
    : null

  return (
    <Card className={`border-green-200 bg-green-50 dark:bg-green-950/20 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Truck className="h-4 w-4 text-green-600" />
          Thông tin giao hàng
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Delivery Address */}
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">Địa chỉ:</p>
            <p className="text-sm text-green-700 dark:text-green-300">{deliveryInfo.address}</p>
          </div>
        </div>

        {/* Receiver Info */}
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              {deliveryInfo.receiverName}
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              {deliveryInfo.receiverPhone}
            </p>
          </div>
        </div>

        {/* Delivery Status */}
        {showStatus && statusConfig && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-700 dark:text-green-300">Trạng thái:</span>
            <Badge className={statusConfig.color}>
              {statusConfig.label}
            </Badge>
          </div>
        )}

        {/* Estimated Time */}
        {showEstimatedTime && deliveryInfo.estimatedTime && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">Dự kiến giao:</p>
              <p className="text-sm text-green-700 dark:text-green-300">
                {new Date(deliveryInfo.estimatedTime).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        )}

        {/* Shipper Info */}
        {deliveryInfo.shipperInfo && (
          <div className="pt-2 border-t border-green-200 dark:border-green-800">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">Tài xế:</p>
            <p className="text-sm text-green-700 dark:text-green-300">{deliveryInfo.shipperInfo}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
