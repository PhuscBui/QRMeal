'use client'

import Image from 'next/image'
import { cn, formatCurrency } from '@/lib/utils'
import { DishStatus } from '@/constants/type'
import type { GuestCreateOrdersBodyType } from '@/schemaValidations/guest.schema'
import type { DishResType } from '@/schemaValidations/dish.schema'
import { DishReviewsModal } from '@/components/dish-reviews-modal'
import { Star } from 'lucide-react'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Quantity from '@/features/guests/menu/quantity'

interface DishCardProps {
  dish: DishResType['result']
  orders: GuestCreateOrdersBodyType
  handleQuantityChange: (dish_id: string, quantity: number) => void
}

export default function DishCard({ dish, orders, handleQuantityChange }: DishCardProps) {
  const [showReviewModal, setShowReviewModal] = useState(false)
  const t = useTranslations('guestMenuOrder')

  return (
    <>
      <div
        key={dish._id}
        className={cn('flex gap-2 p-2 rounded-lg border border-gray-100 bg-gray-50/50', {
          'opacity-50': dish.status === DishStatus.Unavailable
        })}
      >
        <div className='flex-shrink-0 relative'>
          {dish.status === DishStatus.Unavailable && (
            <div className='absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg'>
              <span className='text-white text-xs font-medium px-2 py-1 bg-red-600 rounded'>{t('outOfStock')}</span>
            </div>
          )}
          <Image
            src={dish.image || 'https://placehold.co/600x400'}
            alt={dish.name}
            height={120}
            width={120}
            quality={100}
            className='object-cover w-[100px] h-[100px] rounded-lg'
          />
        </div>

        <div className='flex-1 space-y-2'>
          <h3 className='text-base font-semibold text-gray-900 leading-tight'>{dish.name}</h3>
          <p className='text-sm text-gray-600 leading-relaxed line-clamp-2'>{dish.description}</p>
          <div className='flex gap-2 items-center justify-between'>
            <p className='text-sm font-bold text-orange-600'>{formatCurrency(dish.price)}</p>
            <button
              onClick={() => setShowReviewModal(true)}
              className='flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors'
            >
              <Star className='w-4 h-4' />
              <span>{dish.avg_rating ? dish.avg_rating.toFixed(1) : t('noReviews')}</span>
            </button>
          </div>
        </div>

        <div className='flex-shrink-0 flex items-center'>
          <Quantity
            onChange={(value) => handleQuantityChange(dish._id, value)}
            value={orders.find((order) => order.dish_id === dish._id)?.quantity ?? 0}
          />
        </div>
      </div>

      <DishReviewsModal dish={dish} isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} />
    </>
  )
}
