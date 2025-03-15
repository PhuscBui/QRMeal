import { ParamsDictionary } from 'express-serve-static-core'
import { TokenType } from '~/constants/type'

export interface CreateTableReqBody {
  number: number
  capacity: number
  status: string
}

export interface UpdateTableReqBody {
  capacity: number
  status: string
  changeToken?: boolean
}

export interface TableParams extends ParamsDictionary {
  number: string
}

export interface TableTokenPayload {
  iat: number
  number: number
  tokenType: (typeof TokenType)['TableToken']
}
