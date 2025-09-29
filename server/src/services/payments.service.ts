import { ObjectId } from 'mongodb'
import Payment from '~/models/schemas/Payment.schema'
import databaseService from '~/services/databases.service'
import { ErrorWithStatus } from '~/models/Error'
import HTTP_STATUS from '~/constants/httpStatus'
import socketService from '~/utils/socket'
import { ManagerRoom } from '~/constants/type'
import OrderGroup from '~/models/schemas/OrderGroup.schema'
import { envConfig } from '~/config'

interface SepayWebhookData {
  id: number
  gateway: string
  transactionDate: string
  accountNumber: string
  code: string | null
  content: string
  transferType: 'in' | 'out'
  transferAmount: number
  accumulated: number
  subAccount: string | null
  referenceCode: string
  description: string
}

class PaymentsService {
  async handleSepayWebhook(webhookData: SepayWebhookData) {
    const { id, transferAmount, content, referenceCode, transactionDate } = webhookData

    // Parse order_group_id từ content
    const orderGroupIds = this.extractOrderGroupIds(content)

    if (!orderGroupIds || orderGroupIds.length === 0) {
      throw new ErrorWithStatus({
        message: 'Cannot extract order_group_id from payment content',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const session = databaseService.clientInstance.startSession()

    try {
      session.startTransaction()

      const updatedOrderGroups = []

      for (const orderGroupId of orderGroupIds) {
        // Tìm order group
        const orderGroup = await databaseService.orderGroups.findOne({ _id: new ObjectId(orderGroupId) }, { session })

        if (!orderGroup) {
          console.warn(`Order group ${orderGroupId} not found`)
          continue
        }

        // Kiểm tra đã thanh toán chưa
        const existingPayment = await databaseService.payments.findOne(
          {
            order_group_id: new ObjectId(orderGroupId),
            status: 'success'
          },
          { session }
        )

        if (existingPayment) {
          console.warn(`Order group ${orderGroupId} already paid`)
          continue
        }

        // Cập nhật trạng thái order group
        await databaseService.orderGroups.updateOne(
          { _id: new ObjectId(orderGroupId) },
          {
            $set: {
              status: 'Paid',
              updated_at: new Date()
            }
          },
          { session }
        )

        // Cập nhật trạng thái orders
        await databaseService.orders.updateMany(
          { order_group_id: new ObjectId(orderGroupId) },
          {
            $set: {
              status: 'Paid',
              updated_at: new Date()
            }
          },
          { session }
        )

        // Cập nhật bàn nếu là dine-in
        if (orderGroup.table_number) {
          await databaseService.tables.updateOne(
            { number: orderGroup.table_number },
            {
              $set: { status: 'Available' },
              $currentDate: { updated_at: true }
            },
            { session }
          )
        }

        updatedOrderGroups.push(orderGroup)
      }

      // Tạo payment record
      await databaseService.payments.updateOne(
        { order_group_ids: { $all: orderGroupIds.map((id) => new ObjectId(id)) } },
        {
          $set: {
            order_group_ids: orderGroupIds.map((id) => new ObjectId(id)),
            amount: transferAmount,
            method: 'bank',
            status: 'success',
            transaction_id: `SEPAY_${id}`,
            reference_code: referenceCode,
            transaction_date: new Date(transactionDate),
            payment_link: `https://sepay.vn/qr?acc=${envConfig.sepayAccountNumber}&bank=${envConfig.sepayBankName}&amount=${transferAmount}&des=${encodeURIComponent(content)}`
          }
        },
        {
          session,
          upsert: true
        }
      )

      await session.commitTransaction()

      // Gửi thông báo qua socket
      if (updatedOrderGroups.length > 0) {
        socketService.emitToRoom(ManagerRoom, 'payment-received', {
          orderGroups: updatedOrderGroups,
          transaction: {
            id: id,
            amount: transferAmount,
            content: content
          }
        })

        // Gửi đến từng customer/guest nếu có socketId
        for (const orderGroup of updatedOrderGroups) {
          const socketId = await this.getCustomerSocketId(orderGroup)
          if (socketId) {
            socketService.getIO().to(socketId).emit('payment-success', orderGroup)
          }
        }
      }

      return {
        updatedOrderGroups
      }
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession()
    }
  }

  private extractOrderGroupIds(content: string): string[] {
    const matches = content.match(/ORDER[_-]?([a-f0-9]{24})/gi)
    if (!matches) return []

    return matches
      .map((match) => {
        const id = match.match(/([a-f0-9]{24})/i)
        return id ? id[1] : null
      })
      .filter(Boolean) as string[]
  }

  private async getCustomerSocketId(orderGroup: OrderGroup): Promise<string | null> {
    if (orderGroup.customer_id) {
      const customer = await databaseService.sockets.findOne({ _id: orderGroup.customer_id })
      return customer?.socketId || null
    }

    if (orderGroup.guest_id) {
      const guest = await databaseService.sockets.findOne({ _id: orderGroup.guest_id })
      return guest?.socketId || null
    }
    return null
  }

  async createPaymentLink(orderGroupIds: string[], totalAmount: number) {
    const content = orderGroupIds.map((id) => `ORDER_${id}`).join(',')
    const paymentLink = `https://sepay.vn/qr?acc=${envConfig.sepayAccountNumber}&bank=${envConfig.sepayBankName}&amount=${totalAmount}&des=${encodeURIComponent(content)}`

    await databaseService.payments.insertOne(
      new Payment({
        order_group_ids: orderGroupIds.map((id) => new ObjectId(id)),
        amount: totalAmount,
        method: 'bank',
        status: 'pending',
        payment_link: paymentLink
      })
    )

    return {
      payment_info: {
        bank_name: envConfig.sepayBankName,
        account_number: envConfig.sepayAccountNumber,
        account_name: envConfig.sepayAccountName,
        amount: totalAmount,
        content: content,
        qr_code_url: paymentLink
      }
    }
  }

  async getPaymentsByOrderGroupIds(orderGroupIds: string[]) {
    const objectIds = orderGroupIds.map((id) => new ObjectId(id))
    const payments = await databaseService.payments
      .find({ order_group_id: { $in: objectIds } })
      .sort({ created_at: -1 })
      .toArray()
    return payments
  }
}

const paymentsService = new PaymentsService()
export default paymentsService
