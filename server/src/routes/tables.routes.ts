import { Router } from 'express'
import {
  cancelReservationController,
  createTableController,
  deleteTableController,
  getTableController,
  getTablesController,
  reserveTableController,
  updateStatusTableController,
  updateTableController
} from '~/controllers/tables.controller'
import { isAdminValidator, isEmployeeValidator } from '~/middlewares/account.middlewares'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  createTableValidator,
  reserveTableValidator,
  updateStatusTableValidator,
  updateTableValidator
} from '~/middlewares/tables.middlewares'
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
  isEmployeeValidator,
  updateTableValidator,
  filterMiddleware<UpdateTableReqBody>(['status', 'capacity', 'changeToken', 'location']),
  wrapRequestHandler(updateTableController)
)

/**
 * Description. Delete table by number
 * Path:  /:number
 * Method: DELETE
 * Request: Params : number
 */
tablesRouter.delete('/:number', accessTokenValidator, isEmployeeValidator, wrapRequestHandler(deleteTableController))

/**
 * Description. Reserve table
 * Path:  /reserve
 * Method: POST
 * Request: Body : Table
 */
tablesRouter.post('/reserve', accessTokenValidator, reserveTableValidator, wrapRequestHandler(reserveTableController))

/**
 * Description. Cancel reservation
 * Path:  /cancel-reservation
 * Method: POST
 * Request: Body : Table
 */
tablesRouter.post('/cancel-reservation', accessTokenValidator, wrapRequestHandler(cancelReservationController))

/**
 * Description. Update table status
 * Path:  /:number/status
 * Method: PATCH
 * Request: Params : number
 * Request: Body : status
 */
tablesRouter.put(
  '/:number/status',
  accessTokenValidator,
  updateStatusTableValidator,
  wrapRequestHandler(updateStatusTableController)
)

export default tablesRouter
