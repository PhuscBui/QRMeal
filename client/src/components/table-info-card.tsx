import { MapPin, Users, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TableInfo {
  tableId: string
  tableNumber: string
  floor: string
  capacity: number
}

interface TableInfoCardProps {
  tableInfo: TableInfo
  showCapacity?: boolean
  showFloor?: boolean
  className?: string
}

export function TableInfoCard({ 
  tableInfo, 
  showCapacity = true, 
  showFloor = true,
  className = '' 
}: TableInfoCardProps) {
  return (
    <Card className={`border-blue-200 bg-blue-50 dark:bg-blue-950/20 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-600" />
          Thông tin bàn
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-blue-800 dark:text-blue-200">
              {tableInfo.tableNumber}
            </span>
            {showFloor && (
              <Badge variant="outline" className="text-xs">
                {tableInfo.floor}
              </Badge>
            )}
          </div>
          
          {showCapacity && (
            <div className="flex items-center gap-1 text-sm text-blue-700 dark:text-blue-300">
              <Users className="h-3 w-3" />
              <span>Tối đa {tableInfo.capacity} người</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
