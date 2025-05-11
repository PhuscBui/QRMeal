import { ParamsDictionary } from 'express-serve-static-core'
import { TokenType } from '~/constants/type'

export interface CreateTableReqBody {
  number: number
  capacity: number
  status: string
  location: string
}

export interface UpdateTableReqBody {
  capacity: number
  status: string
  changeToken?: boolean
  location: string
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
}