import { Router } from 'express'
import {
  createShiftController,
  getShiftsController,
  getShiftByIdController,
  updateShiftController,
  deleteShiftController,
  getMyShiftsController
} from '~/controllers/shifts.controller'
import { createShiftValidator, updateShiftValidator, shiftParamValidator } from '~/middlewares/shift.middlewares'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { isAdminValidator, isEmployeeValidator } from '~/middlewares/account.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const shiftsRouter = Router()

/**
 * Description: Create new shift
 * Path: /
 * Method: POST
 * Body: { staff_id, shift_date, start_time, end_time }
 * Headers: Authorization
 */
shiftsRouter.post(
  '/',
  accessTokenValidator,
  isAdminValidator,
  createShiftValidator,
  wrapRequestHandler(createShiftController)
)

/**
 * Description: Get all shifts with filters
 * Path: /
 * Method: GET
 * Query: staff_id?, from_date?, to_date?, page?, limit?
 * Headers: Authorization
 */
shiftsRouter.get('/', accessTokenValidator, isAdminValidator, wrapRequestHandler(getShiftsController))

/**
 * Description: Get shift by ID
 * Path: /:id
 * Method: GET
 * Params: id
 * Headers: Authorization
 */
shiftsRouter.get(
  '/:id',
  accessTokenValidator,
  isEmployeeValidator,
  shiftParamValidator,
  wrapRequestHandler(getShiftByIdController)
)

/**
 * Description: Update shift
 * Path: /:id
 * Method: PUT
 * Params: id
 * Body: { staff_id?, shift_date?, start_time?, end_time? }
 * Headers: Authorization
 */
shiftsRouter.put(
  '/:id',
  accessTokenValidator,
  isAdminValidator,
  shiftParamValidator,
  updateShiftValidator,
  wrapRequestHandler(updateShiftController)
)

/**
 * Description: Delete shift
 * Path: /:id
 * Method: DELETE
 * Params: id
 * Headers: Authorization
 */
shiftsRouter.delete(
  '/:id',
  accessTokenValidator,
  isAdminValidator,
  shiftParamValidator,
  wrapRequestHandler(deleteShiftController)
)

/**
 * Description: Get my shifts (for employees)
 * Path: /my-shifts
 * Method: GET
 * Query: from_date?, to_date?
 * Headers: Authorization
 */
shiftsRouter.get('/my-shifts', accessTokenValidator, isEmployeeValidator, wrapRequestHandler(getMyShiftsController))

export default shiftsRouter
