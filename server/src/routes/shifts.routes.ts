import { Router } from 'express'
import {
  createShiftController,
  createShiftRequestController,
  getShiftsController,
  getShiftByIdController,
  updateShiftController,
  updateShiftRequestController,
  reviewShiftRequestController,
  deleteShiftController,
  cancelShiftRequestController,
  getMyShiftsController,
  getPendingShiftRequestsController
} from '~/controllers/shifts.controller'
import {
  createShiftValidator,
  createShiftRequestValidator,
  updateShiftValidator,
  updateShiftRequestValidator,
  shiftParamValidator,
  reviewShiftRequestValidator,
  getShiftsQueryValidator
} from '~/middlewares/shift.middlewares'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { isAdminValidator, isEmployeeValidator } from '~/middlewares/account.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const shiftsRouter = Router()

// ================== ADMIN ROUTES ==================
/**
 * Description: Create new shift (Admin only)
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
 * Description: Get all shifts with filters (Admin only)
 * Path: /
 * Method: GET
 * Query: staff_id?, from_date?, to_date?, status?, page?, limit?
 * Headers: Authorization
 */
shiftsRouter.get(
  '/',
  accessTokenValidator,
  isAdminValidator,
  getShiftsQueryValidator,
  wrapRequestHandler(getShiftsController)
)

/**
 * Description: Update shift (Admin only)
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
 * Description: Delete shift (Admin only)
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
 * Description: Get pending shift requests for review (Admin only)
 * Path: /pending
 * Method: GET
 * Query: staff_id?, from_date?, to_date?, page?, limit?
 * Headers: Authorization
 */
shiftsRouter.get(
  '/pending',
  accessTokenValidator,
  isAdminValidator,
  getShiftsQueryValidator,
  wrapRequestHandler(getPendingShiftRequestsController)
)

/**
 * Description: Review shift request (Admin only)
 * Path: /:id/review
 * Method: PUT
 * Params: id
 * Body: { status, review_note? }
 * Headers: Authorization
 */
shiftsRouter.put(
  '/:id/review',
  accessTokenValidator,
  isAdminValidator,
  shiftParamValidator,
  reviewShiftRequestValidator,
  wrapRequestHandler(reviewShiftRequestController)
)

// ================== EMPLOYEE ROUTES ==================
/**
 * Description: Create shift request (Employee only)
 * Path: /requests
 * Method: POST
 * Body: { shift_date, start_time, end_time, reason? }
 * Headers: Authorization
 */
shiftsRouter.post(
  '/requests',
  accessTokenValidator,
  isEmployeeValidator,
  createShiftRequestValidator,
  wrapRequestHandler(createShiftRequestController)
)

/**
 * Description: Update shift request (Employee only - own requests)
 * Path: /requests/:id
 * Method: PUT
 * Params: id
 * Body: { shift_date?, start_time?, end_time?, reason? }
 * Headers: Authorization
 */
shiftsRouter.put(
  '/requests/:id',
  accessTokenValidator,
  isEmployeeValidator,
  shiftParamValidator,
  updateShiftRequestValidator,
  wrapRequestHandler(updateShiftRequestController)
)

/**
 * Description: Cancel shift request (Employee only - own requests)
 * Path: /requests/:id/cancel
 * Method: PUT
 * Params: id
 * Headers: Authorization
 */
shiftsRouter.put(
  '/requests/:id/cancel',
  accessTokenValidator,
  isEmployeeValidator,
  shiftParamValidator,
  wrapRequestHandler(cancelShiftRequestController)
)

/**
 * Description: Get my shifts (Employee only)
 * Path: /my-shifts
 * Method: GET
 * Query: from_date?, to_date?, status?
 * Headers: Authorization
 */
shiftsRouter.get('/my-shifts', accessTokenValidator, isEmployeeValidator, wrapRequestHandler(getMyShiftsController))

// ================== SHARED ROUTES ==================
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

export default shiftsRouter
