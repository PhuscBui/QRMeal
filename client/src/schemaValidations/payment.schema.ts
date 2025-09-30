import z from 'zod'

export const PaymentMethodValues = ['bank', 'cash'] as const
export const PaymentStatusValues = ['pending', 'success', 'failed', 'refunded'] as const

// Payment Schema
export const PaymentSchema = z.object({
  _id: z.string(),
  order_group_ids: z.array(z.string()),
  amount: z.number(),
  method: z.enum(PaymentMethodValues),
  status: z.enum(PaymentStatusValues),
  transaction_id: z.string().optional().nullable(),
  reference_code: z.string().optional().nullable(),
  payment_link: z.string(),
  transaction_date: z.string().datetime().optional().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

export type PaymentSchemaType = z.TypeOf<typeof PaymentSchema>

// Payment Info Schema
export const PaymentInfoSchema = z.object({
  bank_name: z.string(),
  account_number: z.string(),
  account_name: z.string(),
  amount: z.number(),
  content: z.string(),
  qr_code_url: z.string()
})

export type PaymentInfoSchemaType = z.TypeOf<typeof PaymentInfoSchema>

// Create Payment Link Body
export const CreatePaymentLinkBody = z.object({
  order_group_ids: z.array(z.string()).min(1, 'At least one order group is required'),
  total_amount: z.number().min(0, 'Amount must be greater than 0')
})

export type CreatePaymentLinkBodyType = z.TypeOf<typeof CreatePaymentLinkBody>

// Create Payment Link Response
export const CreatePaymentLinkRes = z.object({
  message: z.string(),
  result: z.object({
    payment_id: z.string(),
    payment_info: PaymentInfoSchema
  })
})

export type CreatePaymentLinkResType = z.TypeOf<typeof CreatePaymentLinkRes>

// Get Payments Response
export const GetPaymentsRes = z.object({
  message: z.string(),
  result: z.array(PaymentSchema)
})

export type GetPaymentsResType = z.TypeOf<typeof GetPaymentsRes>

// Get Payment Status Response
export const GetPaymentStatusRes = z.object({
  message: z.string(),
  result: PaymentSchema
})

export type GetPaymentStatusResType = z.TypeOf<typeof GetPaymentStatusRes>

// Payment Query Params
export const PaymentQueryParams = z.object({
  order_group_ids: z.string()
})

export type PaymentQueryParamsType = z.TypeOf<typeof PaymentQueryParams>

// Payment Param
export const PaymentParam = z.object({
  payment_id: z.string()
})

export type PaymentParamType = z.TypeOf<typeof PaymentParam>
