import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { GUEST_PROMOTION_MESSAGE } from '~/constants/messages'
import {
  CreateGuestPromotionReqBody,
  DeleteGuestPromotionReqBody,
  GuestPromotionByPhoneReqParams,
  GuestPromotionReqParams,
  UsedPromotionReqBody
} from '~/models/requests/GuestPromotion.request'
import { DeleteGuestLoyaltyResponse } from '~/models/response/GuestLoyalty.response'
import {
  CreateGuestPromotionResponse,
  GetGuestPromotionByGuestId,
  UsedPromotionResponse
} from '~/models/response/GuestPromotion.response'
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

export const getGuestPromotionByPhoneController = async (
  req: Request<GuestPromotionByPhoneReqParams, GetGuestPromotionByGuestId>,
  res: Response
) => {
  const { guestPhone } = req.params
  const result = await guestPromotionService.getGuestPromotionByPhone(guestPhone)
  if (!result) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: GUEST_PROMOTION_MESSAGE.GUEST_PROMOTION_NOT_FOUND
    })
    return
  }
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

export const usedPromotionController = async (
  req: Request<ParamsDictionary, UsedPromotionResponse, UsedPromotionReqBody>,
  res: Response
) => {
  const { guest_id, promotion_id } = req.body
  const result = await guestPromotionService.usedPromotion(guest_id, promotion_id)

  if (!result) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: GUEST_PROMOTION_MESSAGE.GUEST_PROMOTION_NOT_FOUND
    })
    return
  }

  res.json({
    message: GUEST_PROMOTION_MESSAGE.GUEST_PROMOTION_USED,
    result: result
  })
}

export const deleteGuestPromotionController = async (
  req: Request<ParamsDictionary, DeleteGuestLoyaltyResponse, DeleteGuestPromotionReqBody>,
  res: Response
) => {
  const { guest_id, promotion_id } = req.body
  const result = await guestPromotionService.deleteGuestPromotion(guest_id, promotion_id)

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
