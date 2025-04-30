import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { PROMOTIONS_MESSAGE } from '~/constants/messages'
import {
  CreatePromotionReqBody,
  GetPromotionsQueryParams,
  PromotionParam,
  UpdatePromotionReqBody
} from '~/models/requests/Promotion.request'
import {
  CreatePromotionResponse,
  DeletePromotionResponse,
  GetPromotionsResponse,
  UpdatePromotionResponse
} from '~/models/response/Promotion.response'
import promotionsService from '~/services/promotions.service'

export const createPromotionController = async (
  req: Request<ParamsDictionary, CreatePromotionResponse, CreatePromotionReqBody>,
  res: Response
) => {
  const result = await promotionsService.createPromotion(req.body)
  res.status(HTTP_STATUS.CREATED).json({
    message: PROMOTIONS_MESSAGE.PROMOTION_CREATED,
    result: result
  })
}

export const getPromotionsController = async (
  req: Request<ParamsDictionary, GetPromotionsResponse, unknown, GetPromotionsQueryParams>,
  res: Response
) => {
  const promotions = await promotionsService.getPromotions(req.query)
  res.status(HTTP_STATUS.OK).json({
    message: PROMOTIONS_MESSAGE.PROMOTIONS_FETCHED,
    result: promotions
  })
}

export const getPromotionDetailController = async (
  req: Request<PromotionParam, GetPromotionsResponse>,
  res: Response
) => {
  const result = req.promotion
  res.status(HTTP_STATUS.OK).json({
    message: PROMOTIONS_MESSAGE.PROMOTION_FETCHED,
    result: result
  })
}

export const updatePromotionController = async (
  req: Request<PromotionParam, UpdatePromotionResponse, UpdatePromotionReqBody>,
  res: Response
) => {
  const result = await promotionsService.updatePromotion(req.params.promotionId, req.body)
  res.status(HTTP_STATUS.OK).json({
    message: PROMOTIONS_MESSAGE.PROMOTION_UPDATED,
    result: result
  })
}

export const deletePromotionController = async (
  req: Request<PromotionParam, DeletePromotionResponse>,
  res: Response
) => {
  await promotionsService.deletePromotion(req.params.promotionId)
  res.status(HTTP_STATUS.OK).json({
    message: PROMOTIONS_MESSAGE.PROMOTION_DELETED
  })
}
