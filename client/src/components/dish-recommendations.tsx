'use client'

import { useDishRecommendationsForMeQuery } from '@/queries/useDish'
import { DishRecommendationItemType } from '@/schemaValidations/dish.schema'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface DishRecommendationsProps {
  className?: string
  title?: string
  onSelectDish?: (dish: DishRecommendationItemType['dish']) => void
}

export function DishRecommendations({ className, title = 'Gợi ý cho bạn', onSelectDish }: DishRecommendationsProps) {
  const { data, isLoading, isError } = useDishRecommendationsForMeQuery()

  const items = data?.payload.result ?? []

  if (isLoading) {
    return (
      <Card className={cn(className)}>
        <CardHeader>
          <CardTitle className='text-base'>{title}</CardTitle>
        </CardHeader>
        <CardContent className='space-y-2'>
          <Skeleton className='h-6 w-3/4' />
          <Skeleton className='h-6 w-2/3' />
          <Skeleton className='h-6 w-1/2' />
        </CardContent>
      </Card>
    )
  }

  if (isError || items.length === 0) {
    return null
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle className='text-base'>{title}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {items.map((item) => (
          <button
            key={item.dish._id}
            type='button'
            onClick={() => onSelectDish?.(item.dish)}
            className={cn(
              'w-full text-left flex items-center gap-3 rounded-lg border px-3 py-2',
              onSelectDish && 'hover:bg-accent transition-colors'
            )}
          >
            {item.dish.image && (
              <img
                src={item.dish.image}
                alt={item.dish.name}
                className='h-12 w-12 rounded-md object-cover flex-shrink-0'
              />
            )}
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium truncate'>{item.dish.name}</p>
              <p className='text-xs text-muted-foreground'>Đã gọi {item.total_quantity} lần</p>
            </div>
            <p className='text-sm font-semibold whitespace-nowrap'>{item.dish.price.toLocaleString('vi-VN')}₫</p>
          </button>
        ))}
      </CardContent>
    </Card>
  )
}
