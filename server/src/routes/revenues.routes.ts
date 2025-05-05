import { Router } from 'express'
import {
  createRevenueController,
  getRevenueByGuestPhoneController,
  getRevenuesController
} from '~/controllers/revenues.controller'
import { dateQueryValidator } from '~/middlewares/common.middlewares'
import { createRevenueValidator } from '~/middlewares/revenues.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const revenuesRouter = Router()

revenuesRouter.get('/', dateQueryValidator, wrapRequestHandler(getRevenuesController))

revenuesRouter.get('/:guestPhone', wrapRequestHandler(getRevenueByGuestPhoneController))

revenuesRouter.post('/', createRevenueValidator, wrapRequestHandler(createRevenueController))

export default revenuesRouter
