import { Query } from 'express-serve-static-core'

export interface GetReportsQueryParams extends Query {
  fromDate?: string
  toDate?: string
  period?: 'day' | 'week' | 'month'
}

