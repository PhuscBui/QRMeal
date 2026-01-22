import z from 'zod'

export const ChatSessionSchema = z.object({
  _id: z.string(),
  start_time: z.date(),
  end_time: z.date().nullable().optional(),
  guest_id: z.string().nullable().optional(),
  customer_id: z.string().nullable().optional(),
  anonymous_id: z.string().nullable().optional(),
  user_info: z
    .object({
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional()
    })
    .nullable()
    .optional()
})

export type ChatSessionType = z.TypeOf<typeof ChatSessionSchema>

export const ChatMessageSchema = z.object({
  _id: z.string(),
  session_id: z.string(),
  sender_type: z.enum(['user', 'staff', 'bot']),
  message: z.string(),
  created_at: z.date()
})

export type ChatMessageType = z.TypeOf<typeof ChatMessageSchema>

export const CreateSessionRes = z.object({
  message: z.string(),
  result: ChatSessionSchema
})

export type CreateSessionResType = z.TypeOf<typeof CreateSessionRes>

export const CreateAnonymousSessionBody = z.object({
  anonymousId: z.string()
})

export type CreateAnonymousSessionBodyType = z.TypeOf<typeof CreateAnonymousSessionBody>

export const GetSessionRes = z.object({
  message: z.string(),
  result: ChatSessionSchema
})

export type GetSessionResType = z.TypeOf<typeof GetSessionRes>

export const ListSessionsRes = z.object({
  message: z.string(),
  result: z.object({
    data: z.array(ChatSessionSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number()
  })
})

export type ListSessionsResType = z.TypeOf<typeof ListSessionsRes>

export const ListMessagesRes = z.object({
  message: z.string(),
  result: z.array(ChatMessageSchema)
})

export type ListMessagesResType = z.TypeOf<typeof ListMessagesRes>

export const SendMessageBody = z.object({
  message: z.string().trim().min(1),
  sender: z.enum(['user', 'staff', 'bot']).optional()
})

export type SendMessageBodyType = z.TypeOf<typeof SendMessageBody>

export const SendMessageRes = z.object({
  message: z.string(),
  result: ChatMessageSchema,
  botMessage: ChatMessageSchema.optional()
})

export type SendMessageResType = z.TypeOf<typeof SendMessageRes>

export const EndSessionRes = z.object({
  message: z.string()
})

export type EndSessionResType = z.TypeOf<typeof EndSessionRes>

export const ListSessionsQueryParams = z.object({
  limit: z.coerce.number().optional().default(20),
  page: z.coerce.number().optional().default(1)
})

export type ListSessionsQueryParamsType = z.TypeOf<typeof ListSessionsQueryParams>

export const ListMessagesQueryParams = z.object({
  limit: z.coerce.number().optional().default(50),
  before: z.string().optional()
})

export type ListMessagesQueryParamsType = z.TypeOf<typeof ListMessagesQueryParams>
