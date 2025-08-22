import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { TABLES_MESSAGES } from '~/constants/messages'
import { TokenPayload } from '~/models/requests/Account.request'
import {
  CancelReservationReqBody,
  CreateTableReqBody,
  ReserveTableReqBody,
  TableParams,
  UpdateStatusTableReqBody,
  UpdateTableReqBody
} from '~/models/requests/Table.request'

import tablesService from '~/services/tables.service'

export const createTableController = async (
  req: Request<ParamsDictionary, unknown, CreateTableReqBody>,
  res: Response
) => {
  const payload = req.body
  const table = await tablesService.createTable(payload)
  res.status(HTTP_STATUS.CREATED).json({
    message: TABLES_MESSAGES.TABLE_CREATED,
    result: table
  })
}

export const getTablesController = async (req: Request<ParamsDictionary>, res: Response) => {
  const tables = await tablesService.getTables()
  res.json({
    message: TABLES_MESSAGES.TABLES_FETCHED,
    result: tables
  })
}

export const getTableController = async (req: Request<TableParams>, res: Response) => {
  const table = await tablesService.getTable(Number(req.params.number))
  if (!table) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: TABLES_MESSAGES.TABLE_NOT_FOUND
    })
    return
  }
  res.json({
    message: TABLES_MESSAGES.TABLE_FETCHED,
    result: table
  })
}

export const updateTableController = async (req: Request<TableParams, unknown, UpdateTableReqBody>, res: Response) => {
  const table = await tablesService.updateTable(Number(req.params.number), req.body)
  if (!table) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: TABLES_MESSAGES.TABLE_NOT_FOUND
    })
    return
  }
  res.json({
    message: TABLES_MESSAGES.TABLE_UPDATED,
    result: table
  })
}

export const deleteTableController = async (req: Request<TableParams>, res: Response) => {
  const result = await tablesService.deleteTable(Number(req.params.number))
  if (!result) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: TABLES_MESSAGES.TABLE_NOT_FOUND
    })
    return
  }
  res.json({
    message: TABLES_MESSAGES.TABLE_DELETED
  })
}

export const reserveTableController = async (
  req: Request<ParamsDictionary, unknown, ReserveTableReqBody>,
  res: Response
) => {
  const table = await tablesService.reserveTable(req.body)
  res.json({
    message: TABLES_MESSAGES.TABLE_RESERVED,
    result: table
  })
}

export const cancelReservationController = async (
  req: Request<ParamsDictionary, unknown, CancelReservationReqBody>,
  res: Response
) => {
  const { account_id, role } = req.decoded_authorization as TokenPayload
  const table = await tablesService.cancelReservation(req.body, account_id, role)
  res.json({
    message: TABLES_MESSAGES.TABLE_RESERVED,
    result: table
  })
}

export const updateStatusTableController = async (
  req: Request<TableParams, unknown, UpdateStatusTableReqBody>,
  res: Response
) => {
  const { account_id, role } = req.decoded_authorization as TokenPayload
  const table = await tablesService.updateStatusTable(account_id, role, Number(req.params.number), req.body)
  if (!table) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      message: TABLES_MESSAGES.TABLE_NOT_FOUND
    })
    return
  }
  res.json({
    message: TABLES_MESSAGES.TABLE_UPDATED,
    result: table
  })
}
