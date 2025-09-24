import { Star, Edit2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
  useDishReviewListQuery,
  useUpdateDishReviewMutation,
  useDeleteDishReviewMutation
} from '@/queries/useDishReview'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'

export default function ExistingReview({ dishId, userId }: { dishId: string; userId?: string }) {
  const { data: reviewData, refetch } = useDishReviewListQuery(dishId, Boolean(userId))
  const updateReviewMutation = useUpdateDishReviewMutation()
  const deleteReviewMutation = useDeleteDishReviewMutation()

  const [isEditing, setIsEditing] = useState(false)
  const [editRating, setEditRating] = useState(0)
  const [editComment, setEditComment] = useState('')

  const userReview = reviewData?.payload.result.reviews.find((review) => review.author._id === userId)

  if (!userReview) return null

  const handleEdit = () => {
    setIsEditing(true)
    setEditRating(userReview.rating)
    setEditComment(userReview.comment || '')
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateReviewMutation.mutateAsync({
        id: userReview._id,
        rating: editRating,
        comment: editComment.trim() || undefined
      })
      setIsEditing(false)
      refetch()
    } catch (error) {
      console.error('Failed to update review:', error)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteReviewMutation.mutateAsync(userReview._id)
      refetch()
    } catch (error) {
      console.error('Failed to delete review:', error)
    }
  }

  if (isEditing) {
    return (
      <div className='mt-2 p-2 bg-gray-50 rounded-md'>
        <form onSubmit={handleUpdate}>
          <div className='flex items-center gap-1 mb-2'>
            <span className='text-sm font-medium'>Edit your review:</span>
            <div className='flex'>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className={
                    star <= editRating
                      ? 'fill-yellow-400 text-yellow-400 cursor-pointer'
                      : 'text-gray-300 cursor-pointer'
                  }
                  onClick={() => setEditRating(star)}
                />
              ))}
            </div>
          </div>
          <Textarea
            className='w-full p-2 text-sm border rounded-md'
            value={editComment}
            onChange={(e) => setEditComment(e.target.value)}
            placeholder='Write your review...'
            rows={3}
          />
          <div className='mt-2 flex gap-2'>
            <Button type='submit' className='px-3 py-1' disabled={updateReviewMutation.isPending}>
              {updateReviewMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
            <Button type='button' variant='outline' onClick={() => setIsEditing(false)} className='px-3 py-1 '>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className='mt-2 p-2 bg-gray-50 rounded-md'>
      <div className='flex items-center justify-between mb-1'>
        <div className='flex items-center gap-1'>
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
        <div className='flex gap-2'>
          <button onClick={handleEdit} className='p-1 hover:bg-gray-200 rounded' title='Edit review'>
            <Edit2 size={14} />
          </button>

          <AlertDialog>
            <AlertDialogTrigger>
              {' '}
              <Trash2 size={14} />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to delete this review?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. The review will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      {userReview.comment && <p className='text-sm text-gray-600'>{userReview.comment}</p>}
    </div>
  )
}
