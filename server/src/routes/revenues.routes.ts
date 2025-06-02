import { Router } from 'express'
import {
  createRevenueController,
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

revenuesRouter.post(
  '/',
  accessTokenValidator,
  createRevenueValidator,
  isEmployeeValidator,
  wrapRequestHandler(createRevenueController)
)

export default revenuesRouter
