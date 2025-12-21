import { ParamsDictionary } from 'express-serve-static-core'
import { TokenType } from '~/constants/type'

export interface CreateTableReqBody {
  number: number
  capacity: number
  status: string
  location: string
  x?: number
  y?: number
  shape?: 'circle' | 'rect'
}

export interface UpdateTableReqBody {
  capacity: number
  status: string
  changeToken?: boolean
  location: string
  x?: number
  y?: number
  shape?: 'circle' | 'rect'
}

export interface UpdateStatusTableReqBody {
  status: 'Available' | 'Occupied' | 'Hidden'
}

export interface TableParams extends ParamsDictionary {
  number: string
}

export interface TableTokenPayload {
  iat: number
  number: number
  tokenType: (typeof TokenType)['TableToken']
}

export interface ReserveTableReqBody {
  table_number: number
  token: string
  reservation_time: Date
  note: string
  guest_id?: string
  customer_id?: string
  is_customer?: boolean
}

export interface CancelReservationReqBody {
  table_number: number
  token: string
}
