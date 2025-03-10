import { LoginReqBody, LogoutReqBody, RefreshTokenReqBody } from '~/models/requests/Auth.request'
import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import Account from '~/models/schemas/Account.schema'
import { ObjectId } from 'mongodb'
import authService from '~/services/auth.service'
import { USERS_MESSAGES } from '~/constants/messages'
import { TokenPayload } from '~/models/requests/Account.request'
import { AuthResponse, LogoutResponse } from '~/models/response/Auth.response'

export const loginController = async (req: Request<ParamsDictionary, AuthResponse, LoginReqBody>, res: Response) => {
  const user = req.user as Account
  const user_id = user._id as ObjectId
  const result = await authService.login(user_id.toString())
  res.json({
    message: USERS_MESSAGES.USER_LOGIN_SUCCESS,
    result
  })
}

export const logoutController = async (
  req: Request<ParamsDictionary, LogoutResponse, LogoutReqBody>,
  res: Response
) => {
  const { refresh_token } = req.body
  const result = await authService.logout(refresh_token)
  res.json(result)
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, AuthResponse, RefreshTokenReqBody>,
  res: Response
) => {
  const { refresh_token } = req.body
  const { account_id, exp } = req.decoded_refresh_token as TokenPayload
  const result = await authService.refreshToken({ account_id, refresh_token, exp })
  res.json({
    message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
    result
  })
}
