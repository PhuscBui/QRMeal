import { NextFunction, Request, Response } from 'express'
import { envConfig } from '~/config'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { Role } from '~/constants/type'
import {
  ChangePasswordReqBody,
  CreateEmployeeReqBody,
  DeleteEmployeeParam,
  GetEmployeeParam,
  TokenPayload,
  UpdateEmployeeParam,
  UpdateMeReqBody
} from '~/models/requests/Account.request'
import accountsService from '~/services/accounts.service'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  ChangePasswordResponse,
  CreateEmployeeResponse,
  DeleteEmployeeResponse,
  GetEmployeeResponse,
  GetEmployeesResponse,
  UpdateEmployeeResponse,
  UpdateMeResponse
} from '~/models/response/Account.response'

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
  req: Request<ParamsDictionary, CreateEmployeeResponse, CreateEmployeeReqBody>,
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

export const getAccountsController = async (req: Request<ParamsDictionary, GetEmployeesResponse>, res: Response) => {
  const accounts = await accountsService.getAccounts()
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.ACCOUNTS_FETCHED,
    result: accounts
  })
}

export const getEmployeeAccountController = async (
  req: Request<GetEmployeeParam, GetEmployeeResponse>,
  res: Response
) => {
  const account = await accountsService.getAccountById(req.params.id)

  if (!account) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
    return
  }
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.GET_EMPLOYEE_SUCCESS,
    result: account
  })
}

export const updateEmployeeController = async (
  req: Request<UpdateEmployeeParam, UpdateEmployeeResponse, CreateEmployeeReqBody>,
  res: Response
) => {
  const account = await accountsService.getAccountById(req.params.id)

  if (!account) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
    return
  }

  const result = await accountsService.updateAccount(req.params.id, req.body)
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.GET_EMPLOYEE_SUCCESS,
    result
  })
}

export const deleteEmployeeController = async (
  req: Request<DeleteEmployeeParam, DeleteEmployeeResponse>,
  res: Response
) => {
  const account = await accountsService.getAccountById(req.params.id)

  if (!account) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
    return
  }

  await accountsService.deleteAccount(req.params.id)

  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.DELETE_EMPLOYEE_SUCCESS
  })
}

export const getMeController = async (req: Request, res: Response) => {
  const { account_id } = req.decoded_authorization as TokenPayload
  const account = await accountsService.getAccountById(account_id)
  if (!account) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
    return
  }
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.GET_ME_SUCCESS,
    result: account
  })
}

export const updateMeController = async (
  req: Request<ParamsDictionary, UpdateMeResponse, UpdateMeReqBody>,
  res: Response
) => {
  const { account_id } = req.decoded_authorization as TokenPayload
  const body = req.body
  console.log('body', body)
  const result = await accountsService.updateMe(account_id, body)
  res.json({
    message: USERS_MESSAGES.UPDATE_ME_SUCCESS,
    result: result
  })
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, ChangePasswordResponse, ChangePasswordReqBody>,
  res: Response
) => {
  const { account_id } = req.decoded_authorization as TokenPayload
  const password = req.body.password
  const result = await accountsService.changePassword(account_id, password)
  res.json(result)
}
