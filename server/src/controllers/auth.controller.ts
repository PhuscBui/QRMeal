import { LoginReqBody, LogoutReqBody } from '~/models/requests/Auth.request'
import { ParamsDictionary } from 'express-serve-static-core'
import { Request, Response } from 'express'
import Account from '~/models/schemas/Account.schema'
import { ObjectId } from 'mongodb'
import authService from '~/services/auth.service'
import { USERS_MESSAGES } from '~/constants/messages'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user = req.user as Account
  const user_id = user._id as ObjectId
  const result = await authService.login(user_id.toString())
  res.json({
    message: USERS_MESSAGES.USER_LOGIN_SUCCESS,
    result
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  const result = await authService.logout(refresh_token)
  res.json(result)
}
