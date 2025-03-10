import { Router } from 'express'
import { loginController, logoutController, refreshTokenController } from '~/controllers/auth.controller'
import { accessTokenValidator, loginValidator, refreshTokenValidator } from '~/middlewares/auth.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const authRouter = Router()

/**
 * Description. Login route
 * Path:  /auth/login
 * Method: POST
 * Request: { email: string, password: string }
 */
authRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

/**
 * Description. Logout route
 * Path:  /auth/logout
 * Method: POST
 * Request: { refresh_token: string }
 */
authRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

/**
 * Description. Refresh token route
 * Path:  /auth/refresh-token
 * Method: POST
 * Request: { refresh_token: string }
 * Response: { access_token: string, refresh_token: string }
 */
authRouter.post('/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenController))

export default authRouter
