import { TokenPayload } from '~/models/requests/Account.request'
import Account from '~/models/schemas/Account.schema'
import Dish from '~/models/schemas/Dish.schema'
import GuestLoyalty from '~/models/schemas/GuestLoyalty.schema'
import GuestPromotion from '~/models/schemas/GuestPromotion.schema'
import Promotion from '~/models/schemas/Promotion.schema'

declare module 'express' {
  interface Request {
    user?: Account
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
    dish?: Dish
    promotion?: Promotion
    guestLoyalty?: GuestLoyalty
    guestPromotions?: GuestPromotion[]
  }
}

interface ApiResponse<T = unknown> {
  message: string
  result?: T
}

interface Pagination {
  limit: string
  page: string
}
