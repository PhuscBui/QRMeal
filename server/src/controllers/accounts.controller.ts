import { NextFunction, Request, Response } from 'express'
import { envConfig } from '~/config'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { Role } from '~/constants/type'
import { CreateEmployeeReqBody } from '~/models/requests/Account.request'
import accountsService from '~/services/accounts.service'
import { ParamsDictionary } from 'express-serve-static-core'

export const initOwnerAccount = async () => {
  if ((await accountsService.getAccountCount()) === 0) {
    await accountsService.createAccount({
      name: 'Owner',
      email: envConfig.initialEmailOwner,
      password: envConfig.initialPasswordOwner,
      confirm_password: envConfig.initialPasswordOwner,
      date_of_birth: envConfig.initialDateOfBirthOwner,
      role: Role.Owner,
      owner_id: ''
    })
    console.log(`Owner account created successfully!`)
  }
}

export const createEmployeeController = async (
  req: Request<ParamsDictionary, any, CreateEmployeeReqBody>,
  res: Response,
  next: NextFunction
) => {
  const ownerId = await accountsService.getOwnerId()

  if (!ownerId) {
    return next(new Error(USERS_MESSAGES.OWNER_NOT_FOUND))
  }

  const result = await accountsService.createAccount({
    ...req.body,
    role: Role.Employee,
    owner_id: ownerId
  })
  res.status(HTTP_STATUS.CREATED).json({
    message: USERS_MESSAGES.ACCOUNT_CREATED,
    result
  })
}
