import { ObjectId } from 'mongodb'
import ms from 'ms'
import { envConfig } from '~/config'
import { DISHES_MESSAGE, TABLES_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { DishStatus, OrderStatus, OrderType, TableStatus, TokenType } from '~/constants/type'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import databaseService from '~/services/databases.service'
import { signToken, verifyToken } from '~/utils/jwt'
import Order from '~/models/schemas/Order.schema'
import { ErrorWithStatus } from '~/models/Error'
import HTTP_STATUS from '~/constants/httpStatus'
import DishSnapshot from '~/models/schemas/DishSnapshot.schema'
import OrderGroup from '~/models/schemas/OrderGroup.schema'

class GuestsService {
  private signAccessToken(account_id: string, role: string) {
    return signToken({
      payload: { account_id, token_type: TokenType.AccessToken, role },
      privateKey: envConfig.accessTokenSecret,
      options: { expiresIn: envConfig.guestAccessTokenExpiresIn as ms.StringValue }
    })
  }

  private signRefreshToken(account_id: string, role: string, exp?: number) {
    if (exp) {
      return signToken({
        payload: { account_id, token_type: TokenType.RefreshToken, role, exp },
        privateKey: envConfig.refreshTokenSecret
      })
    }
    return signToken({
      payload: { account_id, token_type: TokenType.RefreshToken, role },
      privateKey: envConfig.refreshTokenSecret,
      options: { expiresIn: envConfig.guestRefreshTokenExpiresIn as ms.StringValue }
    })
  }

  private signAccessAndRefreshTokens(account_id: string, role: string) {
    return Promise.all([this.signAccessToken(account_id, role), this.signRefreshToken(account_id, role)])
  }

  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({
      token: refresh_token,
      secretOrPublicKey: envConfig.refreshTokenSecret
    })
  }

  async login(account_id: string, role: string) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshTokens(account_id, role)
    const { iat, exp } = await this.decodeRefreshToken(refresh_token)

    const [guest] = await Promise.all([
      await databaseService.guests.findOneAndUpdate(
        { _id: new ObjectId(account_id) },
        {
          $set: {
            refresh_token: refresh_token,
            refresh_token_exp: new Date(exp * 1000)
          },
          $currentDate: { updated_at: true }
        },
        {
          returnDocument: 'after',
          projection: {
            refresh_token: 0,
            refresh_token_exp: 0
          }
        }
      ),
      await databaseService.refreshTokens.insertOne(
        new RefreshToken({ account_id: new ObjectId(account_id), token: refresh_token, iat: iat, exp: exp })
      )
    ])

    return { access_token, refresh_token, guest }
  }

  async logout(refresh_token: string) {
    await databaseService.guests.updateOne(
      { refresh_token: refresh_token },
      {
        $set: {
          refresh_token: null,
          refresh_token_exp: null
        },
        $currentDate: { updated_at: true }
      }
    )

    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      message: USERS_MESSAGES.USER_LOGOUT_SUCCESS
    }
  }

  async refreshToken({
    account_id,
    refresh_token,
    role,
    exp
  }: {
    account_id: string
    refresh_token: string
    role: string
    exp: number
  }) {
    const [access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken(account_id, role),
      this.signRefreshToken(account_id, role, exp),
      databaseService.refreshTokens.deleteOne({ token: refresh_token })
    ])
    const { iat, exp: new_exp } = await this.decodeRefreshToken(new_refresh_token)

    await Promise.all([
      await databaseService.refreshTokens.deleteOne({ token: refresh_token }),
      await databaseService.refreshTokens.insertOne(
        new RefreshToken({ account_id: new ObjectId(account_id), token: new_refresh_token, iat: iat, exp: new_exp })
      ),
      await databaseService.guests.updateOne(
        { _id: new ObjectId(account_id) },
        {
          $set: {
            refresh_token: new_refresh_token,
            refresh_token_exp: new Date(new_exp * 1000)
          },
          $currentDate: { updated_at: true }
        }
      )
    ])

    return { access_token, refresh_token: new_refresh_token }
  }

  // Updated createOrder method for GuestsService
  async createOrder({ account_id, orders }: { account_id: string; orders: { dish_id: string; quantity: number }[] }) {
    const guest = await databaseService.guests.findOne({ _id: new ObjectId(account_id) })
    if (!guest) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (guest.table_number === null) {
      throw new ErrorWithStatus({
        message: TABLES_MESSAGES.TABLE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const table = await databaseService.tables.findOne({ number: guest.table_number })
    if (!table) {
      throw new ErrorWithStatus({
        message: TABLES_MESSAGES.TABLE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (table.status === TableStatus.Hidden) {
      throw new ErrorWithStatus({
        message: TABLES_MESSAGES.TABLE_IS_HIDDEN_PLEASE_CHOOSE_ANOTHER_TABLE,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    if (table.status === TableStatus.Reserved && table.reservation?.guest_id.toString() !== guest._id.toString()) {
      throw new ErrorWithStatus({
        message: TABLES_MESSAGES.TABLE_IS_RESERVED_PLEASE_CHOOSE_ANOTHER_TABLE,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const session = databaseService.clientInstance.startSession()

    try {
      session.startTransaction()

      // Create order group for the guest
      const orderGroup = await databaseService.orderGroups.insertOne(
        new OrderGroup({
          customer_id: null,
          guest_id: new ObjectId(account_id),
          table_number: guest.table_number,
          order_type: OrderType.DineIn,
          status: OrderStatus.Pending
        }),
        { session }
      )

      const ordersResult = []

      // Create orders for each dish
      for (const orderItem of orders) {
        const dish = await databaseService.dishes.findOne({ _id: new ObjectId(orderItem.dish_id) }, { session })
        if (!dish) {
          throw new ErrorWithStatus({
            message: DISHES_MESSAGE.DISH_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
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
            name: dish.name,
            price: dish.price,
            image: dish.image,
            description: dish.description,
            category_ids: dish.category_ids,
            status: dish.status,
            dish_id: dish._id
          }),
          { session }
        )

        // Create order
        const order = await databaseService.orders.insertOne(
          new Order({
            order_group_id: orderGroup.insertedId,
            dish_snapshot_id: dishSnapshot.insertedId,
            quantity: orderItem.quantity,
            status: OrderStatus.Pending,
            order_handler_id: null
          }),
          { session }
        )

        // Fetch complete order data
        const completeOrder = await databaseService.orders
          .aggregate(
            [
              { $match: { _id: order.insertedId } },
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
                  from: 'guests',
                  localField: 'order_group.guest_id',
                  foreignField: '_id',
                  as: 'guest'
                }
              },
              { $unwind: '$guest' },
              {
                $project: {
                  guest: {
                    refresh_token: 0,
                    refresh_token_exp: 0
                  }
                }
              }
            ],
            { session }
          )
          .toArray()

        ordersResult.push(completeOrder[0])
      }

      await session.commitTransaction()

      return {
        orderGroup: {
          _id: orderGroup.insertedId,
          guest_id: new ObjectId(account_id),
          table_number: guest.table_number,
          order_type: OrderType.DineIn,
          status: OrderStatus.Pending
        },
        orders: ordersResult
      }
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession()
    }
  }

  // Updated getOrders method for GuestsService
  async getOrders(account_id: string) {
    const orderGroups = await databaseService.orderGroups
      .aggregate([
        {
          $match: {
            guest_id: new ObjectId(account_id)
          }
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
          $lookup: {
            from: 'guests',
            localField: 'guest_id',
            foreignField: '_id',
            as: 'guest'
          }
        },
        {
          $unwind: {
            path: '$delivery',
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
            guest_id: { $first: '$guest_id' },
            table_number: { $first: '$table_number' },
            order_type: { $first: '$order_type' },
            status: { $first: '$status' },
            created_at: { $first: '$created_at' },
            updated_at: { $first: '$updated_at' },
            delivery: { $first: '$delivery' },
            guest: { $first: '$guest' },
            orders: { $push: '$orders' }
          }
        },
        {
          $project: {
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

  // Alternative method to get individual orders (if needed for backward compatibility)
  async getOrdersList(account_id: string) {
    const orders = await databaseService.orders
      .aggregate([
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
          $match: {
            'order_group.guest_id': new ObjectId(account_id)
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
          $lookup: {
            from: 'dish_snapshots',
            localField: 'dish_snapshot_id',
            foreignField: '_id',
            as: 'dish_snapshot'
          }
        },
        {
          $unwind: {
            path: '$guest'
          }
        },
        {
          $unwind: {
            path: '$dish_snapshot'
          }
        },
        {
          $lookup: {
            from: 'accounts',
            localField: 'order_handler_id',
            foreignField: '_id',
            as: 'order_handler'
          }
        },
        {
          $unwind: {
            path: '$order_handler',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            guest: {
              refresh_token: 0,
              refresh_token_exp: 0
            }
          }
        },
        { $sort: { created_at: -1 } }
      ])
      .toArray()

    return orders
  }

  async getMe(account_id: string) {
    const guest = await databaseService.guests.findOne(
      { _id: new ObjectId(account_id) },
      {
        projection: {
          refresh_token: 0,
          refresh_token_exp: 0,
          created_at: 0,
          updated_at: 0
        }
      }
    )
    if (guest === null) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return guest
  }
}

const guestsService = new GuestsService()
export default guestsService
