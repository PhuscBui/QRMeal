import { Router } from 'express'
import {
  createRevenueController,
  getRevenueByCustomerIdController,
  getRevenueByGuestPhoneController,
  getRevenuesController
} from '~/controllers/revenues.controller'
import { isEmployeeValidator } from '~/middlewares/account.middlewares'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { dateQueryValidator } from '~/middlewares/common.middlewares'
import { createRevenueValidator } from '~/middlewares/revenues.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const revenuesRouter = Router()

revenuesRouter.get(
  '/',
  accessTokenValidator,
  dateQueryValidator,
  isEmployeeValidator,
  wrapRequestHandler(getRevenuesController)
)

revenuesRouter.get(
  '/:guestPhone',
  accessTokenValidator,
  isEmployeeValidator,
  wrapRequestHandler(getRevenueByGuestPhoneController)
)

revenuesRouter.get(
  '/customer/:customerId',
  accessTokenValidator,
  isEmployeeValidator,
  wrapRequestHandler(getRevenueByCustomerIdController)
)

revenuesRouter.post(
  '/',
  accessTokenValidator,
  createRevenueValidator,
  isEmployeeValidator,
  wrapRequestHandler(createRevenueController)
)

export default revenuesRouter
