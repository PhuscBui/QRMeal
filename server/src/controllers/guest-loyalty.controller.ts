import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { GUEST_LOYALTY_MESSAGE } from '~/constants/messages'
import { GuestLoyaltyParams, UpdateGuestLoyaltyReqBody } from '~/models/requests/GuestLoyalty.request'
import {
  DeleteGuestLoyaltyResponse,
  GetGuestLoyaltyByPhoneResponse,
  GetGuestLoyaltyResponse,
  UpdateGuestLoyaltyResponse
} from '~/models/response/GuestLoyalty.response'
import guestLoyaltyService from '~/services/guest-loyalty.service'

export const getAllGuestLoyaltyController = async (
  req: Request<ParamsDictionary, GetGuestLoyaltyResponse>,
  res: Response
) => {
  const result = await guestLoyaltyService.getAllGuestLoyalty()
  res.status(HTTP_STATUS.OK).json({
    message: GUEST_LOYALTY_MESSAGE.GUEST_LOYALTIES_FETCHED,
    result: result
  })
}

export const getGuestLoyaltyByPhoneController = async (
  req: Request<GuestLoyaltyParams, GetGuestLoyaltyByPhoneResponse>,
  res: Response
) => {
  const result = req.guestLoyalty
  res.status(HTTP_STATUS.OK).json({
    message: GUEST_LOYALTY_MESSAGE.GUEST_LOYALTY_FETCHED,
    result: result
  })
}

export const updateGuestLoyaltyController = async (
  req: Request<GuestLoyaltyParams, UpdateGuestLoyaltyResponse, UpdateGuestLoyaltyReqBody>,
  res: Response
) => {
  const guestLoyalty = req.body
  const { guestPhone } = req.params
  const result = await guestLoyaltyService.updateGuestLoyalty(guestPhone, guestLoyalty)
  res.status(HTTP_STATUS.OK).json({
    message: GUEST_LOYALTY_MESSAGE.GUEST_LOYALTY_UPDATED,
    result: result
  })
}

export const deleteGuestLoyaltyController = async (
  req: Request<GuestLoyaltyParams, DeleteGuestLoyaltyResponse>,
  res: Response
) => {
  const { guestPhone } = req.params
  await guestLoyaltyService.deleteGuestLoyalty(guestPhone)
  res.status(HTTP_STATUS.OK).json({
    message: GUEST_LOYALTY_MESSAGE.GUEST_LOYALTY_DELETED
  })
}
