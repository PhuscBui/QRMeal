import { Router } from 'express'
import {
  createEmployeeController,
  deleteEmployeeController,
  getAccountsController,
  getEmployeeAccountController,
  updateEmployeeController
} from '~/controllers/accounts.controller'
import { createEmployeeValidator, isAdminValidator, updateEmployeeValidator } from '~/middlewares/account.middlewares'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const accountsRouter = Router()

/**
 * Description. Create account
 * Path:  /
 * Method: POST
 * Request: Body : Account
 */
accountsRouter.post('/', createEmployeeValidator, isAdminValidator, wrapRequestHandler(createEmployeeController))

/**
 * Description. Get all accounts
 * Path:  /
 * Method: GET
 * Request: Query : page, limit
 */
accountsRouter.get('/', accessTokenValidator, isAdminValidator, wrapRequestHandler(getAccountsController))

/**
 * Description. Get detail account by id
 * Path:  detail/:id
 * Method: GET
 * Request: Params : id
 */
accountsRouter.get(
  '/detail/:id',
  accessTokenValidator,
  isAdminValidator,
  wrapRequestHandler(getEmployeeAccountController)
)

/**
 * Description. Update account by id
 * Path:  detail/:id
 * Method: PUT
 * Request: Params : id
 * Request: Body : Account
 */
accountsRouter.put(
  '/detail/:id',
  accessTokenValidator,
  isAdminValidator,
  updateEmployeeValidator,
  wrapRequestHandler(updateEmployeeController)
)

/**
 * Description. Delete account by id
 * Path:  detail/:id
 * Method: DELETE
 * Request: Params : id
 */
accountsRouter.delete(
  '/detail/:id',
  accessTokenValidator,
  isAdminValidator,
  wrapRequestHandler(deleteEmployeeController)
)

export default accountsRouter
