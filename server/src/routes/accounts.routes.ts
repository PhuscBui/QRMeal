import { Router } from 'express'
import { createEmployeeController } from '~/controllers/accounts.controller'
import { createEmployeeValidator } from '~/middlewares/account.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const accountsRouter = Router()

/**
 * Description. Create account
 * Path:  /
 * Method: POST
 * Request: Body : Account
 */
accountsRouter.post('/', createEmployeeValidator, wrapRequestHandler(createEmployeeController))

/**
 * Description. Get all accounts
 * Path:  /
 * Method: GET
 * Request: Query : page, limit
 */
// accountsRouter.get('/', wrapRequestHandler(getAccountsController))

export default accountsRouter
