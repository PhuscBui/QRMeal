import { Router } from 'express'
import {
  guestCreateOrderController,
  guestGetOrdersController,
  loginGuestController,
  logoutGuestController,
  refreshTokenGuestController
} from '~/controllers/guests.controller'
import { accessTokenValidator, refreshTokenValidator } from '~/middlewares/auth.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const guestsRouter = Router()

/**
 * Description. Login guest
 * Path:  /auth/login
 * Method: POST
 * Request: Body : GuestLoginBody
 */
guestsRouter.post('/auth/login', wrapRequestHandler(loginGuestController))

/**
 * Description. Log out guest
 * Path:  /auth/logout
 * Method: POST
 * Request: Headers : Authorization
 */
guestsRouter.post(
  '/auth/logout',
  accessTokenValidator,
  refreshTokenValidator,
  wrapRequestHandler(logoutGuestController)
)

/**
 * Description. Refresh token
 * Path:  /auth/refresh-token
 * Method: POST
 * Request: Headers : Authorization
 * Response: Body : AuthResponse
 */
guestsRouter.post('/auth/refresh-token', refreshTokenValidator, wrapRequestHandler(refreshTokenGuestController))

/**
 * Description. Create order
 * Path:  /orders
 * Method: POST
 * Request: Body : GuestCreateOrdersBody
 */
guestsRouter.post('/orders', accessTokenValidator, wrapRequestHandler(guestCreateOrderController))

/**
 * Description. Get orders
 * Path:  /orders
 * Method: GET
 * Request: Headers : Authorization
 * Response: Body : GuestGetOrdersRes
 */
guestsRouter.get('/orders', accessTokenValidator, wrapRequestHandler(guestGetOrdersController))

export default guestsRouter
