import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Eye, Package, MapPin, User, Phone, Truck, Clock, Edit, Save, X } from 'lucide-react'

// Import types from your schema
import { DeliverySchema } from '@/schemaValidations/order.schema'
import { z } from 'zod'
import { DeliveryStatus, DeliveryStatusValues } from '@/constants/type'
import { useUpdateDeliveryMutation } from '@/queries/useOrder'

// Types based on your existing schema
export type DeliveryInfo = z.TypeOf<typeof DeliverySchema>
export type DeliveryStatusType = (typeof DeliveryStatusValues)[number]

// Map your status values to display names (assuming your constants use these values)
export const DeliveryStatusDisplay = {
  [DeliveryStatus.Pending]: 'Pending',
  [DeliveryStatus.Shipping]: 'Shipping',
  [DeliveryStatus.Delivered]: 'Delivered',
  [DeliveryStatus.Cancelled]: 'Cancelled'
} as const

interface DeliveryInfoComponentProps {
  order_group_id: string
  delivery: DeliveryInfo | null
}

// Utility function
const formatDateTimeToLocaleString = (dateString: string) => {
  try {
    return new Date(dateString).toLocaleString()
  } catch {
    return dateString
  }
}

const formatForDateTimeLocal = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export const DeliveryInfoComponent: React.FC<DeliveryInfoComponentProps> = ({ order_group_id, delivery }) => {
  console.log(delivery)
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editData, setEditData] = useState({
    delivery_status: (delivery?.delivery_status || DeliveryStatusValues[0]) as DeliveryStatusType,
    shipper_info: delivery?.shipper_info || '',
    estimated_time: delivery?.estimated_time || ''
  })

  useEffect(() => {
    if (delivery) {
      setEditData({
        delivery_status: (delivery?.delivery_status || DeliveryStatusValues[0]) as DeliveryStatusType,
        shipper_info: delivery?.shipper_info || '',
        estimated_time: delivery?.estimated_time || ''
      })
    }
  }, [delivery])

  const updateDeliveryMutation = useUpdateDeliveryMutation()

  const getStatusColor = (status: DeliveryStatusType) => {
    switch (status) {
      case DeliveryStatus.Delivered:
        return 'bg-green-100 text-green-800 border-green-200'
      case DeliveryStatus.Shipping:
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case DeliveryStatus.Pending:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case DeliveryStatus.Cancelled:
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleSaveChanges = async () => {
    if (!delivery || !updateDeliveryMutation) return

    setIsUpdating(true)
    try {
      const result = await updateDeliveryMutation.mutateAsync({
        order_group_id: order_group_id,
        delivery_status: editData.delivery_status,
        shipper_info: editData.shipper_info || undefined,
        estimated_time: editData.estimated_time || undefined
      })

      setIsEditing(false)
      toast.success(result.payload.message)
    } catch (error) {
      toast.error('Failed to update delivery information')
      console.error('Error updating delivery status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancelEdit = () => {
    setEditData({
      delivery_status: (delivery?.delivery_status || DeliveryStatusValues[0]) as DeliveryStatusType,
      shipper_info: delivery?.shipper_info || '',
      estimated_time: delivery?.estimated_time || ''
    })
    setIsEditing(false)
  }

  if (!delivery) {
    return <span className='text-gray-400'>N/A</span>
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='gap-2'>
          <Eye className='h-4 w-4' />
          View Details
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-96 p-0'>
        <div className='p-4'>
          {/* Header */}
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-2'>
              <Package className='h-5 w-5 text-blue-600' />
              <h3 className='font-semibold text-lg'>Delivery Details</h3>
            </div>

            {updateDeliveryMutation && (
              <div className='flex gap-2'>
                {isEditing ? (
                  <>
                    <Button size='sm' onClick={handleSaveChanges} disabled={isUpdating} className='gap-1'>
                      <Save className='h-3 w-3' />
                      {isUpdating ? 'Saving...' : 'Save'}
                    </Button>
                    <Button size='sm' variant='outline' onClick={handleCancelEdit} disabled={isUpdating}>
                      <X className='h-3 w-3' />
                    </Button>
                  </>
                ) : (
                  <Button size='sm' variant='outline' onClick={() => setIsEditing(true)} className='gap-1'>
                    <Edit className='h-3 w-3' />
                    Edit
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Status Badge / Select */}
          <div className='mb-4'>
            {isEditing ? (
              <div className='space-y-2'>
                <Label htmlFor='status-select'>Delivery Status</Label>
                <Select
                  value={editData.delivery_status}
                  onValueChange={(value: DeliveryStatusType) =>
                    setEditData((prev) => ({ ...prev, delivery_status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DeliveryStatusValues.map((status) => (
                      <SelectItem key={status} value={status}>
                        {DeliveryStatusDisplay[status as keyof typeof DeliveryStatusDisplay] || status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <Badge
                variant='outline'
                className={`${getStatusColor(delivery.delivery_status as DeliveryStatusType)} font-medium`}
              >
                {DeliveryStatusDisplay[delivery.delivery_status as keyof typeof DeliveryStatusDisplay] ||
                  editData.delivery_status}
              </Badge>
            )}
          </div>

          <div className='space-y-4'>
            {/* Address */}
            <div className='flex items-start gap-3'>
              <MapPin className='h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0' />
              <div className='flex-1'>
                <p className='text-sm font-medium text-gray-700'>Delivery Address</p>
                <p className='text-sm text-gray-900 mt-1'>{delivery.address}</p>
              </div>
            </div>

            <Separator />

            {/* Receiver Info */}
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <User className='h-4 w-4 text-gray-500 flex-shrink-0' />
                <div className='flex-1'>
                  <p className='text-sm font-medium text-gray-700'>Receiver</p>
                  <p className='text-sm text-gray-900'>{delivery.receiver_name}</p>
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <Phone className='h-4 w-4 text-gray-500 flex-shrink-0' />
                <div className='flex-1'>
                  <p className='text-sm font-medium text-gray-700'>Phone</p>
                  <p className='text-sm text-gray-900'>{delivery.receiver_phone}</p>
                </div>
              </div>
            </div>

            {/* Shipper Info */}
            {(delivery.shipper_info || isEditing) && (
              <>
                <Separator />
                <div className='flex items-start gap-3'>
                  <Truck className='h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0' />
                  <div className='flex-1'>
                    <Label className='text-sm font-medium text-gray-700'>Shipper</Label>
                    {isEditing ? (
                      <Input
                        value={editData.shipper_info}
                        onChange={(e) => setEditData((prev) => ({ ...prev, shipper_info: e.target.value }))}
                        placeholder='Enter shipper information'
                        className='mt-1'
                      />
                    ) : (
                      <p className='text-sm text-gray-900 mt-1'>{editData.shipper_info}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Estimated Time */}
            {(delivery.estimated_time || isEditing) && (
              <>
                {!delivery.shipper_info && !isEditing && <Separator />}
                <div className='flex items-start gap-3'>
                  <Clock className='h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0' />
                  <div className='flex-1'>
                    <Label className='text-sm font-medium text-gray-700'>Estimated Delivery</Label>
                    {isEditing ? (
                      <Input
                        type='datetime-local'
                        value={editData.estimated_time ? formatForDateTimeLocal(editData.estimated_time) : ''}
                        onChange={(e) => setEditData((prev) => ({ ...prev, estimated_time: e.target.value }))}
                        className='mt-1'
                      />
                    ) : (
                      <p className='text-sm text-gray-900 mt-1'>
                        {delivery.estimated_time ? formatDateTimeToLocaleString(delivery.estimated_time) : 'Not set'}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
