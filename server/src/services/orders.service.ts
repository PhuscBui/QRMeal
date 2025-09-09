/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObjectId } from 'mongodb'
import { envConfig } from '~/config'
import HTTP_STATUS from '~/constants/httpStatus'
import { DISHES_MESSAGE, ORDERS_MESSAGE, TABLES_MESSAGES } from '~/constants/messages'
import { DishStatus, OrderStatus, TableStatus, OrderType, DeliveryStatus } from '~/constants/type'
import { ErrorWithStatus } from '~/models/Error'
import { CreateOrderGroupReqBody, GetOrdersQueryParams, UpdateOrderReqBody } from '~/models/requests/Order.request'
import Delivery from '~/models/schemas/Delivery.schema'
import DishSnapshot from '~/models/schemas/DishSnapshot.schema'
import Order from '~/models/schemas/Order.schema'
import OrderGroup from '~/models/schemas/OrderGroup.schema'
import databaseService from '~/services/databases.service'

class OrdersService {
  async createOrderGroup(orderHandlerId: string, body: CreateOrderGroupReqBody) {
    const { customer_id, guest_id, orders, order_type, delivery_info, table_number, takeaway_info } = body

    let tableNumber: number | null = null

    // Validate customer or guest exists and get table info if applicable
    if (customer_id) {
      const customer = await databaseService.accounts.findOne({ _id: new ObjectId(customer_id) })
      if (!customer) {
        throw new ErrorWithStatus({
          message: ORDERS_MESSAGE.CUSTOMER_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
      // For customers, table_number might be null for delivery orders
      tableNumber = table_number !== undefined ? table_number : null
    } else if (guest_id) {
      const guest = await databaseService.guests.findOne({ _id: new ObjectId(guest_id) })
      if (!guest) {
        throw new ErrorWithStatus({
          message: ORDERS_MESSAGE.GUEST_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }

      if (order_type === OrderType.DineIn && guest.table_number === null) {
        throw new ErrorWithStatus({
          message: TABLES_MESSAGES.TABLE_NOT_ASSIGNED,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }

      tableNumber = guest.table_number
    } else {
      throw new ErrorWithStatus({
        message: ORDERS_MESSAGE.CUSTOMER_OR_GUEST_REQUIRED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Validate table for dine-in orders
    if (order_type === OrderType.DineIn && tableNumber) {
      const guest = await databaseService.guests.findOne({ _id: guest_id ? new ObjectId(guest_id) : undefined })

      const table = await databaseService.tables.findOne({ number: tableNumber })
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

      if (
        table.status === TableStatus.Occupied &&
        guest?.table_number !== tableNumber &&
        table.current_customer_id?.toString() !== customer_id
      ) {
        throw new ErrorWithStatus({
          message: TABLES_MESSAGES.TABLE_IS_OCCUPIED_PLEASE_CHOOSE_ANOTHER_TABLE,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }

      if (table.status === TableStatus.Reserved) {
        throw new ErrorWithStatus({
          message: TABLES_MESSAGES.TABLE_IS_RESERVED_PLEASE_CHOOSE_ANOTHER_TABLE,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }

    // Validate delivery info for delivery orders
    if (order_type === OrderType.Delivery && !delivery_info) {
      throw new ErrorWithStatus({
        message: ORDERS_MESSAGE.DELIVERY_INFO_REQUIRED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    if (order_type === OrderType.Takeaway && !takeaway_info) {
      throw new ErrorWithStatus({
        message: ORDERS_MESSAGE.TAKEAWAY_INFO_REQUIRED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const session = databaseService.clientInstance.startSession()

    try {
      session.startTransaction()

      // Create order group
      const orderGroup = await databaseService.orderGroups.insertOne(
        new OrderGroup({
          customer_id: customer_id ? new ObjectId(customer_id) : null,
          guest_id: guest_id ? new ObjectId(guest_id) : null,
          table_number: tableNumber,
          order_type,
          status: OrderStatus.Pending,
          takeaway_info: takeaway_info ? takeaway_info : null
        }),
        { session }
      )

      // Create delivery record if needed
      let deliveryRecord = null
      if (order_type === OrderType.Delivery && delivery_info) {
        deliveryRecord = await databaseService.deliveries.insertOne(
          new Delivery({
            order_group_id: orderGroup.insertedId,
            address: delivery_info.address,
            notes: delivery_info.notes,
            receiver_name: delivery_info.receiver_name,
            receiver_phone: delivery_info.receiver_phone,
            delivery_status: DeliveryStatus.Pending,
            shipper_info: envConfig.initialShipperInfo
          }),
          { session }
        )
      }

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
          new DishSnapshot({
            description: dish.description,
            image: dish.image,
            name: dish.name,
            price: dish.price,
            dish_id: dish._id,
            category_id: dish.category_id,
            status: dish.status,
            created_at: new Date()
          }),
          { session }
        )

        // Create order
        const orderRecord = await databaseService.orders.insertOne(
          new Order({
            order_group_id: orderGroup.insertedId,
            dish_snapshot_id: dishSnapshot.insertedId,
            quantity: order.quantity,
            order_handler_id: new ObjectId(orderHandlerId),
            status: OrderStatus.Pending,
            created_at: new Date(),
            updated_at: new Date()
          }),
          { session }
        )

        // Fetch the complete order with related data
        const completeOrder = await databaseService.orders
          .aggregate(
            [
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
              { $unwind: { path: '$order_handler', preserveNullAndEmptyArrays: true } }
            ],
            { session }
          )
          .toArray()

        ordersRecord.push(completeOrder[0])
      }

      if (tableNumber) {
        await databaseService.tables.updateOne(
          { number: tableNumber },
          {
            $set: { status: TableStatus.Occupied, reservation: null, current_customer_id: new ObjectId(customer_id) },
            $currentDate: { updated_at: true }
          },
          { session }
        )
      }

      await session.commitTransaction()

      // Find socket record for notification
      let socketRecord = null
      if (customer_id) {
        socketRecord = await databaseService.sockets.findOne({ customer_id: new ObjectId(customer_id) })
      } else if (guest_id) {
        socketRecord = await databaseService.sockets.findOne({ guest_id: new ObjectId(guest_id) })
      }

      return {
        orderGroup: {
          _id: orderGroup.insertedId,
          customer_id: customer_id ? new ObjectId(customer_id) : null,
          guest_id,
          table_number: tableNumber,
          order_type,
          takeaway_info,
          status: OrderStatus.Pending,
          delivery: deliveryRecord
            ? {
                _id: deliveryRecord.insertedId,
                ...delivery_info,
                delivery_status: DeliveryStatus.Pending
              }
            : null
        },
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
    const { fromDate, toDate, order_type, customer_id, guest_id } = query
    const matchCondition: any = {}

    if (fromDate || toDate) {
      matchCondition.created_at = {}
      if (fromDate) {
        matchCondition.created_at.$gte = new Date(fromDate)
      }
      if (toDate) {
        matchCondition.created_at.$lte = new Date(toDate)
      }
    }

    if (order_type) {
      matchCondition.order_type = order_type
    }

    if (customer_id) {
      matchCondition.customer_id = new ObjectId(customer_id)
    }

    if (guest_id) {
      matchCondition.guest_id = guest_id
    }

    const orderGroups = await databaseService.orderGroups
      .aggregate([
        {
          $match: matchCondition
        },
        {
          $lookup: {
            from: 'orders',
            localField: '_id',
            foreignField: 'order_group_id',
            as: 'orders'
          }
        },
        {
          $lookup: {
            from: 'deliveries',
            localField: '_id',
            foreignField: 'order_group_id',
            as: 'delivery'
          }
        },
        {
          $unwind: {
            path: '$delivery',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'accounts',
            localField: 'customer_id',
            foreignField: '_id',
            as: 'customer'
          }
        },
        {
          $unwind: {
            path: '$customer',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'guests',
            localField: 'guest_id',
            foreignField: '_id',
            as: 'guest'
          }
        },
        {
          $unwind: {
            path: '$guest',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: '$orders',
            preserveNullAndEmptyArrays: false
          }
        },
        {
          $lookup: {
            from: 'dish_snapshots',
            localField: 'orders.dish_snapshot_id',
            foreignField: '_id',
            as: 'orders.dish_snapshot'
          }
        },
        {
          $unwind: '$orders.dish_snapshot'
        },
        {
          $lookup: {
            from: 'accounts',
            localField: 'orders.order_handler_id',
            foreignField: '_id',
            as: 'orders.order_handler'
          }
        },
        {
          $unwind: {
            path: '$orders.order_handler',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: '$_id',
            customer_id: { $first: '$customer_id' },
            guest_id: { $first: '$guest_id' },
            table_number: { $first: '$table_number' },
            order_type: { $first: '$order_type' },
            takeaway_info: { $first: '$takeaway_info' },
            status: { $first: '$status' },
            created_at: { $first: '$created_at' },
            updated_at: { $first: '$updated_at' },
            delivery: { $first: '$delivery' },
            customer: { $first: '$customer' },
            guest: { $first: '$guest' },
            orders: { $push: '$orders' }
          }
        },
        {
          $project: {
            customer: {
              password: 0
            },
            guest: {
              refresh_token: 0,
              refresh_token_exp: 0
            }
          }
        },
        { $sort: { created_at: -1 } }
      ])
      .toArray()

    return orderGroups
  }

  async payOrders(customerOrGuestId: string, orderHandlerId: string, isCustomer: boolean = false) {
    const matchCondition = isCustomer
      ? { customer_id: new ObjectId(customerOrGuestId) }
      : { guest_id: new ObjectId(customerOrGuestId) }

    // Find order groups that need to be paid
    const orderGroups = await databaseService.orderGroups
      .find({
        ...matchCondition,
        status: {
          $in: [OrderStatus.Pending, OrderStatus.Processing, OrderStatus.Delivered]
        }
      })
      .toArray()

    if (orderGroups.length === 0) {
      throw new ErrorWithStatus({
        message: ORDERS_MESSAGE.NO_ORDERS_TO_PAY,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const session = databaseService.clientInstance.startSession()

    try {
      session.startTransaction()

      // Update order groups
      await Promise.all([
        await databaseService.orderGroups.updateMany(
          {
            _id: { $in: orderGroups.map((og) => og._id) }
          },
          {
            $set: {
              status: OrderStatus.Paid,
              updated_at: new Date()
            }
          },
          { session }
        ),
        await databaseService.orders.updateMany(
          {
            order_group_id: { $in: orderGroups.map((og) => og._id) }
          },
          {
            $set: {
              status: OrderStatus.Paid,
              order_handler_id: new ObjectId(orderHandlerId),
              updated_at: new Date()
            }
          },
          { session }
        )
      ])

      // Update individual orders

      // Get updated order groups with complete information
      const orderGroupsResult = await this.getOrderGroupsByIds(orderGroups.map((og) => og._id))

      await Promise.all([
        await databaseService.tables.updateOne(
          { number: orderGroupsResult[0].table_number },
          { $set: { status: TableStatus.Available }, $currentDate: { updated_at: true } },
          { session }
        ),
        await databaseService.deliveries.updateMany(
          {
            order_group_id: { $in: orderGroupsResult.map((og) => og._id) }
          },
          {
            $set: {
              delivery_status: DeliveryStatus.Delivered,
              updated_at: new Date()
            }
          },
          { session }
        )
      ])

      await session.commitTransaction()

      const socketRecord = isCustomer
        ? await databaseService.sockets.findOne({ customer_id: new ObjectId(customerOrGuestId) })
        : await databaseService.sockets.findOne({ guest_id: new ObjectId(customerOrGuestId) })

      return {
        orderGroups: orderGroupsResult,
        socketId: socketRecord?.socketId
      }
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession()
    }
  }

  async getOrderGroupDetail(orderGroupId: string) {
    const orderGroup = await databaseService.orderGroups
      .aggregate([
        { $match: { _id: new ObjectId(orderGroupId) } },
        {
          $lookup: {
            from: 'orders',
            localField: '_id',
            foreignField: 'order_group_id',
            as: 'orders'
          }
        },
        {
          $lookup: {
            from: 'deliveries',
            localField: '_id',
            foreignField: 'order_group_id',
            as: 'delivery'
          }
        },
        {
          $unwind: {
            path: '$delivery',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'accounts',
            localField: 'customer_id',
            foreignField: '_id',
            as: 'customer'
          }
        },
        {
          $lookup: {
            from: 'guests',
            localField: 'guest_id',
            foreignField: '_id',
            as: 'guest'
          }
        },
        {
          $lookup: {
            from: 'tables',
            localField: 'table_number',
            foreignField: 'number',
            as: 'table'
          }
        },
        {
          $unwind: {
            path: '$orders',
            preserveNullAndEmptyArrays: false
          }
        },
        {
          $unwind: {
            path: '$customer',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: '$guest',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'dish_snapshots',
            localField: 'orders.dish_snapshot_id',
            foreignField: '_id',
            as: 'orders.dish_snapshot'
          }
        },
        {
          $unwind: '$orders.dish_snapshot'
        },
        {
          $lookup: {
            from: 'accounts',
            localField: 'orders.order_handler_id',
            foreignField: '_id',
            as: 'orders.order_handler'
          }
        },
        {
          $unwind: {
            path: '$orders.order_handler',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: '$_id',
            customer_id: { $first: '$customer_id' },
            guest_id: { $first: '$guest_id' },
            table_number: { $first: '$table_number' },
            order_type: { $first: '$order_type' },
            takeaway_info: { $first: '$takeaway_info' },
            status: { $first: '$status' },
            created_at: { $first: '$created_at' },
            updated_at: { $first: '$updated_at' },
            delivery: { $first: '$delivery' },
            customer: { $first: '$customer' },
            guest: { $first: '$guest' },
            table: { $first: '$table' },
            orders: { $push: '$orders' }
          }
        },
        {
          $project: {
            customer: {
              refresh_token: 0,
              refresh_token_exp: 0
            },
            guest: {
              refresh_token: 0,
              refresh_token_exp: 0
            }
          }
        }
      ])
      .toArray()

    if (!orderGroup || orderGroup.length === 0) {
      throw new ErrorWithStatus({
        message: ORDERS_MESSAGE.ORDER_GROUP_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return orderGroup[0]
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
    if (existingDishSnapshot?.dish_id && dish_id && existingDishSnapshot.dish_id.toString() !== dish_id.toString()) {
      const dish = await databaseService.dishes.findOne({ _id: new ObjectId(dish_id) })
      if (!dish) {
        throw new ErrorWithStatus({
          message: DISHES_MESSAGE.DISH_NOT_FOUND,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }

      const newDishSnapshot = await databaseService.dishSnapshots.insertOne(
        new DishSnapshot({
          description: dish.description,
          image: dish.image,
          name: dish.name,
          price: dish.price,
          category_id: dish.category_id,
          dish_id: dish._id,
          status: dish.status,
          created_at: new Date()
        })
      )

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

    // Update order group status based on all orders in the group
    await this.updateOrderGroupStatus(order.order_group_id)

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
        { $unwind: { path: '$order_handler', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'order_groups',
            localField: 'order_group_id',
            foreignField: '_id',
            as: 'order_group'
          }
        },
        { $unwind: '$order_group' },
        {
          $lookup: {
            from: 'accounts',
            localField: 'order_group.customer_id',
            foreignField: '_id',
            as: 'customer'
          }
        },
        {
          $unwind: {
            path: '$customer',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'guests',
            localField: 'order_group.guest_id',
            foreignField: '_id',
            as: 'guest'
          }
        },
        {
          $unwind: {
            path: '$guest',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            customer: {
              password: 0
            },
            guest: {
              refresh_token: 0,
              refresh_token_exp: 0
            }
          }
        }
      ])
      .toArray()

    // Find socket record for notification
    const orderGroup = updatedOrder[0].order_group
    const socketRecord = orderGroup.customer_id
      ? await databaseService.sockets.findOne({ customer_id: orderGroup.customer_id })
      : await databaseService.sockets.findOne({ guest_id: orderGroup.guest_id })

    return {
      order: updatedOrder[0],
      socketId: socketRecord?.socketId
    }
  }

  // Helper method to update order group status
  private async updateOrderGroupStatus(orderGroupId: ObjectId) {
    // Get all orders in the group
    const ordersInGroup = await databaseService.orders
      .find({
        order_group_id: orderGroupId
      })
      .toArray()

    if (ordersInGroup.length === 0) return

    // Calculate new order group status based on order statuses
    const newOrderGroupStatus = this.calculateOrderGroupStatus(
      ordersInGroup.map((o) => o.status) as Array<'Pending' | 'Processing' | 'Delivered' | 'Paid' | 'Cancelled'>
    )

    // Update order group status
    await databaseService.orderGroups.updateOne(
      { _id: orderGroupId },
      {
        $set: {
          status: newOrderGroupStatus,
          updated_at: new Date()
        }
      }
    )
  }

  // Helper method to calculate order group status based on individual order statuses
  private calculateOrderGroupStatus(
    orderStatuses: Array<'Pending' | 'Processing' | 'Delivered' | 'Paid' | 'Cancelled'>
  ): string {
    // Order status priority based on the workflow
    const statusPriority: Record<'Pending' | 'Processing' | 'Delivered' | 'Paid' | 'Cancelled', number> = {
      Pending: 1,
      Processing: 2,
      Delivered: 3,
      Paid: 4,
      Cancelled: 5
    }

    if (orderStatuses.every((status) => status === 'Cancelled')) {
      return 'Cancelled'
    }

    if (orderStatuses.every((status) => status === 'Paid')) {
      return 'Paid'
    }

    if (orderStatuses.some((status) => status === 'Cancelled')) {
      const nonCancelledStatuses = orderStatuses.filter((status) => status !== 'Cancelled') as Array<
        'Pending' | 'Processing' | 'Delivered' | 'Paid'
      >
      if (nonCancelledStatuses.length === 0) return 'Cancelled'
      return this.calculateOrderGroupStatus(
        nonCancelledStatuses as Array<'Pending' | 'Processing' | 'Delivered' | 'Paid' | 'Cancelled'>
      )
    }

    // Find the minimum status (earliest stage) among all orders
    const minStatusPriority = Math.min(...orderStatuses.map((status) => statusPriority[status]))
    const groupStatus = Object.keys(statusPriority).find(
      (status) => statusPriority[status as keyof typeof statusPriority] === minStatusPriority
    )

    // Return the earliest status in the workflow
    // The order group should be at the stage of the least progressed order
    return groupStatus || 'Pending'
  }

  async updateDeliveryStatus(orderGroupId: string, deliveryStatus: string, shipperInfo?: string, estimatedTime?: Date) {
    const orderGroup = await databaseService.orderGroups.findOne({ _id: new ObjectId(orderGroupId) })
    if (!orderGroup) {
      throw new ErrorWithStatus({
        message: ORDERS_MESSAGE.ORDER_GROUP_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (orderGroup.order_type !== OrderType.Delivery) {
      throw new ErrorWithStatus({
        message: ORDERS_MESSAGE.ORDER_IS_NOT_DELIVERY,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const updateData: any = {
      delivery_status: deliveryStatus,
      updated_at: new Date()
    }

    if (shipperInfo) {
      updateData.shipper_info = shipperInfo
    }

    if (estimatedTime) {
      updateData.estimated_time = estimatedTime
    }

    await databaseService.deliveries.updateOne({ order_group_id: new ObjectId(orderGroupId) }, { $set: updateData })

    let orderGroupStatus: string | undefined

    switch (deliveryStatus) {
      case DeliveryStatus.Pending:
        orderGroupStatus = OrderStatus.Pending
        break
      case DeliveryStatus.Shipping:
        orderGroupStatus = OrderStatus.Processing
        break
      case DeliveryStatus.Delivered:
        orderGroupStatus = OrderStatus.Delivered
        break
      case DeliveryStatus.Cancelled:
        orderGroupStatus = OrderStatus.Cancelled
        break
    }

    if (orderGroupStatus) {
      await databaseService.orderGroups.updateOne(
        { _id: new ObjectId(orderGroupId) },
        { $set: { status: orderGroupStatus, updated_at: new Date() } }
      )
    }

    const updatedOrderGroup = await this.getOrderGroupDetail(orderGroupId)

    // Find socket record for notification
    const socketRecord = updatedOrderGroup.customer_id
      ? await databaseService.sockets.findOne({ customer_id: updatedOrderGroup.customer_id })
      : await databaseService.sockets.findOne({ guest_id: updatedOrderGroup.guest_id })

    return {
      orderGroup: updatedOrderGroup,
      socketId: socketRecord?.socketId
    }
  }

  private async getOrderGroupsByIds(orderGroupIds: ObjectId[]) {
    return await databaseService.orderGroups
      .aggregate([
        { $match: { _id: { $in: orderGroupIds } } },
        {
          $lookup: {
            from: 'orders',
            localField: '_id',
            foreignField: 'order_group_id',
            as: 'orders'
          }
        },
        {
          $lookup: {
            from: 'deliveries',
            localField: '_id',
            foreignField: 'order_group_id',
            as: 'delivery'
          }
        },
        {
          $unwind: {
            path: '$delivery',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'accounts',
            localField: 'customer_id',
            foreignField: '_id',
            as: 'customer'
          }
        },
        {
          $lookup: {
            from: 'guests',
            localField: 'guest_id',
            foreignField: '_id',
            as: 'guest'
          }
        },
        {
          $unwind: {
            path: '$customer',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: '$guest',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: '$orders',
            preserveNullAndEmptyArrays: false
          }
        },
        {
          $lookup: {
            from: 'dish_snapshots',
            localField: 'orders.dish_snapshot_id',
            foreignField: '_id',
            as: 'orders.dish_snapshot'
          }
        },
        {
          $unwind: '$orders.dish_snapshot'
        },
        {
          $lookup: {
            from: 'accounts',
            localField: 'orders.order_handler_id',
            foreignField: '_id',
            as: 'orders.order_handler'
          }
        },
        {
          $unwind: {
            path: '$orders.order_handler',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $group: {
            _id: '$_id',
            customer_id: { $first: '$customer_id' },
            guest_id: { $first: '$guest_id' },
            table_number: { $first: '$table_number' },
            order_type: { $first: '$order_type' },
            takeaway_info: { $first: '$takeaway_info' },
            status: { $first: '$status' },
            created_at: { $first: '$created_at' },
            updated_at: { $first: '$updated_at' },
            delivery: { $first: '$delivery' },
            customer: { $first: '$customer' },
            guest: { $first: '$guest' },
            orders: { $push: '$orders' }
          }
        },
        {
          $project: {
            customer: {
              refresh_token: 0,
              refresh_token_exp: 0
            },
            guest: {
              refresh_token: 0,
              refresh_token_exp: 0
            }
          }
        }
      ])
      .toArray()
  }
}

const ordersService = new OrdersService()
export default ordersService
