import { Router } from 'express'
import {
  checkInController,
  checkOutController,
  getAllAttendanceController,
  getMyAttendanceController,
  getTodayAttendanceController
} from '~/controllers/attendance.controller'
import { accessTokenValidator } from '~/middlewares/auth.middlewares'
import { isEmployeeValidator, isAdminValidator } from '~/middlewares/account.middlewares'
import { wrapRequestHandler } from '~/utils/handlers'

const attendanceRouter = Router()

/**
 * Description: Check in (Employee)
 * Path: /check-in
 * Method: POST
 * Body: { shift_id?: string }
 * Headers: Authorization
 */
attendanceRouter.post(
  '/check-in',
  accessTokenValidator,
  isEmployeeValidator,
  wrapRequestHandler(checkInController)
)

/**
 * Description: Check out (Employee)
 * Path: /check-out
 * Method: POST
 * Headers: Authorization
 */
attendanceRouter.post(
  '/check-out',
  accessTokenValidator,
  isEmployeeValidator,
  wrapRequestHandler(checkOutController)
)

/**
 * Description: Get today's attendance (Employee)
 * Path: /today
 * Method: GET
 * Headers: Authorization
 */
attendanceRouter.get(
  '/today',
  accessTokenValidator,
  isEmployeeValidator,
  wrapRequestHandler(getTodayAttendanceController)
)

/**
 * Description: Get my attendance history (Employee)
 * Path: /my-attendance
 * Method: GET
 * Query: fromDate?, toDate?, page?, limit?
 * Headers: Authorization
 */
attendanceRouter.get(
  '/my-attendance',
  accessTokenValidator,
  isEmployeeValidator,
  wrapRequestHandler(getMyAttendanceController)
)

/**
 * Description: Get all attendance records (Admin)
 * Path: /
 * Method: GET
 * Query: staff_id?, fromDate?, toDate?, page?, limit?
 * Headers: Authorization
 */
attendanceRouter.get(
  '/',
  accessTokenValidator,
  isAdminValidator,
  wrapRequestHandler(getAllAttendanceController)
)

export default attendanceRouter

