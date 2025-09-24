import {
  ApplicableToValues,
  DiscountTypeValues,
  PromotionCategoryValues,
  PromotionCategory,
  DiscountType
} from '@/constants/type'
import { PromotionResType } from '@/schemaValidations/promotion.schema'
import { formatCurrency } from '@/lib/utils'

// Types for better type safety
export type Promotion = PromotionResType['result']
export type PromotionCategoryType = (typeof PromotionCategoryValues)[number]
export type DiscountTypeType = (typeof DiscountTypeValues)[number]
export type ApplicableTo = (typeof ApplicableToValues)[number]

// Promotion status utilities
export const isPromotionActive = (promotion: Promotion): boolean => {
  const now = new Date()
  const startDate = new Date(promotion.start_date)
  const endDate = new Date(promotion.end_date)

  return promotion.is_active && now >= startDate && now <= endDate
}

export const isPromotionExpired = (promotion: Promotion): boolean => {
  const now = new Date()
  const endDate = new Date(promotion.end_date)
  return now > endDate
}

export const isPromotionUpcoming = (promotion: Promotion): boolean => {
  const now = new Date()
  const startDate = new Date(promotion.start_date)
  return now < startDate
}

export const getPromotionStatus = (promotion: Promotion): 'active' | 'expired' | 'upcoming' | 'inactive' => {
  if (!promotion.is_active) return 'inactive'
  if (isPromotionExpired(promotion)) return 'expired'
  if (isPromotionUpcoming(promotion)) return 'upcoming'
  return 'active'
}

// Promotion category utilities
export const getPromotionCategoryLabel = (category: PromotionCategoryType): string => {
  switch (category) {
    case PromotionCategory.Discount:
      return 'Discount'
    case PromotionCategory.BuyXGetY:
      return 'Buy X Get Y'
    case PromotionCategory.Loyalty:
      return 'Loyalty Points'
    case PromotionCategory.FreeShip:
      return 'Free Shipping'
    case PromotionCategory.Combo:
      return 'Combo Deal'
    default:
      return 'Unknown'
  }
}

export const getDiscountTypeLabel = (discountType: DiscountTypeType): string => {
  switch (discountType) {
    case DiscountType.Percentage:
      return 'Percentage'
    case DiscountType.Fixed:
      return 'Fixed Amount'
    default:
      return 'Unknown'
  }
}

export const getApplicableToLabel = (applicableTo: ApplicableTo): string => {
  switch (applicableTo) {
    case 'both':
      return 'All Customers'
    case 'customer':
      return 'Registered Customers'
    case 'guest':
      return 'Guests'
    default:
      return 'Unknown'
  }
}

// Discount calculation utilities
export const calculateDiscount = (
  promotion: Promotion,
  originalAmount: number,
  loyaltyPoints?: number,
  dishItems?: { id: string; price: number }[],
  userVisits?: number,
  orderType: 'dine-in' | 'takeaway' | 'delivery' = 'dine-in',
  shippingFee: number = 15000
): { discount: number; promotionApplied: boolean } => {
  if (!isPromotionActive(promotion)) return { discount: 0, promotionApplied: false }

  let discount = 0

  switch (promotion.category) {
    case PromotionCategory.Discount:
      if (!promotion.discount_type || promotion.discount_value === undefined)
        return { discount: 0, promotionApplied: false }

      // Check all conditions
      if (!checkPromotionConditions(promotion.conditions, originalAmount, loyaltyPoints, userVisits)) {
        return { discount: 0, promotionApplied: false }
      }

      if (promotion.discount_type === DiscountType.Percentage) {
        discount = Math.round((originalAmount * promotion.discount_value) / 100)
      } else if (promotion.discount_type === DiscountType.Fixed) {
        discount = promotion.discount_value
      }
      break

    case PromotionCategory.FreeShip:
      // Check conditions for free shipping
      if (!checkPromotionConditions(promotion.conditions, originalAmount, loyaltyPoints, userVisits)) {
        return { discount: 0, promotionApplied: false }
      }

      if (orderType !== 'delivery') {
        return { discount: 0, promotionApplied: false }
      }

      return { discount: Math.min(shippingFee, originalAmount), promotionApplied: true }

    case PromotionCategory.Loyalty:
      if (!checkPromotionConditions(promotion.conditions, originalAmount, loyaltyPoints, userVisits)) {
        return { discount: 0, promotionApplied: false }
      }

      if (promotion.discount_type === DiscountType.Percentage && promotion.discount_value) {
        discount = Math.round((originalAmount * promotion.discount_value) / 100)
      } else if (promotion.discount_type === DiscountType.Fixed && promotion.discount_value) {
        discount = promotion.discount_value
      }
      break

    case PromotionCategory.BuyXGetY:
      if (
        !promotion.conditions?.buy_quantity ||
        !promotion.conditions?.get_quantity ||
        !dishItems?.length ||
        !checkPromotionConditions(promotion.conditions, originalAmount, loyaltyPoints, userVisits)
      ) {
        return { discount: 0, promotionApplied: false }
      }

      // If applicable_items is specified, only count those items
      const eligibleItems = promotion.conditions.applicable_items?.length
        ? dishItems.filter((item) => promotion.conditions?.applicable_items?.includes(item.id))
        : dishItems

      if (eligibleItems.length >= promotion.conditions.buy_quantity) {
        // Calculate how many complete sets we can make
        const completeSets = Math.floor(eligibleItems.length / promotion.conditions.buy_quantity)
        const freeItemsCount = completeSets * promotion.conditions.get_quantity

        // Sort by price to give away cheapest items for free (common business practice)
        const sortedItems = eligibleItems.sort((a, b) => a.price - b.price)

        // Calculate discount as the sum of free items (up to available quantity)
        const actualFreeItems = Math.min(freeItemsCount, eligibleItems.length)
        discount = sortedItems.slice(0, actualFreeItems).reduce((sum, item) => sum + item.price, 0)
      }
      break

    case PromotionCategory.Combo:
      if (
        !dishItems?.length ||
        !promotion.conditions?.applicable_items?.length ||
        !checkPromotionConditions(promotion.conditions, originalAmount, loyaltyPoints, userVisits)
      ) {
        return { discount: 0, promotionApplied: false }
      }

      // Count available items
      const itemCounts: Record<string, number> = {}
      dishItems.forEach((item) => {
        itemCounts[item.id] = (itemCounts[item.id] || 0) + 1
      })

      // Check if all required items exist
      const hasAllComboItems = promotion.conditions.applicable_items.every((itemId) => (itemCounts[itemId] || 0) >= 1)

      if (hasAllComboItems) {
        const minQuantity = Math.min(...promotion.conditions.applicable_items.map((itemId) => itemCounts[itemId] || 0))

        if (minQuantity > 0) {
          // Tính tổng giá combo dựa trên giá của từng món DISTINCT (không trùng lặp)
          let comboTotalPrice = 0

          for (const itemId of promotion.conditions.applicable_items) {
            // Tìm món đầu tiên có id này để lấy giá
            const item = dishItems.find((d) => d.id === itemId)
            if (item) {
              comboTotalPrice += item.price
            }
          }

          console.log('Combo total price (distinct items):', comboTotalPrice)

          if (promotion.discount_value) {
            // discount_value ở đây là giá combo (90k)
            // Discount = tổng giá các món riêng lẻ - giá combo
            // Ví dụ: 185k - 90k = 95k discount
            discount = Math.max(0, comboTotalPrice - promotion.discount_value) * minQuantity
          }
        }
      }
      break

    default:
      return { discount: 0, promotionApplied: false }
  }

  // Ensure discount doesn't exceed original amount
  return { discount: Math.min(discount, originalAmount), promotionApplied: true }
}

// Helper function to check all promotion conditions
const checkPromotionConditions = (
  conditions: Promotion['conditions'],
  originalAmount: number,
  loyaltyPoints?: number,
  userVisits?: number
): boolean => {
  console.log('Checking promotion conditions:', conditions, { originalAmount, loyaltyPoints, userVisits })
  if (!conditions) return true

  // Check minimum spend
  if (conditions.min_spend && originalAmount < conditions.min_spend) {
    return false
  }

  // Check minimum loyalty points
  if (conditions.min_loyalty_points && (!loyaltyPoints || loyaltyPoints < conditions.min_loyalty_points)) {
    return false
  }

  // Check minimum visits
  if (conditions.min_visits && (!userVisits || userVisits < conditions.min_visits)) {
    return false
  }

  return true
}

export const calculateTotalDiscount = (
  promotions: Promotion[],
  originalAmount: number,
  loyaltyPoints?: number,
  dishItems?: { id: string; price: number }[],
  userVisits?: number,
  orderType: 'dine-in' | 'takeaway' | 'delivery' = 'dine-in',
  shippingFee: number = 15000,
  allowStacking: boolean = true // Option to enable/disable promotion stacking
): { discount: number; promotionsApplied: string[] } => {
  if (!allowStacking) {
    // If stacking not allowed, find the best single promotion
    let maxDiscount = 0
    const promotionsApplied = []
    for (const promotion of promotions) {
      const discount = calculateDiscount(
        promotion,
        originalAmount,
        loyaltyPoints,
        dishItems,
        userVisits,
        orderType,
        shippingFee
      )
      maxDiscount = Math.max(maxDiscount, discount.discount)
      if (discount.promotionApplied) promotionsApplied.push(promotion._id)
    }

    return { discount: Math.min(maxDiscount, originalAmount), promotionsApplied }
  }

  // Stacking allowed - apply promotions in order of effectiveness
  const sortedPromotions = [...promotions].sort((a, b) => {
    const discountA = calculateDiscount(a, originalAmount, loyaltyPoints, dishItems, userVisits, orderType, shippingFee)
    const discountB = calculateDiscount(b, originalAmount, loyaltyPoints, dishItems, userVisits, orderType, shippingFee)
    return discountB.discount - discountA.discount
  })

  let totalDiscount = 0
  let remainingAmount = originalAmount

  for (const promotion of sortedPromotions) {
    if (remainingAmount <= 0) break

    // For stacking, some promotions might need to be calculated on remaining amount
    // while others (like FreeShip) should use original amount
    const baseAmount = promotion.category === PromotionCategory.FreeShip ? originalAmount : remainingAmount

    const discount = calculateDiscount(
      promotion,
      baseAmount,
      loyaltyPoints,
      dishItems,
      userVisits,
      orderType,
      shippingFee
    )

    if (discount.discount > 0) {
      const actualDiscount = Math.min(discount.discount, remainingAmount)
      totalDiscount += actualDiscount
      remainingAmount -= actualDiscount
    }
  }

  return { discount: Math.min(totalDiscount, originalAmount), promotionsApplied: sortedPromotions.map((p) => p._id) }
}

export const calculateFinalAmount = (
  originalAmount: number,
  promotions: Promotion[],
  loyaltyPoints?: number,
  dishItems?: { id: string; price: number }[],
  userVisits?: number,
  orderType: 'dine-in' | 'takeaway' | 'delivery' = 'dine-in',
  shippingFee: number = 15000,
  allowStacking: boolean = true
): { finalAmount: number; promotionsApplied: string[] } => {
  const totalDiscount = calculateTotalDiscount(
    promotions,
    originalAmount,
    loyaltyPoints,
    dishItems,
    userVisits,
    orderType,
    shippingFee,
    allowStacking
  )
  if (orderType === 'delivery') {
    return {
      finalAmount: Math.max(0, originalAmount - totalDiscount.discount) + shippingFee,
      promotionsApplied: totalDiscount.promotionsApplied
    }
  }
  return {
    finalAmount: Math.max(0, originalAmount - totalDiscount.discount),
    promotionsApplied: totalDiscount.promotionsApplied
  }
}

// Validation utilities
export const canApplyPromotion = (
  promotion: Promotion,
  orderAmount: number,
  customerVisits?: number,
  customerLoyaltyPoints?: number
): { canApply: boolean; reason?: string } => {
  if (!isPromotionActive(promotion)) {
    return { canApply: false, reason: 'Promotion is not active' }
  }

  const conditions = promotion.conditions

  if (conditions?.min_spend && orderAmount < conditions.min_spend) {
    return {
      canApply: false,
      reason: `Minimum spend of ${formatCurrency(conditions.min_spend)} required`
    }
  }

  if (conditions?.min_visits && customerVisits !== undefined && customerVisits < conditions.min_visits) {
    return {
      canApply: false,
      reason: `Minimum ${conditions.min_visits} visits required`
    }
  }

  if (
    conditions?.min_loyalty_points &&
    customerLoyaltyPoints !== undefined &&
    customerLoyaltyPoints < conditions.min_loyalty_points
  ) {
    return {
      canApply: false,
      reason: `Minimum ${conditions.min_loyalty_points} loyalty points required`
    }
  }

  return { canApply: true }
}

// Formatting utilities
export const formatPromotionValue = (promotion: Promotion): string => {
  if (
    promotion.category === PromotionCategory.Discount &&
    promotion.discount_type &&
    promotion.discount_value !== undefined
  ) {
    if (promotion.discount_type === DiscountType.Percentage) {
      return `${promotion.discount_value}%`
    } else if (promotion.discount_type === DiscountType.Fixed) {
      return formatCurrency(promotion.discount_value)
    }
  }

  if (promotion.category === PromotionCategory.BuyXGetY && promotion.conditions) {
    return `Buy ${promotion.conditions.buy_quantity || 0} Get ${promotion.conditions.get_quantity || 0}`
  }

  if (promotion.category === PromotionCategory.FreeShip) {
    return 'Free Shipping'
  }

  return 'Special Offer'
}

export const formatPromotionDescription = (promotion: Promotion): string => {
  let description = promotion.description

  if (promotion.conditions?.min_spend) {
    description += ` (Min spend: ${formatCurrency(promotion.conditions.min_spend)})`
  }

  if (promotion.conditions?.min_visits) {
    description += ` (Min visits: ${promotion.conditions.min_visits})`
  }

  if (promotion.conditions?.min_loyalty_points) {
    description += ` (Min loyalty points: ${promotion.conditions.min_loyalty_points})`
  }

  return description
}

// Filtering utilities
export const filterActivePromotions = (promotions: Promotion[]): Promotion[] => {
  return promotions.filter(isPromotionActive)
}

export const filterPromotionsByCategory = (promotions: Promotion[], category: PromotionCategoryType): Promotion[] => {
  return promotions.filter((promotion) => promotion.category === category)
}

export const filterPromotionsByApplicableTo = (promotions: Promotion[], applicableTo: ApplicableTo): Promotion[] => {
  return promotions.filter(
    (promotion) => promotion.applicable_to === applicableTo || promotion.applicable_to === 'both'
  )
}

// Sorting utilities
export const sortPromotionsByEndDate = (promotions: Promotion[], ascending = true): Promotion[] => {
  return [...promotions].sort((a, b) => {
    const dateA = new Date(a.end_date)
    const dateB = new Date(b.end_date)
    return ascending ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime()
  })
}

export const sortPromotionsByDiscountValue = (promotions: Promotion[], descending = true): Promotion[] => {
  return [...promotions].sort((a, b) => {
    const valueA = a.discount_value || 0
    const valueB = b.discount_value || 0
    return descending ? valueB - valueA : valueA - valueB
  })
}

// Best promotion selector
export const getBestApplicablePromotion = (
  promotions: Promotion[],
  orderAmount: number,
  cheapestItemPrice?: number,
  customerVisits?: number,
  customerLoyaltyPoints?: number
): Promotion | null => {
  const applicablePromotions = promotions.filter((promotion) => {
    const { canApply } = canApplyPromotion(promotion, orderAmount, customerVisits, customerLoyaltyPoints)
    return canApply
  })

  if (applicablePromotions.length === 0) return null

  // Find promotion with highest discount value
  return applicablePromotions.reduce((best, current) => {
    const bestDiscount = calculateDiscount(best, orderAmount, cheapestItemPrice)
    const currentDiscount = calculateDiscount(current, orderAmount, cheapestItemPrice)
    return currentDiscount > bestDiscount ? current : best
  })
}

// Date utilities
export const getDaysUntilExpiry = (promotion: Promotion): number => {
  const now = new Date()
  const endDate = new Date(promotion.end_date)
  const diffTime = endDate.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export const getDaysUntilStart = (promotion: Promotion): number => {
  const now = new Date()
  const startDate = new Date(promotion.start_date)
  const diffTime = startDate.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export const isPromotionEndingSoon = (promotion: Promotion, days = 3): boolean => {
  const daysUntilExpiry = getDaysUntilExpiry(promotion)
  return daysUntilExpiry <= days && daysUntilExpiry > 0
}
