import { Router } from 'express'
import {
  createCategoryController,
  deleteCategoryController,
  getCategoriesController,
  getCategoryController,
  updateCategoryController
} from '~/controllers/categories.controller'
import { isEmployeeValidator } from '~/middlewares/account.middlewares'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import {
  categoryIdValidation,
  createCategoryValidation,
  updateCategoryValidation
} from '~/middlewares/categories.middlewares'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { UpdateCategoryReqBody } from '~/models/requests/Category.request'
import { wrapRequestHandler } from '~/utils/handlers'

const categoriesRouter = Router()

/**
 * Description. Get all categories
 * Path:  /
 * Method: GET
 * Response: { categories: Category[] }
 */
categoriesRouter.get('/', wrapRequestHandler(getCategoriesController))

/**
 * Description. Get category detail
 * Path:  /:categoryId
 * Method: GET
 * Response: { category: Category }
 */
categoriesRouter.get('/:categoryId', categoryIdValidation, wrapRequestHandler(getCategoryController))

/**
 * Description. Create a new category
 * Path:  /
 * Method: POST
 * Request: category: Category
 * Response: { category: Category }
 */
categoriesRouter.post(
  '/',
  accessTokenValidator,
  isEmployeeValidator,
  createCategoryValidation,
  wrapRequestHandler(createCategoryController)
)

/**
 * Description. Update a categories
 * Path:  /:categoryId
 * Method: PUT
 * Request: category: Category
 * Response: { category: Category }
 */
categoriesRouter.put(
  '/:categoryId',
  accessTokenValidator,
  isEmployeeValidator,
  updateCategoryValidation,
  filterMiddleware<UpdateCategoryReqBody>(['name', 'description']),
  wrapRequestHandler(updateCategoryController)
)

/**
 * Description. Delete a category
 * Path:  /:categoryId
 * Method: DELETE
 * Response: { message: string }
 */

categoriesRouter.delete(
  '/:categoryId',
  accessTokenValidator,
  isEmployeeValidator,
  categoryIdValidation,
  wrapRequestHandler(deleteCategoryController)
)

export default categoriesRouter
