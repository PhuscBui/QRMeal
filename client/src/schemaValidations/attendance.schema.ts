import z from 'zod'

export const AttendanceSchema = z.object({
  _id: z.string(),
  staff_id: z.string(),
  shift_id: z.string().optional(),
  check_in: z.string().optional(),
  check_out: z.string().optional(),
  status: z.enum(['present', 'absent', 'late', 'on_time']),
  notes: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  staff: z
    .object({
      _id: z.string(),
      name: z.string(),
      email: z.string().optional()
    })
    .optional(),
  shift: z
    .object({
      _id: z.string(),
      shift_date: z.string(),
      start_time: z.string(),
      end_time: z.string()
    })
    .optional()
})

export type AttendanceType = z.TypeOf<typeof AttendanceSchema>

export const AttendanceResSchema = z.object({
  message: z.string(),
  result: AttendanceSchema
})

export type AttendanceResType = z.TypeOf<typeof AttendanceResSchema>

export const AttendanceListResSchema = z.object({
  message: z.string(),
  result: z.object({
    attendances: z.array(AttendanceSchema),
    total: z.number()
  })
})

export type AttendanceListResType = z.TypeOf<typeof AttendanceListResSchema>

export const CheckInBodySchema = z.object({
  shift_id: z.string().optional()
})

export type CheckInBodyType = z.TypeOf<typeof CheckInBodySchema>

export const GetAttendanceQuerySchema = z.object({
  staff_id: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional()
})

export type GetAttendanceQueryType = z.TypeOf<typeof GetAttendanceQuerySchema>

