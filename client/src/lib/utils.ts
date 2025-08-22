/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { EntityError } from '@/lib/http'
import { type ClassValue, clsx } from 'clsx'
import { UseFormSetError } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'
import jwt from 'jsonwebtoken'
import { DishStatus, OrderStatus, PromotionType, Role, TableStatus } from '@/constants/type'
import { toast } from 'sonner'
import envConfig from '@/config'
import { format, isValid } from 'date-fns'
import { BookX, CookingPot, HandCoins, Loader, Truck } from 'lucide-react'
import { TokenPayload } from '@/types/jwt.types'
import guestApiRequest from '@/apiRequests/guest'
import authApiRequest from '@/apiRequests/auth'
import { PromotionResType } from '@/schemaValidations/promotion.schema'
import { io } from 'socket.io-client'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Xóa đi ký tự `/` đầu tiên của path
 */
export const normalizePath = (path: string) => {
  return path.startsWith('/') ? path.slice(1) : path
}

export const handleErrorApi = ({
  error,
  setError,
  duration
}: {
  error: any
  setError?: UseFormSetError<any>
  duration?: number
}) => {
  if (error instanceof EntityError && setError) {
    // Xử lý khi error là EntityError và có setError
    if (error.payload && error.payload.errors) {
      // Kiểm tra xem error.payload.errors có phải là một mảng không
      if (Array.isArray(error.payload.errors)) {
        // Nếu là mảng, xử lý như cũ
        error.payload.errors.forEach((item) => {
          setError(item.field, {
            type: 'server',
            message: item.message
          })
        })
      } else {
        // Nếu là object, xử lý theo cấu trúc mới
        Object.entries(error.payload.errors).forEach(([field, details]: [string, any]) => {
          setError(field, {
            type: details.type || 'server',
            message: details.msg || 'Field error'
          })
        })
      }
    }
  } else {
    // Xử lý các loại lỗi khác
    toast('Error', {
      description: error?.payload?.message ?? 'Something went wrong',
      duration: duration ?? 5000,
      style: {
        backgroundColor: 'red'
      }
    })
  }
}

const isBrowser = typeof window !== 'undefined'

export const getAccessTokenFromLocalStorage = () => (isBrowser ? localStorage.getItem('access_token') : null)

export const getRefreshTokenFromLocalStorage = () => (isBrowser ? localStorage.getItem('refresh_token') : null)

export const setAccessTokenToLocalStorage = (value: string) => isBrowser && localStorage.setItem('access_token', value)

export const setRefreshTokenToLocalStorage = (value: string) =>
  isBrowser && localStorage.setItem('refresh_token', value)

export const removeTokensFromLocalStorage = () => {
  if (isBrowser) {
    localStorage.removeItem('access_token')
  }
  if (isBrowser) {
    localStorage.removeItem('refresh_token')
  }
}

export const checkAndRefreshToken = async (param?: { onError?: () => void; onSuccess?: () => void }) => {
  // Không nên đưa logic lấy access và refresh token ra khỏi cái function `checkAndRefreshToken`
  // Vì để mỗi lần mà checkAndRefreshToken() được gọi thì chúng ta se có một access và refresh token mới
  // Tránh hiện tượng bug nó lấy access và refresh token cũ ở lần đầu rồi gọi cho các lần tiếp theo
  const access_token = getAccessTokenFromLocalStorage()
  const refresh_token = getRefreshTokenFromLocalStorage()
  // Chưa đăng nhập thì cũng không cho chạy
  if (!access_token || !refresh_token) return
  const decodedAccessToken = decodeToken(access_token)
  const decodedRefreshToken = decodeToken(refresh_token)
  // Thời điểm hết hạn của token là tính theo epoch time (s)
  // Dùng cú pháp new Date().getTime() thì nó sẽ trả về epoch time (ms)
  const now = Math.round(new Date().getTime() / 1000)
  // trường hợp refresh token hết hạn thì cho logout
  if (decodedRefreshToken.exp <= now) {
    removeTokensFromLocalStorage()
    return param?.onError && param.onError()
  }
  // Ví dụ access token của chúng ta có thời gian hết hạn là 10s
  // thì kiểm tra còn 1/3 thời gian (3s) thì sẽ cho refresh token lại
  // Thời gian còn lại sẽ tính dựa trên công thức: decodedAccessToken.exp - now
  // Thời gian hết hạn của access token dựa trên công thức: decodedAccessToken.exp - decodedAccessToken.iat
  if (decodedAccessToken.exp - now < (decodedAccessToken.exp - decodedAccessToken.iat) / 3) {
    // Gọi API refresh token
    try {
      const role = decodedRefreshToken.role
      const res = role === Role.Guest ? await guestApiRequest.refreshToken() : await authApiRequest.refreshToken()
      setAccessTokenToLocalStorage(res.payload.result.access_token)
      setRefreshTokenToLocalStorage(res.payload.result.refresh_token)
      if (param?.onSuccess) {
        param.onSuccess()
      }
    } catch (error) {
      if (param?.onError) {
        param.onError()
      }
    }
  }
}

export const formatCurrency = (number: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(number)
}

export const getDishStatus = (status: (typeof DishStatus)[keyof typeof DishStatus]) => {
  switch (status) {
    case DishStatus.Available:
      return 'Available'
    case DishStatus.Unavailable:
      return 'Unavailable'
    default:
      return 'Hidden'
  }
}

export const getPromotionType = (type: (typeof PromotionType)[keyof typeof PromotionType]) => {
  switch (type) {
    case PromotionType.Percent:
      return 'Percent'
    case PromotionType.FreeItem:
      return 'Free Item'
    case PromotionType.LoyaltyPoints:
      return 'Loyalty Points'
    default:
      return 'Discount'
  }
}

export const getVietnameseOrderStatus = (status: (typeof OrderStatus)[keyof typeof OrderStatus]) => {
  switch (status) {
    case OrderStatus.Delivered:
      return 'Delivered'
    case OrderStatus.Paid:
      return 'Paid'
    case OrderStatus.Pending:
      return 'Pending'
    case OrderStatus.Processing:
      return 'Processing'
    default:
      return 'Rejected'
  }
}

export const getTableStatus = (status: (typeof TableStatus)[keyof typeof TableStatus]) => {
  switch (status) {
    case TableStatus.Available:
      return 'Available'
    case TableStatus.Reserved:
      return 'Reserved'
    default:
      return 'Hidden'
  }
}

export const getTableLink = ({ token, tableNumber }: { token: string; tableNumber: number }) => {
  return envConfig.NEXT_PUBLIC_URL + '/tables/' + tableNumber + '?token=' + token
}

export const decodeToken = (token: string) => {
  return jwt.decode(token) as TokenPayload
}

export function removeAccents(str: string) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

export const simpleMatchText = (fullText: string, matchText: string) => {
  return removeAccents(fullText.toLowerCase()).includes(removeAccents(matchText.trim().toLowerCase()))
}

export const formatDateTimeToLocaleString = (date: string | Date) => {
  try {
    const dateObj = date instanceof Date ? date : new Date(date)

    if (!isValid(dateObj)) {
      throw new Error('Invalid date format')
    }

    return format(dateObj, 'HH:mm:ss dd/MM/yyyy')
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid date'
  }
}

export const formatDateTimeToTimeString = (date: string | Date) => {
  return format(date instanceof Date ? date : new Date(date), 'HH:mm:ss')
}

export const OrderStatusIcon = {
  [OrderStatus.Pending]: Loader,
  [OrderStatus.Processing]: CookingPot,
  [OrderStatus.Cancelled]: BookX,
  [OrderStatus.Delivered]: Truck,
  [OrderStatus.Paid]: HandCoins
}

export const calculateDiscount = (promotion: PromotionResType['result'], totalPrice: number, freeItem?: number) => {
  if (promotion.discount_type === PromotionType.Percent) {
    return (totalPrice * promotion.discount_value) / 100
  } else if (promotion.discount_type === PromotionType.Discount) {
    return promotion.discount_value
  } else if (promotion.discount_type === PromotionType.FreeItem) {
    return freeItem ?? 0
  } else if (promotion.discount_type === PromotionType.LoyaltyPoints) {
    return promotion.discount_value
  }
  return 0
}

export const generateSocket = (token: string) => {
  return io(envConfig.NEXT_PUBLIC_API_ENDPOINT, {
    auth: {
      Authorization: `Bearer ${token}`
    }
  })
}
