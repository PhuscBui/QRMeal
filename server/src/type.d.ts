import { TokenPayload } from '~/models/requests/Account.request'
import Account from '~/models/schemas/Account.schema'

declare module 'express' {
  interface Request {
    user?: Account
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
  }
}

interface ApiResponse<T = unknown> {
  message: string
  result?: T
}

interface Pagination {
  limit: string
  page: string
}
