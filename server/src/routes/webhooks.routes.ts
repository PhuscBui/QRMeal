// routes/webhooks.routes.ts
import { Router } from 'express'
import { sepayWebhookController } from '~/controllers/sepay-webhook.controller'
import { wrapRequestHandler } from '~/utils/handlers'

const webhooksRouter = Router()

// SePay webhook endpoint
webhooksRouter.post('/sepay', wrapRequestHandler(sepayWebhookController))

export default webhooksRouter
