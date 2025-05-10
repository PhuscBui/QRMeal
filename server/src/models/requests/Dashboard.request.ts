import {  Query } from 'express-serve-static-core'


export interface GetDashboardQueryParams extends Query {
  fromDate?: string
  toDate?: string
}
