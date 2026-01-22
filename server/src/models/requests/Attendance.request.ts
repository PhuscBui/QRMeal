import { Query } from 'express-serve-static-core'

export interface CheckInReqBody {
  shift_id?: string
}

export interface GetAttendanceQuery extends Query {
  staff_id?: string
  fromDate?: string
  toDate?: string
  page?: string
  limit?: string
}

