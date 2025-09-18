'use client'

import { useState } from 'react'
import { Gift, Star, Percent, Calendar, MapPin, Users, Award, Zap, Crown, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useGetLoyaltyQuery } from '@/queries/useLoyalty'
import { useAccountMe } from '@/queries/useAccount'
import { usePromotionListQuery } from '@/queries/usePromotion'
import { PromotionResType } from '@/schemaValidations/promotion.schema'
import {
  useAddCustomerPromotionMutation,
  useDeleteCustomerPromotionMutation,
  useGetCustomerPromotionQuery
} from '@/queries/useCustomerPromotion'
import { toast } from 'sonner'
import { handleErrorApi } from '@/lib/utils'

// Updated to match schema categories
const promotionCategories = {
  discount: { label: 'Discount', icon: Percent, color: 'bg-red-500' },
  buy_x_get_y: { label: 'Buy X Get Y', icon: Gift, color: 'bg-green-500' },
  free_shipping: { label: 'Free Shipping', icon: MapPin, color: 'bg-blue-500' },
  loyalty_bonus: { label: 'Membership Bonus', icon: Crown, color: 'bg-yellow-500' },
  combo: { label: 'Special Combo', icon: Users, color: 'bg-purple-500' }
}

// Loyalty levels based on points
const getLoyaltyLevel = (points: number) => {
  if (points >= 10000) return { name: 'Diamond', nextLevel: 'Max', nextPoints: points }
  if (points >= 5000) return { name: 'Gold', nextLevel: 'Diamond', nextPoints: 10000 }
  if (points >= 2000) return { name: 'Silver', nextLevel: 'Gold', nextPoints: 5000 }
  if (points >= 500) return { name: 'Bronze', nextLevel: 'Silver', nextPoints: 2000 }
  return { name: 'New member', nextLevel: 'Bronze', nextPoints: 500 }
}

export default function PromotionsPage() {
  const [selectedTab, setSelectedTab] = useState('all')
  const { data: userData, isLoading: isLoadingUser } = useAccountMe()
  const user = userData?.payload.result
  const { data: loyaltyData, isLoading: isLoadingLoyalty } = useGetLoyaltyQuery({
    customerId: user?._id,
    enabled: !!user
  })
  const { data: promotionsData, isLoading: isLoadingPromotions } = usePromotionListQuery()
  const { data } = useGetCustomerPromotionQuery({
    customerId: user?._id ?? '',
    enabled: !!user?._id
  })
  const customerPromotions = data?.payload.result || []
  const addCustomerPromotion = useAddCustomerPromotionMutation()
  const deleteCustomerPromotion = useDeleteCustomerPromotionMutation()
  const promotions = promotionsData?.payload.result || []
  const loyalty = loyaltyData?.payload.result

  const filteredPromotions = promotions.filter((promo) => {
    if (selectedTab === 'all') return true
    return promo.category === selectedTab
  })

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getCategoryInfo = (category: string) => {
    return promotionCategories[category as keyof typeof promotionCategories] || promotionCategories.discount
  }

  const getDiscountDisplay = (promo: PromotionResType['result']) => {
    if (promo.category === 'discount' && promo.discount_type && promo.discount_value) {
      if (promo.discount_type === 'percentage') {
        return `${promo.discount_value}%`
      } else if (promo.discount_type === 'fixed') {
        return `${promo.discount_value.toLocaleString('vi-VN')}₫`
      }
    }
    if (promo.category === 'buy_x_get_y' && promo.conditions) {
      return `Buy ${promo.conditions.buy_quantity} get ${promo.conditions.get_quantity}`
    }
    return 'Offer'
  }

  const isUsed = (promotionId: string) => {
    if (Array.isArray(customerPromotions)) {
      return customerPromotions.some((promotion: { promotion_id: string; used: boolean }) => {
        return promotion.promotion_id === promotionId && promotion.used
      })
    }
    return false
  }

  const getLoyaltyInfo = () => {
    if (!loyalty) return null
    const level = getLoyaltyLevel(loyalty.loyalty_points)
    return {
      ...level,
      currentPoints: loyalty.loyalty_points,
      totalSpend: loyalty.total_spend,
      visitCount: loyalty.visit_count
    }
  }

  const isApply = (promotionId: string) => {
    if (Array.isArray(customerPromotions)) {
      return customerPromotions.some((promotion: { promotion_id: string }) => promotion.promotion_id === promotionId)
    }
    return false
  }

  const canApplyPromotion = (promotion: PromotionResType['result']): boolean => {
    const now = new Date()

    // Check validity period
    if (promotion.start_date && new Date(promotion.start_date) > now) return false
    if (promotion.end_date && new Date(promotion.end_date) < now) return false

    // Check if promotion is active
    if (!promotion.is_active) return false

    // Check applicable_to constraint
    if (promotion.applicable_to === 'guest') return false

    if ((promotion.conditions?.min_visits ?? 0) > (loyalty?.visit_count ?? 0)) return false

    return true
  }

  const applyPromotion = async (promotionId: string) => {
    if (!user) return
    try {
      const result = await addCustomerPromotion.mutateAsync({
        customer_id: user._id ? user._id : '',
        promotion_id: promotionId
      })
      toast.success(result.payload.message)
    } catch (error) {
      toast.error('Failed to apply promotion')
      console.error('Error applying promotion:', error)
    }
  }

  const removePromotion = async (promotionId: string) => {
    if (!user) return
    try {
      const result = await deleteCustomerPromotion.mutateAsync({
        customer_id: user._id ? user._id : '',
        promotion_id: promotionId
      })
      toast.success(result.payload.message)
    } catch (error) {
      toast.error('Failed to remove promotion')
      console.error('Error removing promotion:', error)
      handleErrorApi({ error })
    }
  }

  const loyaltyInfo = getLoyaltyInfo()

  if (isLoadingUser || isLoadingLoyalty || isLoadingPromotions) {
    return (
      <div className='container mx-auto px-4 py-6'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <RefreshCw className='h-8 w-8 animate-spin mx-auto mb-4' />
            <p>Loading promotions...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-4 py-6'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Promotions & Offers</h1>
        <p className='text-muted-foreground'>Discover great deals for you</p>
      </div>

      {/* Loyalty Program */}
      {loyaltyInfo && (
        <Card className='mb-8 bg-gradient-to-r from-yellow-400 to-orange-500 text-white'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-3'>
                <Crown className='h-8 w-8' />
                <div>
                  <h3 className='text-xl font-bold'>Membership Program</h3>
                  <p className='text-yellow-100'>Level: {loyaltyInfo.name}</p>
                </div>
              </div>
              <Badge className='bg-white text-orange-500 font-semibold'>{loyaltyInfo.currentPoints} point</Badge>
            </div>

            <div className='space-y-3'>
              {loyaltyInfo.nextLevel !== 'Maximum' && (
                <>
                  <div className='flex justify-between text-sm'>
                    <span>Level up progress {loyaltyInfo.nextLevel}</span>
                    <span>
                      {loyaltyInfo.currentPoints}/{loyaltyInfo.nextPoints}
                    </span>
                  </div>
                  <Progress
                    value={(loyaltyInfo.currentPoints / loyaltyInfo.nextPoints) * 100}
                    className='h-2 bg-white/20'
                  />
                </>
              )}

              <div className='grid grid-cols-2 md:grid-cols-3 gap-4 mt-4'>
                <div className='flex items-center gap-2 text-sm'>
                  <Star className='h-4 w-4 fill-white' />
                  <span>Cumulative: {loyaltyInfo.totalSpend.toLocaleString('vi-VN')}$</span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <Users className='h-4 w-4 fill-white' />
                  <span>Purchases: {loyaltyInfo.visitCount}</span>
                </div>
                <div className='flex items-center gap-2 text-sm'>
                  <Award className='h-4 w-4 fill-white' />
                  <span>Bonus Points</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className='mb-8'>
        <TabsList className='grid w-full grid-cols-2 md:grid-cols-6'>
          <TabsTrigger value='all'>All</TabsTrigger>
          <TabsTrigger value='discount'>Discount</TabsTrigger>
          <TabsTrigger value='buy_x_get_y'>Buy X get Y</TabsTrigger>
          <TabsTrigger value='freeship'>Free shipping</TabsTrigger>
          <TabsTrigger value='loyalty_bonus'>Member</TabsTrigger>
          <TabsTrigger value='combo'>Combo</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Promotions Grid */}
      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
        {filteredPromotions.map((promo) => {
          const categoryInfo = getCategoryInfo(promo.category)
          const CategoryIcon = categoryInfo.icon
          const discountDisplay = getDiscountDisplay(promo)

          return (
            <Card key={promo._id} className='overflow-hidden hover:shadow-lg transition-shadow'>
              <div className='related'>
                {/* Placeholder image since schema doesn't include image field */}
                <div className='w-full h-48 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center'>
                  <CategoryIcon className='h-12 w-12 text-white' />
                </div>
                <div className='absolute top-3 left-3 flex gap-2'>
                  <Badge className={`${categoryInfo.color} text-white`}>
                    <CategoryIcon className='h-3 w-3 mr-1' />
                    {categoryInfo.label}
                  </Badge>
                  {promo.applicable_to === 'customer' && (
                    <Badge className='bg-red-500 text-white'>
                      <Zap className='h-3 w-3 mr-1' />
                      Loyal customers
                    </Badge>
                  )}
                </div>
                <div className='absolute top-3 right-3'>
                  <Badge variant='secondary' className='bg-white/90 text-black'>
                    {discountDisplay}
                  </Badge>
                </div>
              </div>

              <CardContent className='p-4'>
                <h3 className='font-semibold text-lg mb-2'>{promo.name}</h3>
                <p className='text-muted-foreground text-sm mb-4 line-clamp-2'>{promo.description}</p>

                {/* Validity Period */}
                <div className='flex items-center gap-2 text-sm text-muted-foreground mb-4'>
                  <Calendar className='h-4 w-4' />
                  <span>
                    {formatDate(promo.start_date)} - {formatDate(promo.end_date)}
                  </span>
                </div>

                {/* Conditions */}
                {promo.conditions && (
                  <div className='space-y-2 mb-4'>
                    <h4 className='font-medium text-sm'>Condition:</h4>
                    <ul className='space-y-1'>
                      {promo.conditions.min_spend && (
                        <li className='text-xs text-muted-foreground flex items-start gap-2'>
                          <span className='text-primary mt-1'>•</span>
                          <span>Minimum order: {promo.conditions.min_spend.toLocaleString('en-VN')}$</span>
                        </li>
                      )}
                      {promo.conditions.min_visits && (
                        <li className='text-xs text-muted-foreground flex items-start gap-2'>
                          <span className='text-primary mt-1'>•</span>
                          <span>Minimum {promo.conditions.min_visits} purchases</span>
                        </li>
                      )}
                      {promo.conditions.min_loyalty_points && (
                        <li className='text-xs text-muted-foreground flex items-start gap-2'>
                          <span className='text-primary mt-1'>•</span>
                          <span>Need {promo.conditions.min_loyalty_points} membership points</span>
                        </li>
                      )}
                      {promo.applicable_to === 'customer' && (
                        <li className='text-xs text-muted-foreground flex items-start gap-2'>
                          <span className='text-primary mt-1'>•</span>
                          <span>For loyal customers</span>
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Applicable To */}
                <div className='mb-4'>
                  <Badge variant='outline' className='text-xs'>
                    {promo.applicable_to === 'both'
                      ? 'All customers'
                      : promo.applicable_to === 'guest'
                      ? 'New customers'
                      : promo.applicable_to === 'customer'
                      ? 'Loyal customers'
                      : 'Recent customers'}
                  </Badge>
                </div>

                {/* Action Button */}
                <div>
                  {isUsed(promo._id) ? (
                    <Button variant='outline' className='w-full' disabled>
                      Already used
                    </Button>
                  ) : isApply(promo._id) ? (
                    <Button variant='destructive' className='w-full' onClick={() => removePromotion(promo._id)}>
                      Remove
                    </Button>
                  ) : (
                    <Button
                      variant='default'
                      className='w-full'
                      disabled={!canApplyPromotion(promo)}
                      onClick={() => applyPromotion(promo._id)}
                    >
                      Apply Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredPromotions.length === 0 && (
        <Card>
          <CardContent className='text-center py-12'>
            <Gift className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
            <h3 className='text-lg font-medium mb-2'>No promotions</h3>
            <p className='text-muted-foreground mb-4'>There are currently no promotions in this category</p>
            <Button onClick={() => setSelectedTab('all')}>View all promotions</Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <Button variant='outline' className='h-20 flex-col gap-2'>
              <Gift className='h-6 w-6' />
              <span className='text-sm'>Discount Code</span>
            </Button>
            <Button variant='outline' className='h-20 flex-col gap-2'>
              <Award className='h-6 w-6' />
              <span className='text-sm'>Reward Points</span>
            </Button>
            <Button variant='outline' className='h-20 flex-col gap-2'>
              <Crown className='h-6 w-6' />
              <span className='text-sm'>VIP Card</span>
            </Button>
            <Button variant='outline' className='h-20 flex-col gap-2'>
              <Users className='h-6 w-6' />
              <span className='text-sm'>Refer a Friend</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
