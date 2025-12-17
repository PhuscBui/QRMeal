import { OrderObjectByGuestID, ServingGuestByTableNumber, Statics } from '@/app/manage/orders/order-table'
import { OrderStatus } from '@/constants/type'
import { GetOrdersResType } from '@/schemaValidations/order.schema'
import { useMemo } from 'react'

export const useOrderService = (orderList: GetOrdersResType['result']) => {
  const result = useMemo(() => {
    const statics: Statics = {
      status: {
        Pending: 0,
        Processing: 0,
        Delivered: 0,
        Paid: 0,
        Cancelled: 0
      },
      table: {}
    }
    const orderObjectByGuestId: OrderObjectByGuestID = {}
    const guestByTableNumber: ServingGuestByTableNumber = {}

    orderList.forEach((order) => {
      statics.status[order.status] = statics.status[order.status] + 1

      // FIX: Use both customer_id and guest_id
      const guestId = order.customer_id || order.guest_id

      // Nếu table và guest/customer chưa bị xóa
      if (order.table_number !== null && guestId !== null) {
        if (!statics.table[order.table_number]) {
          statics.table[order.table_number] = {}
        }
        statics.table[order.table_number][guestId] = {
          ...statics.table[order.table_number]?.[guestId],
          [order.status]: (statics.table[order.table_number]?.[guestId]?.[order.status] ?? 0) + 1
        }
      }

      // FIX: Tính toán cho orderObjectByGuestId với cả customer và guest
      if (guestId) {
        if (!orderObjectByGuestId[guestId]) {
          orderObjectByGuestId[guestId] = []
        }
        orderObjectByGuestId[guestId].push(order)
      }

      // FIX: Tính toán cho guestByTableNumber với cả customer và guest
      if (order.table_number && guestId) {
        if (!guestByTableNumber[order.table_number]) {
          guestByTableNumber[order.table_number] = {}
        }
        guestByTableNumber[order.table_number][guestId] = orderObjectByGuestId[guestId]
      }
    })

    // Cần phải lọc lại 1 lần nữa mới chuẩn
    // Những guest/customer nào mà không còn phục vụ nữa sẽ bị loại bỏ
    const servingGuestByTableNumber: ServingGuestByTableNumber = {}
    for (const tableNumber in guestByTableNumber) {
      const guestObject = guestByTableNumber[tableNumber]
      const servingGuestObject: OrderObjectByGuestID = {}
      for (const guestId in guestObject) {
        const guestOrders = guestObject[guestId]
        const isServingGuest = guestOrders.some((order) =>
          [OrderStatus.Pending, OrderStatus.Processing, OrderStatus.Delivered].includes(
            order.status as 'Pending' | 'Processing' | 'Delivered'
          )
        )
        if (isServingGuest) {
          // FIX: Use guestId as string key (since it's already a string from the loop)
          servingGuestObject[guestId] = guestOrders
        }
      }
      if (Object.keys(servingGuestObject).length) {
        servingGuestByTableNumber[Number(tableNumber)] = servingGuestObject
      }
    }

    return {
      statics,
      orderObjectByGuestId,
      servingGuestByTableNumber
    }
  }, [orderList])
  return result
}
