import { Table } from '~/models/schemas/Table.schema'
import { ApiResponse } from '~/type'

export type CreateTableResponse = ApiResponse<Table>
export type GetTablesResponse = ApiResponse<Table[]>
export type GetTableResponse = ApiResponse<Table>
export type UpdateTableResponse = ApiResponse<Table>
export type DeleteTableResponse = ApiResponse
export type ReserveTableResponse = ApiResponse<Table>
export type CancelReservationResponse = ApiResponse<Table>