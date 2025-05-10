import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { GetDashboardQueryParams } from '~/models/requests/Dashboard.request'
import { GetDashboardResponse } from '~/models/response/Dashboard.response'
import dashboardService from '~/services/dashboard.service'

export const getIndicatorsController = async (
  req: Request<ParamsDictionary, GetDashboardResponse, unknown, GetDashboardQueryParams>,
  res: Response
) => {
  const result = await dashboardService.getIndicators(req.query)
  res.status(HTTP_STATUS.OK).json({
    message: 'Dashboard indicators fetched successfully',
    result
  })
} 