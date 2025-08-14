import { Router } from 'express'
import {
  createDishController,
  deleteDishController,
  getDishController,
  getDishesController,
  updateDishController
} from '~/controllers/dishes.controller'
import { isEmployeeValidator } from '~/middlewares/account.middlewares'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { createDishValidator, dishIdValidator, updateDishValidator } from '~/middlewares/dishes.middlewares'
import { UpdateDishReqBody } from '~/models/requests/Dishes.request'

import { wrapRequestHandler } from '~/utils/handlers'

const dishesRouter = Router()

/**
 * Description. Get all dishes
 * Path:  /
 * Method: GET
 * Response: { dishes: Dish[] }
 */
dishesRouter.get('/', wrapRequestHandler(getDishesController))

/**
 * Description. Get dish detail
 * Path:  /:dishId
 * Method: GET
 * Response: { dish: Dish }
 */
dishesRouter.get('/:dishId', dishIdValidator, wrapRequestHandler(getDishController))

/**
 * Description. Create a new dish
 * Path:  /
 * Method: POST
 * Request: dish: Dish
 * Response: { dish: Dish }
 */
dishesRouter.post(
  '/',
  accessTokenValidator,
  isEmployeeValidator,
  createDishValidator,
  wrapRequestHandler(createDishController)
)

/**
 * Description. Update a dish
 * Path:  /:dishId
 * Method: PUT
 * Request: dish: Dish
 * Response: { dish: Dish }
 */
dishesRouter.put(
  '/:dishId',
  accessTokenValidator,
  isEmployeeValidator,
  updateDishValidator,
  dishIdValidator,
  filterMiddleware<UpdateDishReqBody>(['name', 'price', 'image', 'description', 'category_ids', 'status']),
  wrapRequestHandler(updateDishController)
)

/**
 * Description. Delete a dish
 * Path:  /:dishId
 * Method: DELETE
 * Response: { message: string }
 */
dishesRouter.delete(
  '/:dishId',
  accessTokenValidator,
  isEmployeeValidator,
  dishIdValidator,
  wrapRequestHandler(deleteDishController)
)

export default dishesRouter
