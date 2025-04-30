import { Router } from 'express'
import {
  deleteGuestLoyaltyController,
  getAllGuestLoyaltyController,
  getGuestLoyaltyByPhoneController,
  updateGuestLoyaltyController
} from '~/controllers/guest-loyalty.controller'
import { guestPhoneValidator, updateGuestLoyaltyValidator } from '~/middlewares/guest_loyalty.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const guest_loyaltyRouter = Router()

guest_loyaltyRouter.get('/', wrapRequestHandler(getAllGuestLoyaltyController))

guest_loyaltyRouter.get('/:guestPhone', guestPhoneValidator, wrapRequestHandler(getGuestLoyaltyByPhoneController))

guest_loyaltyRouter.put(
  '/:guestPhone',
  updateGuestLoyaltyValidator,
  guestPhoneValidator,
  wrapRequestHandler(updateGuestLoyaltyController)
)

guest_loyaltyRouter.delete('/:guestPhone', guestPhoneValidator, wrapRequestHandler(deleteGuestLoyaltyController))

export default guest_loyaltyRouter
