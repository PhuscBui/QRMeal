'use client'

import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Star } from 'lucide-react'
import { useState } from 'react'

import { useAddDishReviewMutation, useGetDishReviewsByMeQuery } from '@/queries/useDishReview'

export default function DishReviewForm({
  dishId,
  dishName,
  onClose
}: {
  dishId: string
  dishName: string
  onClose: () => void
}) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [hoveredRating, setHoveredRating] = useState(0)

  const addReviewMutation = useAddDishReviewMutation()
  const { refetch } = useGetDishReviewsByMeQuery(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast.error('Please provide a rating before submitting.')
      return
    }

    try {
      await addReviewMutation.mutateAsync({
        dish_id: dishId,
        rating,
        comment: comment.trim() || undefined
      })

      toast.success('Thanks for your review!')
      await refetch()
      onClose()
    } catch (error) {
      toast.error('An error occurred while submitting the review.')
      console.error(error)
    }
  }

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg p-6 max-w-md w-full'>
        <h3 className='text-lg font-semibold mb-4'>Food reviews</h3>
        <p className='text-gray-600 mb-4'>{dishName}</p>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Rating stars */}
          <div>
            <label className='block text-sm font-medium mb-2'>Your review</label>
            <div className='flex gap-1'>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type='button'
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className='p-1'
                >
                  <Star
                    size={24}
                    className={`transition-colors ${
                      star <= (hoveredRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className='block text-sm font-medium mb-2'>Comment (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder='Share your experience with this dish...'
              className='w-full p-3 border border-gray-300 rounded-md resize-none h-20'
              maxLength={500}
            />
            <p className='text-xs text-gray-500 mt-1'>{comment.length}/500</p>
          </div>

          {/* Buttons */}
          <div className='flex gap-3 pt-2'>
            <Button type='button' variant='outline' onClick={onClose} className='flex-1'>
              Cancel
            </Button>
            <Button type='submit' disabled={addReviewMutation.isPending} className='flex-1'>
              {addReviewMutation.isPending ? 'Sending...' : 'Submit review'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
