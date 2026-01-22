import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import HTTP_STATUS from '~/constants/httpStatus'
import { CheckInReqBody, GetAttendanceQuery } from '~/models/requests/Attendance.request'
import { TokenPayload } from '~/models/requests/Account.request'
import attendanceService from '~/services/attendance.service'

export const checkInController = async (
  req: Request<ParamsDictionary, unknown, CheckInReqBody>,
  res: Response
) => {
  const { account_id } = req.decoded_authorization as TokenPayload
  const result = await attendanceService.checkIn(account_id, req.body.shift_id)
  res.status(HTTP_STATUS.OK).json({
    message: 'Chấm công vào thành công',
    result: result
  })
}

export const checkOutController = async (req: Request<ParamsDictionary>, res: Response) => {
  const { account_id } = req.decoded_authorization as TokenPayload
  const result = await attendanceService.checkOut(account_id)
  res.status(HTTP_STATUS.OK).json({
    message: 'Chấm công ra thành công',
    result: result
  })
}

export const getMyAttendanceController = async (
  req: Request<ParamsDictionary, unknown, unknown, GetAttendanceQuery>,
  res: Response
) => {
  const { account_id } = req.decoded_authorization as TokenPayload
  const result = await attendanceService.getMyAttendance(account_id, req.query)
  res.status(HTTP_STATUS.OK).json({
    message: 'Lấy lịch sử chấm công thành công',
    result: result
  })
}

export const getAllAttendanceController = async (
  req: Request<ParamsDictionary, unknown, unknown, GetAttendanceQuery>,
  res: Response
) => {
  const result = await attendanceService.getAllAttendance(req.query)
  res.status(HTTP_STATUS.OK).json({
    message: 'Lấy danh sách chấm công thành công',
    result: result
  })
}

export const getTodayAttendanceController = async (req: Request<ParamsDictionary>, res: Response) => {
  const { account_id } = req.decoded_authorization as TokenPayload
  const result = await attendanceService.getTodayAttendance(account_id)
  res.status(HTTP_STATUS.OK).json({
    message: 'Lấy thông tin chấm công hôm nay thành công',
    result: result
  })
}

