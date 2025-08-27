import { Star } from 'lucide-react'

import { useDishReviewListQuery } from '@/queries/useDishReview'

export default function ExistingReview({ dishId }: { dishId: string }) {
  const { data: reviewData } = useDishReviewListQuery(dishId)

  const userReview = reviewData?.payload.result.reviews?.[0]

  if (!userReview) return null

  return (
    <div className='mt-2 p-2 bg-gray-50 rounded-md'>
      <div className='flex items-center gap-1 mb-1'>
        <span className='text-sm font-medium'>Your review:</span>
        <div className='flex'>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={14}
              className={star <= userReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
            />
          ))}
        </div>
      </div>
      {userReview.comment && <p className='text-sm text-gray-600'>{userReview.comment}</p>}
    </div>
  )
}
