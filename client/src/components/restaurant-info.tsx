import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChefHat, Clock, Mail, MapPin, Phone, Star, Users } from 'lucide-react'

export function RestaurantInfo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <ChefHat className='h-5 w-5' />
          Restaurant Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid md:grid-cols-2 gap-6'>
          <div className='space-y-4'>
            <div className='flex items-center gap-3'>
              <MapPin className='h-5 w-5 text-muted-foreground' />
              <div>
                <p className='font-medium'>Address</p>
                <p className='text-muted-foreground'>123 ABC Street, District 1, HCMC</p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <Phone className='h-5 w-5 text-muted-foreground' />
              <div>
                <p className='font-medium'>Phone</p>
                <p className='text-muted-foreground'>0123 456 789</p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <Mail className='h-5 w-5 text-muted-foreground' />
              <div>
                <p className='font-medium'>Email</p>
                <p className='text-muted-foreground'>info@qrmeal.com</p>
              </div>
            </div>
          </div>
          <div className='space-y-4'>
            <div className='flex items-center gap-3'>
              <Clock className='h-5 w-5 text-muted-foreground' />
              <div>
                <p className='font-medium'>Opening hours</p>
                <p className='text-muted-foreground'>7:00 - 22:00 (Daily)</p>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <Star className='h-5 w-5 text-muted-foreground' />
              <div>
                <p className='font-medium'>Evaluate</p>
                <div className='flex items-center gap-1'>
                  <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                  <span className='font-medium'>4.8</span>
                  <span className='text-muted-foreground'>(1,234 evaluations)</span>
                </div>
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <Users className='h-5 w-5 text-muted-foreground' />
              <div>
                <p className='font-medium'>Capacity</p>
                <p className='text-muted-foreground'>150 guests</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
