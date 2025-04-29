import { Router } from 'express'
import {
  createPromotionController,
  deletePromotionController,
  getPromotionDetailController,
  getPromotionsController,
  updatePromotionController
} from '~/controllers/promotions.controller'
import { isAdminValidator } from '~/middlewares/account.middlewares'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  createPromotionValidator,
  promotionIdValidator,
  updatePromotionValidator
} from '~/middlewares/promotion.middlewares'
import { UpdatePromotionReqBody } from '~/models/requests/Promotion.request'
import { wrapRequestHandler } from '~/utils/handlers'

const promotionsRoutes = Router()

promotionsRoutes.get('', getPromotionsController)

promotionsRoutes.get('/:promotionId', promotionIdValidator, getPromotionDetailController)

promotionsRoutes.post(
  '',
  accessTokenValidator,
  isAdminValidator,
  createPromotionValidator,
  wrapRequestHandler(createPromotionController)
)

promotionsRoutes.put(
  '/:promotionId',
  accessTokenValidator,
  isAdminValidator,
  updatePromotionValidator,
  promotionIdValidator,
  filterMiddleware<UpdatePromotionReqBody>([
    'name',
    'description',
    'discount_type',
    'discount_value',
    'min_spend',
    'min_visits',
    'min_loyalty_points',
    'start_date',
    'end_date',
    'is_active'
  ]),
  wrapRequestHandler(updatePromotionController)
)

promotionsRoutes.delete(
  '/:promotionId',
  accessTokenValidator,
  isAdminValidator,
  promotionIdValidator,
  wrapRequestHandler(deletePromotionController)
)

export default promotionsRoutes
