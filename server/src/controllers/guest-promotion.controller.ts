import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { GUEST_PROMOTION_MESSAGE } from '~/constants/messages'
import {
  CreateGuestPromotionReqBody,
  DeleteGuestPromotionReqParams,
  GuestPromotionReqParams
} from '~/models/requests/GuestPromotion.request'
import { DeleteGuestLoyaltyResponse } from '~/models/response/GuestLoyalty.response'
import { CreateGuestPromotionResponse, GetGuestPromotionByGuestId } from '~/models/response/GuestPromotion.response'
import guestPromotionService from '~/services/guest-promotion.service'

export const getGuestPromotionByGuestIdController = async (
  req: Request<GuestPromotionReqParams, GetGuestPromotionByGuestId>,
  res: Response
) => {
  const result = req.guestPromotions

  res.json({
    message: GUEST_PROMOTION_MESSAGE.GUEST_PROMOTIONS_FETCHED,
    result: result
  })
}

export const createGuestPromotionController = async (
  req: Request<ParamsDictionary, CreateGuestPromotionResponse, CreateGuestPromotionReqBody>,
  res: Response
) => {
  const result = await guestPromotionService.createGuestPromotion(req.body)

  res.json({
    message: GUEST_PROMOTION_MESSAGE.GUEST_PROMOTION_CREATED,
    result: result
  })
}

export const deleteGuestPromotionController = async (
  req: Request<DeleteGuestPromotionReqParams, DeleteGuestLoyaltyResponse>,
  res: Response
) => {
  const { guestPromotionId } = req.params
  const result = await guestPromotionService.deleteGuestPromotion(guestPromotionId)

  if (!result) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: GUEST_PROMOTION_MESSAGE.GUEST_PROMOTION_NOT_FOUND
    })
    return
  }
  res.json({
    message: GUEST_PROMOTION_MESSAGE.GUEST_PROMOTION_DELETED
  })
}
