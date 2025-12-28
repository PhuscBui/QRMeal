import { Router } from 'express'
import { getDishStatisticsController, getRevenueStatisticsController } from '~/controllers/reports.controller'
import { isEmployeeValidator } from '~/middlewares/account.middlewares'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { dateQueryValidator } from '~/middlewares/common.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const reportsRouter = Router()

reportsRouter.get(
  '/revenue',
  accessTokenValidator,
  dateQueryValidator,
  isEmployeeValidator,
  wrapRequestHandler(getRevenueStatisticsController)
)

reportsRouter.get(
  '/dishes',
  accessTokenValidator,
  dateQueryValidator,
  isEmployeeValidator,
  wrapRequestHandler(getDishStatisticsController)
)

export default reportsRouter

