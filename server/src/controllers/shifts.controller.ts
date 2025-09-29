import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { SHIFTS_MESSAGES } from '~/constants/messages'
import { TokenPayload } from '~/models/requests/Account.request'
import {
  CreateShiftReqBody,
  UpdateShiftReqBody,
  GetShiftParam,
  DeleteShiftParam,
  GetShiftsQuery,
  CreateShiftRequestReqBody,
  UpdateShiftRequestReqBody,
  ReviewShiftRequestReqBody
} from '~/models/requests/Shift.request'
import shiftsService from '~/services/shifts.service'

export const createShiftController = async (
  req: Request<ParamsDictionary, unknown, CreateShiftReqBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { account_id } = req.decoded_authorization as TokenPayload
    const result = await shiftsService.createShift(account_id, req.body)
    res.status(HTTP_STATUS.CREATED).json({
      message: SHIFTS_MESSAGES.SHIFT_CREATED,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const createShiftRequestController = async (
  req: Request<ParamsDictionary, unknown, CreateShiftRequestReqBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { account_id } = req.decoded_authorization as TokenPayload
    const result = await shiftsService.createShiftRequest(account_id, req.body)
    res.status(HTTP_STATUS.CREATED).json({
      message: SHIFTS_MESSAGES.SHIFT_REQUEST_CREATED,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const getShiftsController = async (
  req: Request<ParamsDictionary, unknown, unknown, GetShiftsQuery>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await shiftsService.getShifts(req.query)
    res.status(HTTP_STATUS.OK).json({
      message: SHIFTS_MESSAGES.SHIFTS_FETCHED,
      result: result.shifts,
      pagination: result.pagination
    })
  } catch (error) {
    next(error)
  }
}

export const getShiftByIdController = async (req: Request<GetShiftParam>, res: Response, next: NextFunction) => {
  try {
    const shift = await shiftsService.getShiftById(req.params.id)
    if (!shift) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        message: SHIFTS_MESSAGES.SHIFT_NOT_FOUND
      })
      return
    }

    res.status(HTTP_STATUS.OK).json({
      message: SHIFTS_MESSAGES.SHIFT_FETCHED,
      result: shift
    })
  } catch (error) {
    next(error)
  }
}

export const updateShiftController = async (
  req: Request<GetShiftParam, unknown, UpdateShiftReqBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await shiftsService.updateShift(req.params.id, req.body)
    res.status(HTTP_STATUS.OK).json({
      message: SHIFTS_MESSAGES.SHIFT_UPDATED,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const updateShiftRequestController = async (
  req: Request<GetShiftParam, unknown, UpdateShiftRequestReqBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { account_id } = req.decoded_authorization as TokenPayload
    const result = await shiftsService.updateShiftRequest(req.params.id, account_id, req.body)
    res.status(HTTP_STATUS.OK).json({
      message: SHIFTS_MESSAGES.SHIFT_REQUEST_UPDATED,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const reviewShiftRequestController = async (
  req: Request<GetShiftParam, unknown, ReviewShiftRequestReqBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { account_id } = req.decoded_authorization as TokenPayload
    const result = await shiftsService.reviewShiftRequest(req.params.id, account_id, req.body)
    res.status(HTTP_STATUS.OK).json({
      message: SHIFTS_MESSAGES.SHIFT_REQUEST_REVIEWED,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const deleteShiftController = async (req: Request<DeleteShiftParam>, res: Response, next: NextFunction) => {
  try {
    const result = await shiftsService.deleteShift(req.params.id)
    res.status(HTTP_STATUS.OK).json({
      message: SHIFTS_MESSAGES.SHIFT_DELETED,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const cancelShiftRequestController = async (
  req: Request<DeleteShiftParam>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { account_id } = req.decoded_authorization as TokenPayload
    const result = await shiftsService.cancelShiftRequest(req.params.id, account_id)
    res.status(HTTP_STATUS.OK).json({
      message: SHIFTS_MESSAGES.SHIFT_REQUEST_CANCELLED,
      result
    })
  } catch (error) {
    next(error)
  }
}

export const getMyShiftsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { account_id } = req.decoded_authorization as TokenPayload
    const { from_date, to_date, status } = req.query

    const result = await shiftsService.getShiftsByStaff(
      account_id,
      from_date as string,
      to_date as string,
      status as string
    )

    res.status(HTTP_STATUS.OK).json({
      message: SHIFTS_MESSAGES.SHIFTS_FETCHED,
      result: result.shifts,
      summary: result.summary
    })
  } catch (error) {
    next(error)
  }
}

export const getPendingShiftRequestsController = async (
  req: Request<ParamsDictionary, unknown, unknown, GetShiftsQuery>,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = { ...req.query, status: 'Pending' as const }
    const result = await shiftsService.getShifts(query)
    res.status(HTTP_STATUS.OK).json({
      message: SHIFTS_MESSAGES.PENDING_REQUESTS_FETCHED,
      result: result.shifts,
      pagination: result.pagination
    })
  } catch (error) {
    next(error)
  }
}
