import { Card, CardContent, CardHeader } from '@/components/ui/card'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-muted rounded ${className}`} />
  )
}

export function DishCardSkeleton() {
  return (
    <Card className='overflow-hidden'>
      <Skeleton className='w-full h-48' />
      <CardContent className='p-4 space-y-3'>
        <div className='flex items-start justify-between'>
          <Skeleton className='h-6 w-3/4' />
          <Skeleton className='h-4 w-12' />
        </div>
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-2/3' />
        <div className='flex items-center justify-between'>
          <Skeleton className='h-6 w-20' />
          <Skeleton className='h-8 w-24' />
        </div>
      </CardContent>
    </Card>
  )
}

export function OrderCardSkeleton() {
  return (
    <Card>
      <CardHeader className='pb-4'>
        <div className='flex items-start justify-between'>
          <div className='space-y-2'>
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-4 w-48' />
          </div>
          <Skeleton className='h-6 w-20' />
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-3/4' />
        </div>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-6 w-24' />
          <div className='flex gap-2'>
            <Skeleton className='h-8 w-20' />
            <Skeleton className='h-8 w-20' />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ProfileSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className='flex items-center gap-6'>
          <Skeleton className='h-24 w-24 rounded-full' />
          <div className='space-y-2'>
            <Skeleton className='h-6 w-48' />
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-6 w-16' />
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='grid md:grid-cols-2 gap-6'>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='space-y-2'>
              <Skeleton className='h-4 w-20' />
              <Skeleton className='h-10 w-full' />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function MenuPageSkeleton() {
  return (
    <div className='container mx-auto px-4 py-6'>
      {/* Header */}
      <div className='mb-8'>
        <Skeleton className='h-8 w-48 mb-2' />
        <Skeleton className='h-4 w-96' />
      </div>

      {/* Search and Filters */}
      <div className='flex flex-col md:flex-row gap-4 mb-8'>
        <Skeleton className='h-12 flex-1' />
        <Skeleton className='h-12 w-48' />
        <Skeleton className='h-12 w-24' />
      </div>

      {/* Categories */}
      <div className='mb-8'>
        <div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className='h-12 w-full' />
          ))}
        </div>
      </div>

      {/* Dishes Grid */}
      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {Array.from({ length: 6 }).map((_, i) => (
          <DishCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export function HomePageSkeleton() {
  return (
    <div className='container mx-auto px-4 py-6 space-y-8'>
      {/* Hero Section */}
      <Skeleton className='w-full h-64 rounded-2xl' />

      {/* Search Bar */}
      <Skeleton className='h-12 w-full max-w-2xl mx-auto' />

      {/* Restaurant Info */}
      <Card>
        <CardHeader>
          <Skeleton className='h-6 w-32' />
        </CardHeader>
        <CardContent>
          <div className='grid md:grid-cols-2 gap-6'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='flex items-center gap-3'>
                <Skeleton className='h-5 w-5' />
                <div className='space-y-1'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-3 w-32' />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div>
        <Skeleton className='h-8 w-48 mb-6' />
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className='p-6 text-center space-y-3'>
                <Skeleton className='h-8 w-8 mx-auto' />
                <Skeleton className='h-4 w-20 mx-auto' />
                <Skeleton className='h-3 w-16 mx-auto' />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Featured Dishes */}
      <div>
        <div className='flex items-center justify-between mb-6'>
          <Skeleton className='h-8 w-48' />
          <Skeleton className='h-10 w-24' />
        </div>
        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {Array.from({ length: 3 }).map((_, i) => (
            <DishCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
