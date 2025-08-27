import { Router } from 'express'
import {
  createDishReviewController,
  deleteDishReviewController,
  getDishReviewByIdController,
  getDishReviewsByDishController,
  getDishReviewsByMeController,
  getDishReviewsStatsController,
  updateDishReviewController
} from '~/controllers/dish-reviews.controller'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import {
  createDishReviewValidator,
  dishReviewIdValidator,
  updateDishReviewValidator
} from '~/middlewares/dish-reviews.middleware'

import { wrapRequestHandler } from '~/utils/handlers'

const dishReviewsRouter = Router()

/**
 * Description. Get all dish reviews
 * Path:  /
 * Method: GET
 * Response: { reviews: DishReview[] }
 */
dishReviewsRouter.get('/dish/:dishId', wrapRequestHandler(getDishReviewsByDishController))

/**
 * Description. Get a dish review by ID
 * Path:  /:reviewId
 * Method: GET
 * Response: { review: DishReview }
 */
dishReviewsRouter.get('/:reviewId', dishReviewIdValidator, wrapRequestHandler(getDishReviewByIdController))

/**
 * Description. Create a new dish review
 * Path:  /
 * Method: POST
 * Response: { review: DishReview }
 */
dishReviewsRouter.post(
  '/',
  accessTokenValidator,
  createDishReviewValidator,
  wrapRequestHandler(createDishReviewController)
)

/**
 * Description. Update a dish review by ID
 * Path:  /:reviewId
 * Method: PUT
 * Response: { review: DishReview }
 */
dishReviewsRouter.put(
  '/:reviewId',
  accessTokenValidator,
  dishReviewIdValidator,
  updateDishReviewValidator,
  wrapRequestHandler(updateDishReviewController)
)

/**
 * Description. Delete a dish review by ID
 * Path:  /:reviewId
 * Method: DELETE
 * Response: { message: string }
 */
dishReviewsRouter.delete(
  '/:reviewId',
  accessTokenValidator,
  dishReviewIdValidator,
  wrapRequestHandler(deleteDishReviewController)
)

/**
 * Description. Get dish reviews stats
 * Path:  /:dishId/stats
 * Method: GET
 * Response: { stats: DishReviewStats }
 */
dishReviewsRouter.get('/:dishId/stats', wrapRequestHandler(getDishReviewsStatsController))

/**
 * Description. Get dish reviews by guest or customer
 * Path:  /:dishId/
 * Method: GET
 * Response: { reviews: DishReview[] }
 */
dishReviewsRouter.get('/reviews/me', accessTokenValidator, wrapRequestHandler(getDishReviewsByMeController))

export default dishReviewsRouter
