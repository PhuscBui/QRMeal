import { z } from 'zod'

export const GetRevenuesQueryParams = z.object({
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional()
})

export type GetRevenuesQueryParamsType = z.TypeOf<typeof GetRevenuesQueryParams>

export const RevenueSchema = z.object({
  _id: z.string(),
  guest_id: z.string().nullable(),
  guest_phone: z.string().nullable(),
  customer_id: z.string().nullable(),
  total_amount: z.number(),
  create_at: z.date()
})

export const RevenueRes = z.object({
  message: z.string(),
  result: RevenueSchema
})

export type RevenueResType = z.TypeOf<typeof RevenueRes>

export const RevenueListRes = z.object({
  message: z.string(),
  result: z.array(RevenueSchema)
})

export type RevenueListResType = z.TypeOf<typeof RevenueListRes>

export const CreateRevenueBody = z
  .object({
    guest_id: z.string().nullable().optional(),
    customer_id: z.string().nullable().optional(),
    guest_phone: z.string().nullable().optional(),
    total_amount: z.coerce.number()
  })
  .strict()

export type CreateRevenueBodyType = z.TypeOf<typeof CreateRevenueBody>
