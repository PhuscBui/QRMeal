import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { DISHES_MESSAGE, ORDERS_MESSAGE, TABLES_MESSAGES } from '~/constants/messages'
import { DishStatus, OrderStatus, TableStatus } from '~/constants/type'
import { ErrorWithStatus } from '~/models/Error'
import { CreateOrdersReqBody, GetOrdersQueryParams, UpdateOrderReqBody } from '~/models/requests/Order.request'
import databaseService from '~/services/databases.service'

class OrdersService {
  async createOrders(orderHandlerId: string, body: CreateOrdersReqBody) {
    const { guest_id, orders } = body
    // Find guest
    const guest = await databaseService.guests.findOne({ _id: new ObjectId(guest_id) })
    if (!guest) {
      throw new Error('Guest not found')
    }

    if (guest.table_number === null) {
      throw new ErrorWithStatus({
        message: TABLES_MESSAGES.TABLE_NOT_ASSIGNED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Check if table is available
    const table = await databaseService.tables.findOne({ table_number: guest.table_number })
    if (!table) {
      throw new ErrorWithStatus({
        message: TABLES_MESSAGES.TABLE_NOT_FOUND,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    if (table.status === TableStatus.Hidden) {
      throw new ErrorWithStatus({
        message: TABLES_MESSAGES.TABLE_IS_HIDDEN_PLEASE_CHOOSE_ANOTHER_TABLE,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const session = await databaseService.clientInstance.startSession()

    try {
      session.startTransaction()

      const ordersRecord = []

      for (const order of orders) {
        // Find dish
        const dish = await databaseService.dishes.findOne({ _id: new ObjectId(order.dish_id) }, { session })
        if (!dish) {
          throw new ErrorWithStatus({
            message: DISHES_MESSAGE.DISH_NOT_FOUND,
            status: HTTP_STATUS.BAD_REQUEST
          })
        }

        if (dish.status === DishStatus.Unavailable) {
          throw new ErrorWithStatus({
            message: DISHES_MESSAGE.DISH_IS_UNAVAILABLE_PLEASE_CHOOSE_ANOTHER_DISH,
            status: HTTP_STATUS.BAD_REQUEST
          })
        }

        if (dish.status === DishStatus.Hidden) {
          throw new ErrorWithStatus({
            message: DISHES_MESSAGE.DISH_IS_HIDDEN_PLEASE_CHOOSE_ANOTHER_DISH,
            status: HTTP_STATUS.BAD_REQUEST
          })
        }

        // Create dish snapshot
        const dishSnapshot = await databaseService.dishSnapshots.insertOne(
          {
            description: dish.description,
            image: dish.image,
            name: dish.name,
            price: dish.price,
            dish_id: dish._id,
            status: dish.status,
            created_at: new Date()
          },
          { session }
        )

        // Create order
        const orderRecord = await databaseService.orders.insertOne(
          {
            dish_snapshot_id: dishSnapshot.insertedId,
            guest_id: new ObjectId(guest_id),
            quantity: order.quantity,
            table_number: guest.table_number,
            order_handler_id: new ObjectId(orderHandlerId),
            status: OrderStatus.Pending,
            created_at: new Date(),
            updated_at: new Date()
          },
          { session }
        )

        // Fetch the complete order with related data
        const completeOrder = await databaseService.orders
          .aggregate([
            { $match: { _id: orderRecord.insertedId } },
            {
              $lookup: {
                from: 'dish_snapshots',
                localField: 'dish_snapshot_id',
                foreignField: '_id',
                as: 'dish_snapshot'
              }
            },
            { $unwind: '$dish_snapshot' },
            {
              $lookup: {
                from: 'accounts',
                localField: 'order_handler_id',
                foreignField: '_id',
                as: 'order_handler'
              }
            },
            { $unwind: '$order_handler' },
            {
              $lookup: {
                from: 'guests',
                localField: 'guest_id',
                foreignField: '_id',
                as: 'guest'
              }
            },
            { $unwind: '$guest' }
          ])
          .toArray()

        ordersRecord.push(completeOrder[0])
      }

      await session.commitTransaction()

      // Find socket record for notification
      const socketRecord = await databaseService.sockets.findOne({ guestId: new ObjectId(guest_id) })

      return {
        orders: ordersRecord,
        socketId: socketRecord?.socketId
      }
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession()
    }
  }

  async getOrders(query: GetOrdersQueryParams) {
    const { fromDate, toDate } = query
    const matchCondition: { created_at?: { $gte?: Date; $lte?: Date } } = {}
    if (fromDate || toDate) {
      matchCondition.created_at = {}
      if (fromDate) {
        matchCondition.created_at.$gte = new Date(fromDate)
      }
      if (toDate) {
        matchCondition.created_at.$lte = new Date(toDate)
      }
    }
    const orders = await databaseService.orders
      .aggregate([
        { $match: matchCondition },
        {
          $lookup: {
            from: 'dish_snapshots',
            localField: 'dish_snapshot_id',
            foreignField: '_id',
            as: 'dish_snapshot'
          }
        },
        { $unwind: '$dish_snapshot' },
        {
          $lookup: {
            from: 'accounts',
            localField: 'order_handler_id',
            foreignField: '_id',
            as: 'order_handler'
          }
        },
        { $unwind: '$order_handler' },
        {
          $lookup: {
            from: 'guests',
            localField: 'guest_id',
            foreignField: '_id',
            as: 'guest'
          }
        },
        { $unwind: '$guest' },
        { $sort: { createdAt: -1 } }
      ])
      .toArray()

    return orders
  }

  async payOrders(guestId: string, orderHandlerId: string) {
    // Find orders that need to be paid
    const orders = await databaseService.orders
      .find({
        guestId: new ObjectId(guestId),
        status: { $in: [OrderStatus.Pending, OrderStatus.Processing, OrderStatus.Delivered] }
      })
      .toArray()

    if (orders.length === 0) {
      throw new ErrorWithStatus({
        message: ORDERS_MESSAGE.NO_ORDERS_TO_PAY,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Update orders
    await databaseService.orders.updateMany(
      {
        _id: { $in: orders.map((order) => order._id) }
      },
      {
        $set: {
          status: OrderStatus.Paid,
          order_handler_id: new ObjectId(orderHandlerId),
          updated_at: new Date()
        }
      }
    )

    // Get updated orders with complete information
    const ordersResult = await databaseService.orders
      .aggregate([
        { $match: { _id: { $in: orders.map((order) => order._id) } } },
        {
          $lookup: {
            from: 'dish_snapshots',
            localField: 'dish_snapshot_id',
            foreignField: '_id',
            as: 'dish_snapshot'
          }
        },
        { $unwind: '$dish_snapshot' },
        {
          $lookup: {
            from: 'accounts',
            localField: 'order_handler_id',
            foreignField: '_id',
            as: 'order_handler'
          }
        },
        { $unwind: '$order_handler' },
        {
          $lookup: {
            from: 'guests',
            localField: 'guest_id',
            foreignField: '_id',
            as: 'guest'
          }
        },
        { $unwind: '$guest' },
        { $sort: { createdAt: -1 } }
      ])
      .toArray()

    const socketRecord = await databaseService.sockets.findOne({ guest_id: new ObjectId(guestId) })

    return {
      orders: ordersResult,
      socketId: socketRecord?.socketId
    }
  }

  async getOrderDetail(order_Id: string) {
    const order = await databaseService.orders
      .aggregate([
        { $match: { _id: new ObjectId(order_Id) } },
        {
          $lookup: {
            from: 'dish_snapshots',
            localField: 'dish_snapshot_id',
            foreignField: '_id',
            as: 'dish_snapshot'
          }
        },
        { $unwind: '$dish_snapshot' },
        {
          $lookup: {
            from: 'accounts',
            localField: 'order_handler_id',
            foreignField: '_id',
            as: 'order_handler'
          }
        },
        { $unwind: '$order_handler' },
        {
          $lookup: {
            from: 'guests',
            localField: 'guest_id',
            foreignField: '_id',
            as: 'guest'
          }
        },
        { $unwind: '$guest' },
        {
          $lookup: {
            from: 'tables',
            localField: 'table_number',
            foreignField: 'number',
            as: 'table'
          }
        },
        { $unwind: '$table' }
      ])
      .toArray()

    if (!order || order.length === 0) {
      throw new ErrorWithStatus({
        message: ORDERS_MESSAGE.ORDER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return order[0]
  }

  async updateOrder(orderId: string, body: UpdateOrderReqBody & { order_handler_id: string }) {
    const { status, dish_id, quantity, order_handler_id } = body

    // Find the order first
    const order = await databaseService.orders.findOne({ _id: new ObjectId(orderId) })
    if (!order) {
      throw new ErrorWithStatus({
        message: ORDERS_MESSAGE.ORDER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Get dish snapshot
    const existingDishSnapshot = await databaseService.dishSnapshots.findOne({
      _id: order.dish_snapshot_id ? new ObjectId(order.dish_snapshot_id) : undefined
    })

    let dish_snapshot_id = order.dish_snapshot_id

    // Create new dish snapshot if dish changed
    if (existingDishSnapshot?.dish_id && existingDishSnapshot.dish_id.toString() !== dish_id.toString()) {
      const dish = await databaseService.dishes.findOne({ _id: new ObjectId(dish_id) })
      if (!dish) {
        throw new ErrorWithStatus({
          message: DISHES_MESSAGE.DISH_NOT_FOUND,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }

      const newDishSnapshot = await databaseService.dishSnapshots.insertOne({
        description: dish.description,
        image: dish.image,
        name: dish.name,
        price: dish.price,
        dish_id: dish._id,
        status: dish.status,
        created_at: new Date()
      })

      dish_snapshot_id = newDishSnapshot.insertedId
    }

    // Update the order
    await databaseService.orders.updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          status,
          dish_snapshot_id,
          quantity,
          order_handler_id: new ObjectId(order_handler_id),
          updated_at: new Date()
        }
      }
    )

    // Get updated order with related information
    const updatedOrder = await databaseService.orders
      .aggregate([
        { $match: { _id: new ObjectId(orderId) } },
        {
          $lookup: {
            from: 'dish_snapshots',
            localField: 'dish_snapshot_id',
            foreignField: '_id',
            as: 'dish_snapshot'
          }
        },
        { $unwind: '$dish_snapshot' },
        {
          $lookup: {
            from: 'accounts',
            localField: 'order_handler_id',
            foreignField: '_id',
            as: 'order_handler'
          }
        },
        { $unwind: '$order_handler' },
        {
          $lookup: {
            from: 'guests',
            localField: 'guest_id',
            foreignField: '_id',
            as: 'guest'
          }
        },
        { $unwind: '$guest' }
      ])
      .toArray()

    // Find socket record for notification
    const socketRecord = await databaseService.sockets.findOne({ guest_id: updatedOrder[0].guest_id })

    return {
      order: updatedOrder[0],
      socketId: socketRecord?.socketId
    }
  }
}

const ordersService = new OrdersService()
export default ordersService
