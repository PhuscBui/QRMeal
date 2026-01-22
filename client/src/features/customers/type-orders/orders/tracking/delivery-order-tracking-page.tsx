/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect } from 'react'
import { MapPin, CheckCircle, Package, ChefHat, Truck, Phone, MessageCircle, RefreshCw, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useGetOrderDetailQuery } from '@/queries/useOrder'
import { useParams } from 'next/navigation'
import { useAppContext } from '@/components/app-provider'
import { toast } from 'sonner'
import { UpdateDeliveryResType } from '@/schemaValidations/order.schema'
import { formatDate, formatTime } from '@/lib/utils'
import { Step } from '@/types/common.type'
import { useTranslations } from 'next-intl'

export default function DeliveryOrderTrackingPage() {
  const t = useTranslations('orderTracking')
  const params = useParams()
  const orderGroupId = params.orderGroupId as string
  const { data, refetch, isRefetching } = useGetOrderDetailQuery({ id: orderGroupId, enabled: true })
  const { socket } = useAppContext()

  const handleRefresh = () => {
    refetch()
  }

  useEffect(() => {
    if (socket?.connected) {
      onConnect()
    }

    function onConnect() {
      console.log(socket?.id)
    }

    function onDisconnect() {
      console.log('disconnect')
    }

    function onUpdateDeliveryStatus(data: UpdateDeliveryResType['result']) {
      const { delivery } = data
      toast.success(`Delivery status has been updated: ${delivery?.delivery_status}`)
      refetch()
    }

    socket?.on('delivery-status-update', onUpdateDeliveryStatus)
    socket?.on('connect', onConnect)
    socket?.on('disconnect', onDisconnect)

    return () => {
      socket?.off('connect', onConnect)
      socket?.off('disconnect', onDisconnect)
      socket?.off('delivery-status-update', onUpdateDeliveryStatus)
    }
  }, [refetch, socket])

  const currentOrder = data?.payload.result

  if (!currentOrder || currentOrder.order_type !== 'delivery') {
    return (
      <div className='container mx-auto px-4 py-6 max-w-4xl'>
        <div className='text-center py-12'>
          <Package className='h-16 w-16 mx-auto text-gray-400 mb-4' />
          <h2 className='text-2xl font-semibold mb-2'>{t('noDeliveryOrders')}</h2>
          <p className='text-gray-600'>{t('noDeliveryOrdersDesc')}</p>
        </div>
      </div>
    )
  }

  const getDeliverySteps = () => {
    const baseSteps = [
      {
        id: 1,
        title: t('orderSuccessful'),
        description: t('orderReceived'),
        icon: CheckCircle,
        status: 'Completed' as const,
        timestamp: currentOrder.created_at
      },
      {
        id: 2,
        title: t('restaurantPreparing'),
        description: t('preparingFood'),
        icon: ChefHat,
        status: currentOrder.status === 'Pending' ? ('Current' as const) : ('Completed' as const),
        timestamp: currentOrder.status === 'Pending' ? null : currentOrder.updated_at
      },
      {
        id: 3,
        title: t('deliveryInProgress'),
        description: t('shipperOnWay'),
        icon: Truck,
        status:
          currentOrder.delivery?.delivery_status === 'Shipping'
            ? ('Current' as const)
            : currentOrder.status === 'Delivered'
            ? ('Completed' as const)
            : ('Pending' as const),
        timestamp: currentOrder.delivery?.delivery_status === 'Shipping' ? currentOrder.delivery.updated_at : null
      },
      {
        id: 4,
        title: t('deliverySuccessful'),
        description: t('orderDelivered'),
        icon: CheckCircle,
        status: currentOrder.status === 'Delivered' ? ('Completed' as const) : ('Pending' as const),
        timestamp: currentOrder.status === 'Delivered' ? currentOrder.updated_at : null
      }
    ]
    return baseSteps
  }

  const steps = getDeliverySteps()
  const completedSteps = steps.filter((step) => step.status === 'Completed').length

  const getStepIcon = (step: Step) => {
    const Icon = step.icon
    const status = step.status

    if (status === 'Completed') {
      return <Icon className='h-5 w-5 text-green-500' />
    } else if (status === 'Current') {
      return <Icon className='h-5 w-5 text-blue-500' />
    } else {
      return <Icon className='h-5 w-5 text-gray-300' />
    }
  }

  const calculateTotal = () => {
    return currentOrder.orders.reduce((total, order) => {
      return total + order.dish_snapshot.price * order.quantity
    }, 0)
  }

  const getEstimatedTime = () => {
    if (currentOrder.delivery?.estimated_time) {
      const estimated = new Date(currentOrder.delivery.estimated_time)
      const now = new Date()
      const diff = Math.max(0, Math.ceil((estimated.getTime() - now.getTime()) / (1000 * 60)))
      return diff
    }
    return 30 // Default 30 minutes
  }

  return (
    <div className='container mx-auto px-4 py-6 max-w-4xl'>
      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold mb-2'>{t('deliveryTracking')}</h1>
            <p className='text-muted-foreground'>{t('order')} #{currentOrder._id.slice(-8)}</p>
          </div>
          <Button variant='outline' onClick={handleRefresh} disabled={isRefetching}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
            {t('refresh')}
          </Button>
        </div>
      </div>

      <div className='grid lg:grid-cols-3 gap-8'>
        {/* Main Tracking */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Package className='h-5 w-5' />
                {t('deliveryStatus')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <span className='font-medium'>{t('progress')}</span>
                  <span className='text-sm text-muted-foreground'>
                    {completedSteps}/{steps.length} {t('steps')}
                  </span>
                </div>
                <Progress value={(completedSteps / steps.length) * 100} className='h-2' />
                <div className='text-center'>
                  <p className='text-2xl font-bold text-primary'>{getEstimatedTime()} {t('minutes')}</p>
                  <p className='text-sm text-muted-foreground'>{t('estimatedTimeRemaining')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Steps */}
          <Card>
            <CardHeader>
              <CardTitle>{t('deliveryProgressDetails')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-6'>
                {steps.map((step, index) => (
                  <div key={step.id} className='relative flex items-start gap-4'>
                    <div className='flex-shrink-0'>{getStepIcon(step)}</div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between'>
                        <h4
                          className={`font-medium ${
                            step.status === 'Current'
                              ? 'text-blue-600'
                              : step.status === 'Completed'
                              ? 'text-green-600'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {step.title}
                        </h4>

                        {step.timestamp && (
                          <span className='text-sm text-muted-foreground'>{formatTime(step.timestamp)}</span>
                        )}
                      </div>
                      <p className='text-sm text-muted-foreground mt-1'>{step.description}</p>
                      {step.status === 'Current' && (
                        <div className='mt-2'>
                          <div className='flex items-center gap-2 text-sm text-blue-600'>
                            <div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse' />
                            {t('processing')}
                          </div>
                        </div>
                      )}
                    </div>
                    {index < steps.length - 1 && <div className='absolute left-6 top-8 w-px h-8 bg-border' />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle>{t('orderDetails')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {currentOrder.orders.map((order) => (
                  <div key={order._id} className='flex items-center justify-between py-2'>
                    <div className='flex items-center gap-3'>
                      <img
                        src={order.dish_snapshot.image}
                        alt={order.dish_snapshot.name}
                        className='w-12 h-12 rounded-lg object-cover'
                      />
                      <div>
                        <p className='font-medium'>{order.dish_snapshot.name}</p>
                        <p className='text-sm text-muted-foreground'>
                          {order.quantity}x {order.dish_snapshot.price.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                    </div>
                    <p className='font-medium'>
                      {(order.dish_snapshot.price * order.quantity).toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                ))}
                <Separator />
                <div className='flex items-center justify-between text-lg font-semibold'>
                  <span>{t('total')}:</span>
                  <span>{calculateTotal().toLocaleString('vi-VN')}đ</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          {/* Delivery Info */}
          {currentOrder.delivery && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Truck className='h-5 w-5' />
                  {t('deliveryInformation')}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {currentOrder.delivery.shipper_info && (
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center'>
                      <Truck className='h-5 w-5' />
                    </div>
                    <div>
                      <p className='font-medium'>{currentOrder.delivery.shipper_info}</p>
                      <div className='flex items-center gap-1'>
                        <Star className='h-3 w-3 fill-yellow-400 text-yellow-400' />
                        <span className='text-sm text-muted-foreground'>4.8</span>
                      </div>
                    </div>
                  </div>
                )}
                <div className='space-y-2'>
                  <p className='text-sm'>
                    <span className='font-medium'>{t('status')}:</span> {currentOrder.delivery.delivery_status}
                  </p>
                  <p className='text-sm'>
                    <span className='font-medium'>{t('receiver')}:</span> {currentOrder.delivery.receiver_name}
                  </p>
                  <p className='text-sm'>
                    <span className='font-medium'>{t('phone')}:</span> {currentOrder.delivery.receiver_phone}
                  </p>
                </div>
                {currentOrder.delivery.shipper_info && (
                  <div className='space-y-2'>
                    <Button variant='outline' size='sm' className='w-full'>
                      <Phone className='h-4 w-4 mr-2' />
                      {t('callDriver')}
                    </Button>
                    <Button variant='outline' size='sm' className='w-full'>
                      <MessageCircle className='h-4 w-4 mr-2' />
                      {t('message')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Delivery Address */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <MapPin className='h-5 w-5' />
                {t('deliveryAddress')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-2'>
                <p className='text-sm font-medium'>{currentOrder.delivery?.receiver_name}</p>
                <p className='text-sm'>{currentOrder.delivery?.address}</p>
                <p className='text-sm text-muted-foreground'>{t('phone')}: {currentOrder.delivery?.receiver_phone}</p>
                {currentOrder.delivery?.estimated_time && (
                  <p className='text-sm text-muted-foreground'>
                    {t('estimatedDelivery')}: {formatDate(currentOrder.delivery.estimated_time)}
                  </p>
                )}
                {currentOrder.delivery?.notes && (
                  <p className='text-sm text-muted-foreground italic'>{t('notes')}: {currentOrder.delivery.notes}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          {currentOrder.customer && (
            <Card>
              <CardHeader>
                <CardTitle>{t('customerInformation')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex items-center gap-3'>
                  <img
                    src={currentOrder.customer.avatar || '/default-avatar.png'}
                    alt={currentOrder.customer.name}
                    className='w-10 h-10 rounded-full'
                  />
                  <div>
                    <p className='font-medium'>{currentOrder.customer.name}</p>
                    <p className='text-sm text-muted-foreground'>{currentOrder.customer.phone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t('quickActions')}</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <Button variant='outline' size='sm' className='w-full'>
                <MessageCircle className='h-4 w-4 mr-2' />
                {t('contactSupport')}
              </Button>
              <Button variant='outline' size='sm' className='w-full'>
                <RefreshCw className='h-4 w-4 mr-2' />
                {t('resetTracking')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
