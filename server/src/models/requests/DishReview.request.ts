import { ParamsDictionary, Query } from 'express-serve-static-core'

export interface CreateDishReviewReqBody {
  dish_id: string
  rating: number
  comment?: string
}

export interface GetDishReviewParam extends ParamsDictionary {
  reviewId: string
}

export interface GetDishReviewsByDishParam extends ParamsDictionary {
  dishId: string
}

export interface GetDishReviewsByGuestParam extends ParamsDictionary {
  guestId: string
}

export interface UpdateDishReviewParam extends ParamsDictionary {
  reviewId: string
}

export interface UpdateDishReviewReqBody {
  rating?: number
  comment?: string
}

export interface DeleteDishReviewParam extends ParamsDictionary {
  reviewId: string
}

export interface GetDishReviewsQuery extends Query {
  page?: string
  limit?: string
  rating?: string
  sortBy?: 'rating' | 'created_at'
  sortOrder?: 'asc' | 'desc'
  byMe?: string
}
