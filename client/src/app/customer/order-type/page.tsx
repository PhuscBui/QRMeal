'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Package, Truck, QrCode, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const orderTypes = [
  {
    id: 'dine-in',
    title: 'Dine at the restaurant',
    description: 'Enjoy food right at the restaurant',
    icon: MapPin,
    color: 'bg-blue-500',
    features: ['Scan QR code to book a table', 'Enjoy on-site', 'Table service'],
    badge: 'Popular'
  },
  {
    id: 'takeaway',
    title: 'Takeaway',
    description: 'Pick up food at the restaurant',
    icon: Package,
    color: 'bg-orange-500',
    features: ['Book in advance and pick up', 'Save time', 'Fresh food'],
    badge: null
  },
  {
    id: 'delivery',
    title: 'Order for delivery',
    description: 'Deliver food to your door',
    icon: Truck,
    color: 'bg-green-500',
    features: ['Delivery to your doorstep', 'Flexible payment', 'Real-time order tracking'],
    badge: 'New'
  }
]

export default function OrderTypePage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<string | null>(null)

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
        <h1 className='text-4xl font-bold mb-4'>Choose your way to enjoy</h1>
        <p className='text-xl text-muted-foreground max-w-2xl mx-auto'>
          Choose the best way to enjoy our delicious food
        </p>
      </div>

      {/* QR Code Section for Dine-in */}
      <div className='mb-12'>
        <Card className='border-2 border-dashed border-primary/20 bg-primary/5'>
          <CardContent className='p-8 text-center'>
            <QrCode className='h-16 w-16 mx-auto mb-4 text-primary' />
            <h2 className='text-2xl font-bold mb-2'>Eat at the restaurant?</h2>
            <p className='text-muted-foreground mb-6'>Scan the QR code on the table to start ordering and paying</p>
            <Button size='lg' onClick={handleScanQR} className='bg-primary hover:bg-primary/90'>
              <QrCode className='h-5 w-5 mr-2' />
              Scan QR Code
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
              {type.badge && (
                <Badge className='absolute -top-2 -right-2 z-10' variant='secondary'>
                  {type.badge}
                </Badge>
              )}

              <CardHeader className='text-center pb-4'>
                <div className={`w-16 h-16 mx-auto rounded-full ${type.color} flex items-center justify-center mb-4`}>
                  <Icon className='h-8 w-8 text-white' />
                </div>
                <CardTitle className='text-xl'>{type.title}</CardTitle>
                <CardDescription className='text-base'>{type.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <ul className='space-y-2 mb-6'>
                  {type.features.map((feature, index) => (
                    <li key={index} className='flex items-center text-sm text-muted-foreground'>
                      <div className='w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0' />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  className='w-full'
                  variant={selectedType === type.id ? 'default' : 'outline'}
                  onClick={() => handleSelectType(type.id)}
                >
                  Choose {type.title}
                  <ArrowRight className='h-4 w-4 ml-2' />
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Additional Info */}
      <div className='text-center text-sm text-muted-foreground'>
        <p>You can change your order type at any time during the ordering process</p>
      </div>
    </div>
  )
}
