// controllers/webhooks.controller.ts
import { Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { envConfig } from '~/config'
import paymentsService from '~/services/payments.service'

export const sepayWebhookController = async (req: Request, res: Response) => {
  try {
    // SePay sử dụng Authorization header với API Key
    const authHeader = req.headers['authorization'] as string
    const apiKey = authHeader?.replace('Apikey ', '')

    // Verify API Key
    if (apiKey !== envConfig.sepayApiKey) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        message: 'Invalid API Key'
      })
      return
    }

    const webhookData = req.body

    console.log('Received SePay webhook:', webhookData)

    // Chỉ xử lý giao dịch tiền vào
    if (webhookData.transferType !== 'in') {
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: 'Not a incoming transaction'
      })
      return
    }

    // Xử lý webhook data từ SePay
    await paymentsService.handleSepayWebhook(webhookData)

    // Phản hồi thành công cho SePay
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Webhook received'
    })
  } catch (error) {
    console.error('SePay webhook error:', error)
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Webhook processing failed'
    })
  }
}
