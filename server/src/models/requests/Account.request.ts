import { JwtPayload } from 'jsonwebtoken'

export interface CreateEmployeeReqBody {
  name: string
  email: string
  role: string
  owner_id: string
  password: string
  confirm_password: string
  date_of_birth: string
}

export interface TokenPayload extends JwtPayload {
  account_id: string
  token_type: string
  exp: number
  iat: number
}
