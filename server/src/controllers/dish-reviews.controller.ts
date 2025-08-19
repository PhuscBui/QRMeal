import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  CreateDishReviewReqBody,
  GetDishReviewParam,
  GetDishReviewsByDishParam,
  GetDishReviewsByGuestParam,
  UpdateDishReviewParam,
  UpdateDishReviewReqBody,
  DeleteDishReviewParam,
  GetDishReviewsQuery
} from '../models/requests/DishReview.request'
import dishReviewService from '~/services/dish-reviews.service'
import HTTP_STATUS from '~/constants/httpStatus'
import { DISH_REVIEWS_MESSAGE } from '~/constants/messages'
import { TokenPayload } from '~/models/requests/Account.request'

export const createDishReviewController = async (
  req: Request<ParamsDictionary, unknown, CreateDishReviewReqBody>,
  res: Response
) => {
  const { account_id, role } = req.decoded_authorization as TokenPayload
  const result = await dishReviewService.createDishReview(account_id, role, req.body)
  res.status(HTTP_STATUS.CREATED).json({
    message: DISH_REVIEWS_MESSAGE.DISH_REVIEW_CREATED,
    result: result
  })
}

export const getDishReviewByIdController = async (req: Request<GetDishReviewParam>, res: Response) => {
  const result = req.dishReview
  res.status(HTTP_STATUS.OK).json({
    message: DISH_REVIEWS_MESSAGE.DISH_REVIEW_FETCHED,
    result: result
  })
}

export const getDishReviewsByDishController = async (
  req: Request<GetDishReviewsByDishParam, unknown, unknown, GetDishReviewsQuery>,
  res: Response
) => {
  const result = await dishReviewService.getDishReviewsByDish(req.params.dishId, req.query)
  res.status(HTTP_STATUS.OK).json({
    message: DISH_REVIEWS_MESSAGE.DISH_REVIEWS_FETCHED,
    result: result
  })
}

export const getDishReviewsStatsController = async (req: Request<GetDishReviewsByDishParam>, res: Response) => {
  const result = await dishReviewService.getDishReviewStats(req.params.dishId)
  res.status(HTTP_STATUS.OK).json({
    message: DISH_REVIEWS_MESSAGE.DISH_REVIEWS_STATS_FETCHED,
    result: result
  })
}

export const getDishReviewsByGuestController = async (
  req: Request<GetDishReviewsByGuestParam, unknown, unknown, GetDishReviewsQuery>,
  res: Response
) => {
  const result = await dishReviewService.getDishReviewsByGuest(req.params.guestId, req.query)
  res.status(HTTP_STATUS.OK).json({
    message: DISH_REVIEWS_MESSAGE.DISH_REVIEWS_FETCHED,
    result: result
  })
}

export const updateDishReviewController = async (
  req: Request<UpdateDishReviewParam, unknown, UpdateDishReviewReqBody>,
  res: Response
) => {
  const { account_id } = req.decoded_authorization as TokenPayload

  const review = req.dishReview

  if (!review || review.author_id.toString() !== account_id) {
    res.status(HTTP_STATUS.FORBIDDEN).json({
      message: DISH_REVIEWS_MESSAGE.DISH_REVIEW_NOT_AUTHORIZED
    })
    return
  }

  const result = await dishReviewService.updateDishReview(req.params.reviewId, req.body)
  res.status(HTTP_STATUS.OK).json({
    message: DISH_REVIEWS_MESSAGE.DISH_REVIEW_UPDATED,
    result: result
  })
}

export const deleteDishReviewController = async (req: Request<DeleteDishReviewParam>, res: Response) => {
  const { account_id } = req.decoded_authorization as TokenPayload

  const review = req.dishReview
  if (!review || review.author_id.toString() !== account_id) {
    res.status(HTTP_STATUS.FORBIDDEN).json({
      message: DISH_REVIEWS_MESSAGE.DISH_REVIEW_NOT_AUTHORIZED
    })
    return
  }

  await dishReviewService.deleteDishReview(req.params.reviewId)
  res.status(HTTP_STATUS.OK).json({
    message: DISH_REVIEWS_MESSAGE.DISH_REVIEW_DELETED
  })
}
