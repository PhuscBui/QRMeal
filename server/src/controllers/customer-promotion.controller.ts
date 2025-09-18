import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { CUSTOMER_PROMOTION_MESSAGE } from '~/constants/messages'
import {
  CreateCustomerPromotionReqBody,
  CustomerPromotionReqParams,
  DeleteCustomerPromotionReqBody,
  UsedPromotionReqBody
} from '~/models/requests/CustomerPromotion.request'
import customerPromotionService from '~/services/customer-promotion.service'

export const getCustomerPromotionByCustomerIdController = async (
  req: Request<CustomerPromotionReqParams>,
  res: Response
) => {
  const result = req.customerPromotions

  res.json({
    message: CUSTOMER_PROMOTION_MESSAGE.CUSTOMER_PROMOTIONS_FETCHED,
    result: result
  })
}

export const createCustomerPromotionController = async (
  req: Request<ParamsDictionary, unknown, CreateCustomerPromotionReqBody>,
  res: Response
) => {
  const result = await customerPromotionService.createCustomerPromotion(req.body)

  res.json({
    message: CUSTOMER_PROMOTION_MESSAGE.CUSTOMER_PROMOTION_CREATED,
    result: result
  })
}

export const usedPromotionController = async (
  req: Request<ParamsDictionary, unknown, UsedPromotionReqBody>,
  res: Response
) => {
  const { customer_id, promotion_id } = req.body
  const result = await customerPromotionService.usedPromotion(customer_id, promotion_id)

  if (!result) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: CUSTOMER_PROMOTION_MESSAGE.CUSTOMER_PROMOTION_NOT_FOUND
    })
    return
  }

  res.json({
    message: CUSTOMER_PROMOTION_MESSAGE.CUSTOMER_PROMOTION_USED,
    result: result
  })
}

export const deleteCustomerPromotionController = async (
  req: Request<ParamsDictionary, unknown, DeleteCustomerPromotionReqBody>,
  res: Response
) => {
  const { customer_id, promotion_id } = req.body
  const result = await customerPromotionService.deleteCustomerPromotion(customer_id, promotion_id)

  if (!result) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: CUSTOMER_PROMOTION_MESSAGE.CUSTOMER_PROMOTION_NOT_FOUND
    })
    return
  }

  res.json({
    message: CUSTOMER_PROMOTION_MESSAGE.CUSTOMER_PROMOTION_DELETED
  })
}
