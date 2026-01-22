'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Package, Truck, QrCode, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'

export default function OrderTypePage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const t = useTranslations('orderType')
  const tHome = useTranslations('customerHome')

  const orderTypes = [
    {
      id: 'dine-in',
      titleKey: 'dineInTitle',
      descriptionKey: 'dineInDesc',
      icon: MapPin,
      color: 'bg-blue-500',
      featureKeys: ['dineInFeature1', 'dineInFeature2', 'dineInFeature3'],
      badgeKey: 'popular'
    },
    {
      id: 'takeaway',
      titleKey: 'takeawayTitle',
      descriptionKey: 'takeawayDesc',
      icon: Package,
      color: 'bg-orange-500',
      featureKeys: ['takeawayFeature1', 'takeawayFeature2', 'takeawayFeature3'],
      badgeKey: null
    },
    {
      id: 'delivery',
      titleKey: 'deliveryTitle',
      descriptionKey: 'deliveryDesc',
      icon: Truck,
      color: 'bg-green-500',
      featureKeys: ['deliveryFeature1', 'deliveryFeature2', 'deliveryFeature3'],
      badgeKey: 'new'
    }
  ]

  const handleSelectType = (typeId: string) => {
    setSelectedType(typeId)

    localStorage.setItem('orderType', typeId)

    localStorage.removeItem('tableInfo')

    // Navigate to the specific order type page

    if (typeId === 'dine-in') {
      router.push('/customer/scan-qr')
      return
    }

    router.push(`/customer/${typeId}/menu`)
  }

  const handleScanQR = () => {
    // Navigate to QR scan page for dine-in
    router.push('/customer/scan-qr')
  }

  return (
    <div className='container mx-auto px-4 py-8 max-w-6xl'>
      {/* Header */}
      <div className='text-center mb-12'>
        <h1 className='text-4xl font-bold mb-4'>{t('chooseYourWay')}</h1>
        <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>{t('chooseBestWay')}</p>
      </div>

      {/* QR Code Section for Dine-in */}
      <div className='mb-12'>
        <Card className='border-2 border-dashed border-primary/20 bg-primary/5'>
          <CardContent className='p-8 text-center'>
            <QrCode className='h-16 w-16 mx-auto mb-4 text-primary' />
            <h2 className='text-2xl font-bold mb-2'>{t('eatAtRestaurant')}</h2>
            <p className='text-muted-foreground mb-6'>{t('scanQRTableDesc')}</p>
            <Button size='lg' onClick={handleScanQR} className='bg-primary hover:bg-primary/90'>
              <QrCode className='h-5 w-5 mr-2' />
              {tHome('scanQRCode')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Order Type Cards */}
      <div className='grid md:grid-cols-3 gap-6 mb-8'>
        {orderTypes.map((type) => {
          const Icon = type.icon
          return (
            <Card
              key={type.id}
              className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedType === type.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => handleSelectType(type.id)}
            >
              {type.badgeKey && (
                <Badge className='absolute -top-2 -right-2 z-10' variant='secondary'>
                  {t(type.badgeKey)}
                </Badge>
              )}

              <CardHeader className='text-center pb-4'>
                <div className={`w-16 h-16 mx-auto rounded-full ${type.color} flex items-center justify-center mb-4`}>
                  <Icon className='h-8 w-8 text-white' />
                </div>
                <CardTitle className='text-xl'>{t(type.titleKey)}</CardTitle>
                <CardDescription className='text-base'>{t(type.descriptionKey)}</CardDescription>
              </CardHeader>

              <CardContent>
                <ul className='space-y-2 mb-6'>
                  {type.featureKeys.map((featureKey, index) => (
                    <li key={index} className='flex items-center text-sm text-muted-foreground'>
                      <div className='w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0' />
                      {t(featureKey)}
                    </li>
                  ))}
                </ul>

                <Button
                  className='w-full'
                  variant={selectedType === type.id ? 'default' : 'outline'}
                  onClick={() => handleSelectType(type.id)}
                >
                  {t('choose')} {t(type.titleKey)}
                  <ArrowRight className='h-4 w-4 ml-2' />
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Additional Info */}
      <div className='text-center text-sm text-muted-foreground'>
        <p>{t('changeAnytime')}</p>
      </div>
    </div>
  )
}

