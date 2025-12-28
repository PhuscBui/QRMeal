import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { GetReportsQueryParams } from '~/models/requests/Reports.request'
import reportsService from '~/services/reports.service'

export const getRevenueStatisticsController = async (
  req: Request<ParamsDictionary, unknown, unknown, GetReportsQueryParams>,
  res: Response
) => {
  const result = await reportsService.getRevenueStatistics(req.query)
  res.status(HTTP_STATUS.OK).json({
    message: 'Revenue statistics fetched successfully',
    result: result
  })
}

export const getDishStatisticsController = async (
  req: Request<ParamsDictionary, unknown, unknown, GetReportsQueryParams>,
  res: Response
) => {
  const result = await reportsService.getDishStatistics(req.query)
  res.status(HTTP_STATUS.OK).json({
    message: 'Dish statistics fetched successfully',
    result: result
  })
}

