import { Router } from 'express'
import {
  createTableController,
  deleteTableController,
  getTableController,
  getTablesController,
  updateTableController
} from '~/controllers/tables.controller'
import { isAdminValidator } from '~/middlewares/account.middlewares'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { createTableValidator, updateTableValidator } from '~/middlewares/tables.middlewares'
import { UpdateTableReqBody } from '~/models/requests/Table.request'
import { wrapRequestHandler } from '~/utils/handlers'

const tablesRouter = Router()

/**
 * Description. Create table
 * Path:  /
 * Method: POST
 * Request: Body : Table
 */
tablesRouter.post(
  '/',
  accessTokenValidator,
  isAdminValidator,
  createTableValidator,
  wrapRequestHandler(createTableController)
)

/**
 * Description. Get all tables
 * Path:  /
 * Method: GET
 */
tablesRouter.get('/', wrapRequestHandler(getTablesController))

/**
 * Description. Get detail table by number
 * Path:  /:number
 * Method: GET
 * Request: Params : number
 */
tablesRouter.get('/:number', wrapRequestHandler(getTableController))

/**
 * Description. Update table by number
 * Path:  /:number
 * Method: PATCH
 * Request: Params : number
 * Request: Body : Table
 */
tablesRouter.put(
  '/:number',
  accessTokenValidator,
  isAdminValidator,
  updateTableValidator,
  filterMiddleware<UpdateTableReqBody>(['status', 'capacity', 'changeToken']),
  wrapRequestHandler(updateTableController)
)

/**
 * Description. Delete table by number
 * Path:  /:number
 * Method: DELETE
 * Request: Params : number
 */
tablesRouter.delete('/:number', accessTokenValidator, isAdminValidator, wrapRequestHandler(deleteTableController))

export default tablesRouter
