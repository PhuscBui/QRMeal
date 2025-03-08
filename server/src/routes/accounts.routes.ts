import { Router } from 'express'
import { createAccountController } from '~/controllers/accounts.controller'
import { createAccountValidator } from '~/middlewares/account.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const accountsRouter = Router()

/**
 * Description. Create account
 * Path:  /
 * Method: POST
 * Request: Body : Account
 */
accountsRouter.post('/', createAccountValidator, wrapRequestHandler(createAccountController))

export default accountsRouter
