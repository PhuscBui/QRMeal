import { ParamsDictionary } from 'express-serve-static-core'

export interface CreateShiftReqBody {
  staff_id: string
  shift_date: string
  start_time: string
  end_time: string
}

export interface UpdateShiftReqBody {
  staff_id?: string
  shift_date?: string
  start_time?: string
  end_time?: string
}

export interface GetShiftParam extends ParamsDictionary {
  id: string
}

export interface DeleteShiftParam extends ParamsDictionary {
  id: string
}

export interface GetShiftsQuery {
  staff_id?: string
  from_date?: string
  to_date?: string
  page?: string
  limit?: string
}
