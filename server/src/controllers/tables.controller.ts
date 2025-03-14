import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { TABLES_MESSAGES } from '~/constants/messages'
import { CreateTableReqBody, TableParams, UpdateTableReqBody } from '~/models/requests/Table.request'
import {
  CreateTableResponse,
  DeleteTableResponse,
  GetTablesResponse,
  UpdateTableResponse
} from '~/models/response/Table.response'
import tablesService from '~/services/tables.service'

export const createTableController = async (
  req: Request<ParamsDictionary, CreateTableResponse, CreateTableReqBody>,
  res: Response
) => {
  const payload = req.body
  const table = await tablesService.createTable(payload)
  res.status(HTTP_STATUS.CREATED).json({
    message: TABLES_MESSAGES.TABLE_CREATED,
    result: table
  })
}

export const getTablesController = async (req: Request<ParamsDictionary, GetTablesResponse>, res: Response) => {
  const tables = await tablesService.getTables()
  res.json({
    message: TABLES_MESSAGES.TABLES_FETCHED,
    result: tables
  })
}

export const getTableController = async (req: Request<TableParams, GetTablesResponse>, res: Response) => {
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

export const updateTableController = async (
  req: Request<TableParams, UpdateTableResponse, UpdateTableReqBody>,
  res: Response
) => {
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

export const deleteTableController = async (req: Request<TableParams, DeleteTableResponse>, res: Response) => {
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
