import { Router } from 'express'
import {
  createGuestPromotionController,
  deleteGuestPromotionController,
  getGuestPromotionByGuestIdController
} from '~/controllers/guest-promotion.controller'
import { createGuestPromotionValidator, guestIdValidator } from '~/middlewares/guest-promotion.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const guest_promotionRouter = Router()

guest_promotionRouter.get('/', (req, res) => {
  res.status(200).json({ message: 'Get all guest promotions' })
})

guest_promotionRouter.get('/:guestId', guestIdValidator, wrapRequestHandler(getGuestPromotionByGuestIdController))

guest_promotionRouter.post('/', createGuestPromotionValidator, wrapRequestHandler(createGuestPromotionController))

guest_promotionRouter.delete('/:guestPromotionId', deleteGuestPromotionController)

export default guest_promotionRouter
