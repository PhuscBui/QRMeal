import { Router } from 'express'
import {
  changePasswordController,
  createEmployeeController,
  deleteEmployeeController,
  getAccountsController,
  getEmployeeAccountController,
  getMeController,
  updateEmployeeController,
  updateMeController
} from '~/controllers/accounts.controller'
import {
  changePasswordValidator,
  createEmployeeValidator,
  isAdminValidator,
  updateEmployeeValidator,
  updateMeValidator
} from '~/middlewares/account.middlewares'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { UpdateMeReqBody } from '~/models/requests/Account.request'
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

/**
 * Description. Get me
 * Path:  /me
 * Method: GET
 * Request: Headers : Authorization
 */
accountsRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController))

/**
 * Description. Update me
 * Path:  /me
 * Method: PATCH
 * Request: Headers : Authorization
 * Request: Body : Account
 */
accountsRouter.patch(
  '/me',
  accessTokenValidator,
  updateMeValidator,
  filterMiddleware<UpdateMeReqBody>(['name', 'avatar', 'date_of_birth']),
  wrapRequestHandler(updateMeController)
)

/**
 * Description. Change password
 * Path:  /me/change-password
 * Method: PATCH
 * Request: Headers : Authorization
 * Request: Body : Account
 */
accountsRouter.patch(
  '/me/change-password',
  accessTokenValidator,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
)

export default accountsRouter
