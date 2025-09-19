import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { REVENUES_MESSAGE } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import {
  CreateRevenueReqBody,
  GetRevenueByCustomerIdParams,
  GetRevenueByGuestPhoneParams,
  GetRevenuesQueryParams
} from '~/models/requests/Revenue.request'
import revenuesService from '~/services/revenues.service'

export const getRevenuesController = async (
  req: Request<ParamsDictionary, unknown, unknown, GetRevenuesQueryParams>,
  res: Response
) => {
  const result = await revenuesService.getRevenues(req.query)
  res.status(HTTP_STATUS.OK).json({
    message: REVENUES_MESSAGE.REVENUES_FETCHED,
    result: result
  })
}

export const getRevenueByGuestPhoneController = async (req: Request<GetRevenueByGuestPhoneParams>, res: Response) => {
  const result = await revenuesService.getRevenueByGuestPhone(req.params.guestPhone)
  if (result.length === 0) {
    throw new ErrorWithStatus({
      message: REVENUES_MESSAGE.REVENUE_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND
    })
  }
  res.status(HTTP_STATUS.OK).json({
    message: REVENUES_MESSAGE.REVENUE_FETCHED,
    result: result
  })
}

export const getRevenueByCustomerIdController = async (req: Request<GetRevenueByCustomerIdParams>, res: Response) => {
  const result = await revenuesService.getRevenueByCustomerId(req.params.customerId)
  if (result.length === 0) {
    throw new ErrorWithStatus({
      message: REVENUES_MESSAGE.REVENUE_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND
    })
  }
  res.status(HTTP_STATUS.OK).json({
    message: REVENUES_MESSAGE.REVENUE_FETCHED,
    result: result
  })
}

export const createRevenueController = async (
  req: Request<ParamsDictionary, unknown, CreateRevenueReqBody>,
  res: Response
) => {
  const result = await revenuesService.createRevenue(req.body)
  res.status(HTTP_STATUS.CREATED).json({
    message: REVENUES_MESSAGE.REVENUE_CREATED,
    result: result
  })
}
