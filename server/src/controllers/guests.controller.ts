import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { ORDERS_MESSAGE, TABLES_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { ManagerRoom, Role, TableStatus } from '~/constants/type'
import { TokenPayload } from '~/models/requests/Account.request'
import { GuestCreateOrdersReqBody, GuestLoginReqBody, GuestLogoutReqBody } from '~/models/requests/Guest.request'
import { GuestCreateOrdersResponse, GuestLoginResponse, GuestLogoutResponse } from '~/models/response/Guest.response'
import Guest from '~/models/schemas/Guest.schema'
import databaseService from '~/services/databases.service'
import guestsService from '~/services/guests.service'
import socketService from '~/utils/socket'

export const loginGuestController = async (
  req: Request<ParamsDictionary, GuestLoginResponse, GuestLoginReqBody>,
  res: Response
) => {
  const { token, table_number, name, phone } = req.body
  const table = await databaseService.tables.findOne({ token: token, number: table_number })
  if (table === null) {
    res.status(HTTP_STATUS.NOT_FOUND).json({ message: TABLES_MESSAGES.TABLE_NOT_FOUND })
    return
  }

  if (table.status === TableStatus.Hidden) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ message: TABLES_MESSAGES.TABLE_IS_HIDDEN_PLEASE_CHOOSE_ANOTHER_TABLE })
    return
  }

  if (table.status === TableStatus.Reserved) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({ message: TABLES_MESSAGES.TABLE_IS_RESERVED_PLEASE_CHOOSE_ANOTHER_TABLE })
    return
  }

  const guest = await databaseService.guests.insertOne(
    new Guest({
      name: name,
      phone: phone,
      table_number: table_number,
      role: Role.Guest
    })
  )

  const result = await guestsService.login(guest.insertedId.toString(), Role.Guest)
  if (result.guest === null) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: USERS_MESSAGES.USER_LOGIN_FAILED })
    return
  }

  res.json({
    message: USERS_MESSAGES.USER_LOGIN_SUCCESS,
    result: result
  })
}

export const logoutGuestController = async (
  req: Request<ParamsDictionary, GuestLogoutResponse, GuestLogoutReqBody>,
  res: Response
) => {
  const { refresh_token } = req.body
  const result = await guestsService.logout(refresh_token)
  res.json(result)
}

export const refreshTokenGuestController = async (req: Request, res: Response) => {
  const { refresh_token } = req.body
  const { account_id, role, exp } = req.decoded_refresh_token as TokenPayload
  const result = await guestsService.refreshToken({ account_id, refresh_token, role, exp })
  res.json({
    message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
    result
  })
}

export const guestCreateOrderController = async (
  req: Request<ParamsDictionary, GuestCreateOrdersResponse, GuestCreateOrdersReqBody>,
  res: Response
) => {
  const { account_id } = req.decoded_authorization as TokenPayload
  const result = await guestsService.createOrder({ account_id, orders: req.body })
  socketService.emitToRoom(ManagerRoom, 'new-order', result)
  res.json({
    message: ORDERS_MESSAGE.ORDER_CREATE_SUCCESS,
    result
  })
}

export const guestGetOrdersController = async (req: Request, res: Response) => {
  const { account_id } = req.decoded_authorization as TokenPayload
  const result = await guestsService.getOrders(account_id)
  res.json({
    message: ORDERS_MESSAGE.ORDER_GET_SUCCESS,
    result
  })
}
