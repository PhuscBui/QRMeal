import { NextFunction, Request, Response } from 'express'
import { envConfig } from '~/config'
import HTTP_STATUS from '~/constants/httpStatus'
import { TABLES_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { Role, TableStatus } from '~/constants/type'
import {
  ChangePasswordReqBody,
  CreateEmployeeReqBody,
  CreateGuestReqBody,
  DeleteEmployeeParam,
  GetEmployeeParam,
  GetGuestParam,
  TokenPayload,
  UpdateEmployeeParam,
  UpdateEmployeeReqBody,
  UpdateMeReqBody
} from '~/models/requests/Account.request'
import accountsService from '~/services/accounts.service'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  ChangePasswordResponse,
  CreateEmployeeResponse,
  CreateGuestResponse,
  DeleteEmployeeResponse,
  GetEmployeeResponse,
  GetEmployeesResponse,
  GetGuestResponse,
  UpdateEmployeeResponse,
  UpdateMeResponse
} from '~/models/response/Account.response'
import databaseService from '~/services/databases.service'

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
  req: Request<UpdateEmployeeParam, UpdateEmployeeResponse, UpdateEmployeeReqBody>,
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

export const createGuestController = async (
  req: Request<ParamsDictionary, CreateGuestResponse, CreateGuestReqBody>,
  res: Response
) => {
  const tableNumber = req.body.table_number
  const table = await databaseService.tables.findOne({ number: tableNumber })
  if (!table) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: TABLES_MESSAGES.TABLE_NOT_FOUND
    })
    return
  }

  if (table.status === TableStatus.Hidden) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: TABLES_MESSAGES.TABLE_IS_HIDDEN_PLEASE_CHOOSE_ANOTHER_TABLE
    })
    return
  }

  if (table.status === TableStatus.Reserved) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      message: TABLES_MESSAGES.TABLE_IS_RESERVED_PLEASE_CHOOSE_ANOTHER_TABLE
    })
    return
  }

  const result = await accountsService.createGuest(req.body)
  res.status(HTTP_STATUS.CREATED).json({
    message: USERS_MESSAGES.ACCOUNT_CREATED,
    result
  })
}

export const getGuestsController = async (req: Request<GetGuestParam, GetGuestResponse>, res: Response) => {
  const guests = await accountsService.getGuests(
    req.query.fromDate as string | undefined,
    req.query.toDate as string | undefined
  )
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.ACCOUNTS_FETCHED,
    result: guests
  })
}
