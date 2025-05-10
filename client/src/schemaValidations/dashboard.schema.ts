import { z } from 'zod'

export const GetDashboardQueryParams = z.object({
  fromDate: z.date(),
  toDate: z.date()
})

export type GetDashboardQueryParamsType = z.infer<typeof GetDashboardQueryParams>

const TimeStatsSchema = z.object({
  date: z.string(),
  orders: z.number(),
  revenue: z.number(),
  visitors: z.number()
})

export type TimeStatsType = z.infer<typeof TimeStatsSchema>

const QrCodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  created_at: z.string(),
})

export type QrCodeType = z.infer<typeof QrCodeSchema>

const MetaSchema = z.object({
  lastUpdated: z.string(),
  generatedBy: z.string()
}).optional()

export const GetDashboardRes = z.object({
  message: z.string(),
  result: z.object({
    totalRevenue: z.number(),
    totalOrders: z.number(),
    newCustomers: z.number(),
    activeAccounts: z.number(),
    timeStats: z.array(TimeStatsSchema),
    qrCodes: z.array(QrCodeSchema),
    meta: MetaSchema
  })
})

export type GetDashboardResType = z.infer<typeof GetDashboardRes>

