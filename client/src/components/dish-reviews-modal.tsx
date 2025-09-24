'use client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Star, StarHalf, ChevronLeft, ChevronRight, Loader2, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useMemo, useEffect } from 'react'
import type { DishResType } from '@/schemaValidations/dish.schema'
import { useDishReviewListQuery, useGetDishReviewStatsQuery } from '@/queries/useDishReview'
import { Role } from '@/constants/type'

interface DishReviewsModalProps {
  isOpen: boolean
  onClose: () => void
  dish: DishResType['result']
}

function StarRating({
  rating,
  className,
  size = 'sm'
}: {
  rating: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 !== 0
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  const starSize = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }[size]

  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`full-${i}`} className={cn(starSize, 'fill-amber-400 text-amber-400')} />
      ))}
      {hasHalfStar && <StarHalf className={cn(starSize, 'fill-amber-400 text-amber-400')} />}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`empty-${i}`} className={cn(starSize, 'text-gray-300')} />
      ))}
      <span
        className={cn('ml-2 font-medium text-gray-700', {
          'text-sm': size === 'sm',
          'text-base': size === 'md',
          'text-lg': size === 'lg'
        })}
      >
        {rating.toFixed(1)}
      </span>
    </div>
  )
}

function RatingProgressBar({ rating, count, total }: { rating: number; count: number; total: number }) {
  const percentage = total > 0 ? (count / total) * 100 : 0

  return (
    <div className='flex items-center gap-3 py-2'>
      <div className='flex items-center gap-1 min-w-[60px]'>
        <span className='text-sm font-medium'>{rating}</span>
        <Star className='h-3 w-3 fill-amber-400 text-amber-400' />
      </div>
      <div className='flex-1 bg-gray-200 rounded-full h-2 overflow-hidden'>
        <div
          className='h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-300'
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className='text-sm text-gray-600 min-w-[30px] text-right'>{count}</span>
    </div>
  )
}

function formatDate(dateString?: string) {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

function getRoleBadgeVariant(role: string) {
  switch (role.toLowerCase()) {
    case Role.Owner:
      return 'destructive'
    case Role.Guest:
      return 'default'
    case Role.Customer:
      return 'secondary'
    default:
      return 'outline'
  }
}

const REVIEWS_PER_PAGE = 5

export function DishReviewsModal({ isOpen, onClose, dish }: DishReviewsModalProps) {
  const [selectedRating, setSelectedRating] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Query cho thống kê reviews
  const { data: statsData } = useGetDishReviewStatsQuery(dish._id)

  // Query cho danh sách reviews với server-side pagination
  const queryParams = useMemo(
    () => ({
      page: String(currentPage),
      limit: String(REVIEWS_PER_PAGE),
      ...(selectedRating !== 'all' && { rating: selectedRating })
    }),
    [currentPage, selectedRating]
  )

  const { data: reviewsData, isLoading, isFetching } = useDishReviewListQuery(dish._id, isOpen, queryParams)

  const reviews = reviewsData?.payload.result.reviews ?? []
  const totalReviews = reviewsData?.payload.result.total ?? 0
  const totalPages = Math.ceil(totalReviews / REVIEWS_PER_PAGE)

  // Reset về trang 1 khi thay đổi filter
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedRating])

  const handleRatingFilter = (value: string) => {
    setSelectedRating(value)
  }

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }

  // Sử dụng stats từ API
  const averageRating = statsData?.payload.result.average_rating ?? 0
  const totalAllReviews = statsData?.payload.result.total_reviews ?? 0
  const ratingDistribution = statsData?.payload.result.rating_distribution ?? {}

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl w-[95vw] max-h-[90vh] p-0 overflow-hidden flex flex-col'>
        {/* Header - Fixed */}
        <div className='bg-gradient-to-r from-amber-50 to-orange-50 p-6 border-b flex-shrink-0'>
          <DialogHeader className='space-y-4'>
            <DialogTitle className='text-2xl font-bold text-gray-900 text-balance flex items-center gap-2'>
              <MessageSquare className='h-6 w-6 text-amber-600' />
              Rate the dish: {dish.name}
            </DialogTitle>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <StarRating rating={averageRating} size='lg' />
                <div className='text-sm text-gray-600'>
                  <span className='font-semibold'>{totalAllReviews}</span> reviews
                </div>
              </div>
              <div className='text-right'>
                <div className='text-3xl font-bold text-amber-600'>{averageRating.toFixed(1)}</div>
                <div className='text-sm text-gray-500'>out of 5</div>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content - Scrollable */}
        <div className='flex-1 min-h-0 overflow-y-auto'>
          <div className='p-6 space-y-6'>
            {/* Rating Distribution */}
            <div className='bg-gray-50 rounded-xl p-5'>
              <h3 className='font-semibold text-gray-900 mb-4'>Rating distribution</h3>
              <div className='space-y-1'>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <RatingProgressBar
                    key={rating}
                    rating={rating}
                    count={ratingDistribution[rating] || 0}
                    total={totalAllReviews}
                  />
                ))}
              </div>
            </div>

            {/* Filter */}
            <div className='flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm'>
              <div className='flex items-center gap-4'>
                <span className='text-sm font-semibold text-gray-700'>Filter by:</span>
                <Select value={selectedRating} onValueChange={handleRatingFilter}>
                  <SelectTrigger className='w-44 border-gray-300'>
                    <SelectValue placeholder='Choose number of stars' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All reviews</SelectItem>
                    <SelectItem value='5'>⭐⭐⭐⭐⭐ ({ratingDistribution['5'] || 0})</SelectItem>
                    <SelectItem value='4'>⭐⭐⭐⭐ ({ratingDistribution['4'] || 0})</SelectItem>
                    <SelectItem value='3'>⭐⭐⭐ ({ratingDistribution['3'] || 0})</SelectItem>
                    <SelectItem value='2'>⭐⭐ ({ratingDistribution['2'] || 0})</SelectItem>
                    <SelectItem value='1'>⭐ ({ratingDistribution['1'] || 0})</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='text-sm text-center text-gray-500 bg-gray-100 px-3 py-1 rounded-full'>
                {totalReviews} results
              </div>
            </div>

            {/* Reviews List */}
            <div className='min-h-[400px]'>
              {isLoading ? (
                <div className='flex flex-col items-center justify-center py-12'>
                  <Loader2 className='h-8 w-8 animate-spin text-amber-600' />
                  <span className='mt-3 text-sm text-gray-500'>Loading reviews...</span>
                </div>
              ) : reviews.length === 0 ? (
                <div className='text-center py-12'>
                  <MessageSquare className='h-12 w-12 text-gray-300 mx-auto mb-4' />
                  <div className='text-gray-500'>
                    {selectedRating === 'all'
                      ? 'There are no reviews for this dish yet'
                      : `No ${selectedRating} star rating`}
                  </div>
                </div>
              ) : (
                <div className='space-y-4 relative'>
                  {isFetching && (
                    <div className='absolute top-0 right-0 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2'>
                      <Loader2 className='h-4 w-4 animate-spin text-amber-600' />
                    </div>
                  )}

                  {reviews.map((review, index) => (
                    <div
                      key={review._id}
                      className={cn(
                        'bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow',
                        index === 0 && 'border-amber-200 bg-amber-50/30'
                      )}
                    >
                      <div className='flex items-start justify-between'>
                        <div className='flex items-start gap-4'>
                          <Avatar className='h-12 w-12 border-2 border-white shadow-sm'>
                            <AvatarImage src={review.author.avatar || ''} alt={review.author.name} />
                            <AvatarFallback className='bg-gradient-to-br from-amber-400 to-orange-500 text-white font-semibold'>
                              {review.author.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className='space-y-2'>
                            <div className='flex items-center gap-3'>
                              <span className='font-semibold text-gray-900'>{review.author.name}</span>
                              <Badge variant={getRoleBadgeVariant(review.author.role)} className='text-xs px-2 py-1'>
                                {review.author.role}
                              </Badge>
                            </div>
                            <StarRating rating={review.rating} size='sm' />
                          </div>
                        </div>

                        <div className='text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md'>
                          {formatDate(review.created_at)}
                        </div>
                      </div>

                      {review.comment && (
                        <div className='text-sm leading-relaxed text-gray-700 pl-16 bg-gray-50 p-4 rounded-lg border-l-4 border-amber-400'>
                          {review.comment}
                        </div>
                      )}

                      {review.updated_at && review.updated_at !== review.created_at && (
                        <div className='text-xs text-gray-400 pl-16 italic'>
                          Edited: {formatDate(review.updated_at)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pagination - Fixed at bottom */}
        {totalReviews > REVIEWS_PER_PAGE && (
          <div className='flex items-center justify-between border-t bg-gray-50 px-6 py-4 flex-shrink-0'>
            <div className='text-sm text-gray-600'>
              Page <span className='font-semibold'>{currentPage}</span> /{' '}
              <span className='font-semibold'>{totalPages}</span>
              <span className='text-gray-400 ml-2'>({totalReviews} reviews)</span>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={handlePreviousPage}
                disabled={currentPage === 1 || isFetching}
                className='hover:bg-amber-50 hover:border-amber-300'
              >
                <ChevronLeft className='h-4 w-4' />
                Previous
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={handleNextPage}
                disabled={currentPage === totalPages || isFetching}
                className='hover:bg-amber-50 hover:border-amber-300'
              >
                Next
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
