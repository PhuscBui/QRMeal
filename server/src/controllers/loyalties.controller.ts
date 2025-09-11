import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { LOYALTY_MESSAGE } from '~/constants/messages'
import { LoyaltyParams, UpdateLoyaltyReqBody } from '~/models/requests/GuestLoyalty.request'
import loyaltyService from '~/services/loyalties.service'

export const getAllLoyaltyController = async (req: Request<ParamsDictionary>, res: Response) => {
  const result = await loyaltyService.getAllLoyalties()
  res.status(HTTP_STATUS.OK).json({
    message: LOYALTY_MESSAGE.LOYALTIES_FETCHED,
    result: result
  })
}

export const getLoyaltyByCustomerIdController = async (req: Request<LoyaltyParams>, res: Response) => {
  const result = req.loyalty
  res.status(HTTP_STATUS.OK).json({
    message: LOYALTY_MESSAGE.LOYALTY_FETCHED,
    result: result
  })
}

export const updateLoyaltyController = async (
  req: Request<LoyaltyParams, unknown, UpdateLoyaltyReqBody>,
  res: Response
) => {
  const loyalty = req.body
  const { customerId } = req.params
  const result = await loyaltyService.updateLoyalty(customerId, loyalty)
  res.status(HTTP_STATUS.OK).json({
    message: LOYALTY_MESSAGE.LOYALTY_UPDATED,
    result: result
  })
}

export const deleteLoyaltyController = async (req: Request<LoyaltyParams>, res: Response) => {
  const { customerId } = req.params
  await loyaltyService.deleteLoyalty(customerId)
  res.status(HTTP_STATUS.OK).json({
    message: LOYALTY_MESSAGE.LOYALTY_DELETED
  })
}
