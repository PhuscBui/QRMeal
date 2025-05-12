import http from '@/lib/http'
import {
  CancelReservationBodyType,
  CreateTableBodyType,
  ReserveTableBodyType,
  TableListResType,
  TableResType,
  UpdateTableBodyType
} from '@/schemaValidations/table.schema'

const tableApiRequest = {
  list: () => http.get<TableListResType>('tables'),
  add: (body: CreateTableBodyType) => http.post<TableResType>('tables', body),
  getTable: (id: number) => http.get<TableResType>(`tables/${id}`),
  updateTable: (id: number, body: UpdateTableBodyType) =>
    http.put<TableResType>(`tables/${id}`, body),
  deleteTable: (id: number) => http.delete<TableResType>(`tables/${id}`),
  reserveTable: (body: ReserveTableBodyType) => http.post<TableResType>('tables/reserve', body),
  cancelReservation: (body: CancelReservationBodyType) => http.post<TableResType>('tables/cancel-reservation', body)
}

export default tableApiRequest
