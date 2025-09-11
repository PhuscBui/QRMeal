import { TokenPayload } from '~/models/requests/Account.request'
import Account from '~/models/schemas/Account.schema'
import Category from '~/models/schemas/Category.schema'
import Dish from '~/models/schemas/Dish.schema'
import DishReview from '~/models/schemas/DishReview.schema'
import GuestPromotion from '~/models/schemas/GuestPromotion.schema'
import Loyalty from '~/models/schemas/Loyalty.schema'
import Promotion from '~/models/schemas/Promotion.schema'
import { Table } from '~/models/schemas/Table.schema'

declare module 'express' {
  interface Request {
    user?: Account
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
    category?: Category
    dish?: Dish
    dishReview?: DishReview
    table?: Table
    promotion?: Promotion
    loyalty?: Loyalty
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
