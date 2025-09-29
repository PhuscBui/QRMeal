import { ShiftRequestStatus, ShiftRequestStatusValues } from '@/constants/type'
import z from 'zod'

export const ShiftSchema = z.object({
  _id: z.string(),
  staff_id: z.string(),
  shift_date: z.date(),
  start_time: z.string(),
  end_time: z.string(),
  total_hours: z.number().optional(),
  status: z.enum(ShiftRequestStatusValues),
  reason: z.string().optional(),
  review_note: z.string().optional(),
  reviewed_at: z.date().optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
  staff_info: z
    .object({
      name: z.string(),
      email: z.string(),
      phone: z.string()
    })
    .optional(),
  reviewer_info: z
    .object({
      name: z.string()
    })
    .optional()
})

export type ShiftType = z.TypeOf<typeof ShiftSchema>

export const MyShiftSummarySchema = z.object({
  total_shifts: z.number(),
  approved_shifts: z.number(),
  pending_shifts: z.number(),
  rejected_shifts: z.number(),
  cancelled_shifts: z.number(),
  total_hours: z.number()
})

export type MyShiftSummaryType = z.TypeOf<typeof MyShiftSummarySchema>

export const ShiftListRes = z.object({
  result: z.array(ShiftSchema),
  message: z.string(),
  pagination: z
    .object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      totalPages: z.number()
    })
    .optional()
})

export type ShiftListResType = z.TypeOf<typeof ShiftListRes>

export const MyShiftsRes = z.object({
  result: z.array(ShiftSchema),
  message: z.string(),
  summary: MyShiftSummarySchema.optional()
})

export type MyShiftsResType = z.TypeOf<typeof MyShiftsRes>

export const ShiftRes = z.object({
  result: ShiftSchema,
  message: z.string()
})

export type ShiftResType = z.TypeOf<typeof ShiftRes>

export const CreateShiftBody = z
  .object({
    staff_id: z.string().min(1, 'Staff is required'),
    shift_date: z.date(),
    start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
  })
  .superRefine(({ start_time, end_time }, ctx) => {
    if (end_time <= start_time) {
      ctx.addIssue({
        code: 'custom',
        message: 'End time must be after start time',
        path: ['end_time']
      })
    }
  })

export type CreateShiftBodyType = z.TypeOf<typeof CreateShiftBody>

export const CreateShiftRequestBody = z
  .object({
    shift_date: z.date(),
    start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    reason: z.string().max(500, 'Reason must be less than 500 characters').optional()
  })
  .superRefine(({ start_time, end_time }, ctx) => {
    if (end_time <= start_time) {
      ctx.addIssue({
        code: 'custom',
        message: 'End time must be after start time',
        path: ['end_time']
      })
    }
  })

export type CreateShiftRequestBodyType = z.TypeOf<typeof CreateShiftRequestBody>

export const UpdateShiftBody = z
  .object({
    staff_id: z.string().min(1, 'Staff is required').optional(),
    shift_date: z.date().optional(),
    start_time: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
      .optional(),
    end_time: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
      .optional()
  })
  .superRefine(({ start_time, end_time }, ctx) => {
    if (start_time && end_time && end_time <= start_time) {
      ctx.addIssue({
        code: 'custom',
        message: 'End time must be after start time',
        path: ['end_time']
      })
    }
  })

export type UpdateShiftBodyType = z.TypeOf<typeof UpdateShiftBody>

export const UpdateShiftRequestBody = z
  .object({
    shift_date: z.date().optional(),
    start_time: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
      .optional(),
    end_time: z
      .string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
      .optional(),
    reason: z.string().max(500, 'Reason must be less than 500 characters').optional()
  })
  .superRefine(({ start_time, end_time }, ctx) => {
    if (start_time && end_time && end_time <= start_time) {
      ctx.addIssue({
        code: 'custom',
        message: 'End time must be after start time',
        path: ['end_time']
      })
    }
  })

export type UpdateShiftRequestBodyType = z.TypeOf<typeof UpdateShiftRequestBody>

export const ReviewShiftRequestBody = z.object({
  status: z.enum([ShiftRequestStatus.Approved, ShiftRequestStatus.Rejected]),
  review_note: z.string().max(500, 'Review note must be less than 500 characters').optional()
})

export type ReviewShiftRequestBodyType = z.TypeOf<typeof ReviewShiftRequestBody>

export const GetShiftsQuery = z.object({
  staff_id: z.string().optional(),
  from_date: z.coerce.date().optional(),
  to_date: z.coerce.date().optional(),
  status: z.enum(ShiftRequestStatusValues).optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional()
})

export type GetShiftsQueryType = z.TypeOf<typeof GetShiftsQuery>

export const ShiftIdParam = z.object({
  id: z.string()
})

export type ShiftIdParamType = z.TypeOf<typeof ShiftIdParam>
