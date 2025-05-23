import { JwtPayload } from 'jsonwebtoken'
import { ParamsDictionary } from 'express-serve-static-core'

export interface CreateEmployeeReqBody {
  name: string
  email: string
  role: string
  owner_id: string
  password: string
  confirm_password: string
  date_of_birth: string
}

export interface GetEmployeeParam extends ParamsDictionary {
  id: string
}
export interface UpdateEmployeeParam extends ParamsDictionary {
  id: string
}

export interface DeleteEmployeeParam extends ParamsDictionary {
  id: string
}

export interface UpdateEmployeeReqBody {
  name: string
  email: string
  avatar?: string
  date_of_birth?: string
  password?: string
  confirm_password?: string
  change_password?: boolean
}

export interface TokenPayload extends JwtPayload {
  account_id: string
  role: string
  token_type: string
  exp: number
  iat: number
}

export interface UpdateMeReqBody {
  name?: string
  avatar?: string
  date_of_birth?: string
}

export interface ChangePasswordReqBody {
  old_password: string
  password: string
  confirm_password: string
}

export interface CreateGuestReqBody {
  name: string
  table_number: number
  phone: string
}

export interface GetGuestParam {
  fromDate?: string | undefined
  toDate?: string | undefined
}

export interface GetGuestByIdParam extends ParamsDictionary {
  id: string
}
