import { TableStatus, TableStatusValues } from '@/constants/type'
import z from 'zod'

export const CreateTableBody = z.object({
  number: z.coerce.number().positive(),
  capacity: z.coerce.number().positive(),
  status: z.enum(TableStatusValues).optional(),
  location: z.string(),
  x: z.coerce.number().optional(),
  y: z.coerce.number().optional(),
  shape: z.enum(['circle', 'rect']).optional()
})

export type CreateTableBodyType = z.TypeOf<typeof CreateTableBody>

export const ReservationSchema = z.object({
  guest_id: z.string().nullable(),
  customer_id: z.string().nullable(),
  is_customer: z.boolean().optional(),
  reservation_time: z.date(),
  note: z.string().optional()
})

export const TableSchema = z.object({
  _id: z.string(),
  number: z.coerce.number(),
  capacity: z.coerce.number(),
  status: z.enum(TableStatusValues),
  token: z.string(),
  location: z.string(),
  reservation: ReservationSchema,
  current_customer_id: z.string().nullable().optional(),
  x: z.coerce.number().optional(),
  y: z.coerce.number().optional(),
  shape: z.enum(['circle', 'rect']).optional(),
  created_at: z.date(),
  updated_at: z.date()
})

export const TableRes = z.object({
  result: TableSchema,
  message: z.string()
})

export type TableResType = z.TypeOf<typeof TableRes>

export const TableListRes = z.object({
  result: z.array(TableSchema),
  message: z.string()
})

export type TableListResType = z.TypeOf<typeof TableListRes>

export const UpdateTableBody = z.object({
  changeToken: z.boolean(),
  capacity: z.coerce.number().positive(),
  status: z.enum(TableStatusValues).optional(),
  location: z.string(),
  x: z.coerce.number().optional(),
  y: z.coerce.number().optional(),
  shape: z.enum(['circle', 'rect']).optional()
})
export type UpdateTableBodyType = z.TypeOf<typeof UpdateTableBody>
export const TableParams = z.object({
  number: z.coerce.number()
})
export type TableParamsType = z.TypeOf<typeof TableParams>

export const ReserveTableBody = z.object({
  table_number: z.coerce.number(),
  token: z.string(),
  guest_id: z.string().optional(),
  customer_id: z.string().optional(),
  is_customer: z.boolean().optional(),
  reservation_time: z.date(),
  note: z.string().optional()
})

export type ReserveTableBodyType = z.TypeOf<typeof ReserveTableBody>

export const CancelReservationBody = z.object({
  table_number: z.coerce.number(),
  token: z.string()
})

export type CancelReservationBodyType = z.TypeOf<typeof CancelReservationBody>

export const UpdateTableStatusBody = z.object({
  status: z.enum([TableStatus.Available, TableStatus.Occupied, TableStatus.Hidden])
})

export type UpdateTableStatusBodyType = z.TypeOf<typeof UpdateTableStatusBody>
