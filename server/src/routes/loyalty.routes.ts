import { Router } from 'express'
import {
  deleteLoyaltyController,
  getAllLoyaltyController,
  getLoyaltyByCustomerIdController,
  updateLoyaltyController
} from '~/controllers/loyalties.controller'
import { customerIdValidator, updateLoyaltyValidator } from '~/middlewares/loyalties.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const loyaltiesRouter = Router()

loyaltiesRouter.get('/', wrapRequestHandler(getAllLoyaltyController))

loyaltiesRouter.get('/:customerId', customerIdValidator, wrapRequestHandler(getLoyaltyByCustomerIdController))

loyaltiesRouter.put(
  '/:customerId',
  updateLoyaltyValidator,
  customerIdValidator,
  wrapRequestHandler(updateLoyaltyController)
)

loyaltiesRouter.delete('/:customerId', customerIdValidator, wrapRequestHandler(deleteLoyaltyController))

export default loyaltiesRouter
