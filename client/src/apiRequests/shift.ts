import http from '@/lib/http'
import {
  ShiftListResType,
  ShiftResType,
  MyShiftsResType,
  CreateShiftBodyType,
  CreateShiftRequestBodyType,
  UpdateShiftBodyType,
  UpdateShiftRequestBodyType,
  ReviewShiftRequestBodyType,
  GetShiftsQueryType
} from '@/schemaValidations/shift.schema'
import queryString from 'query-string'

const prefix = '/shifts'

const shiftApiRequest = {
  // Admin APIs
  list: (queryParams?: GetShiftsQueryType) =>
    http.get<ShiftListResType>(`${prefix}?` + queryString.stringify(queryParams ?? {})),

  create: (body: CreateShiftBodyType) => http.post<ShiftResType>(prefix, body),

  getById: (id: string) => http.get<ShiftResType>(`${prefix}/${id}`),

  update: (id: string, body: UpdateShiftBodyType) => http.put<ShiftResType>(`${prefix}/${id}`, body),

  delete: (id: string) => http.delete<ShiftResType>(`${prefix}/${id}`),

  getPendingRequests: (queryParams?: GetShiftsQueryType) =>
    http.get<ShiftListResType>(`${prefix}/pending?` + queryString.stringify(queryParams ?? {})),

  reviewRequest: (id: string, body: ReviewShiftRequestBodyType) =>
    http.put<ShiftResType>(`${prefix}/${id}/review`, body),

  // Employee APIs
  createRequest: (body: CreateShiftRequestBodyType) => http.post<ShiftResType>(`${prefix}/requests`, body),

  updateRequest: (id: string, body: UpdateShiftRequestBodyType) =>
    http.put<ShiftResType>(`${prefix}/requests/${id}`, body),

  cancelRequest: (id: string) => http.put<ShiftResType>(`${prefix}/requests/${id}/cancel`, {}),

  getMyShifts: (queryParams?: { from_date?: Date; to_date?: Date; status?: string }) =>
    http.get<MyShiftsResType>(
      `${prefix}/my-shifts?` +
        queryString.stringify({
          from_date: queryParams?.from_date?.toISOString(),
          to_date: queryParams?.to_date?.toISOString(),
          status: queryParams?.status
        })
    )
}

export default shiftApiRequest
