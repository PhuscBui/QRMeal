import { NextFunction, Request, Response } from 'express'
import { USERS_MESSAGES } from '~/constants/messages'
import accountsService from '~/services/accounts.service'

export const createAccountController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await accountsService.createAccount(req.body)
  res.status(201).json({
    message: USERS_MESSAGES.ACCOUNT_CREATED,
    result
  })
}
