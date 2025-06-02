import { ObjectId } from 'mongodb'
import ms from 'ms'
import { envConfig } from '~/config'
import { DISHES_MESSAGE, TABLES_MESSAGES, USERS_MESSAGES } from '~/constants/messages'
import { DishStatus, OrderStatus, TableStatus, TokenType } from '~/constants/type'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import databaseService from '~/services/databases.service'
import { signToken, verifyToken } from '~/utils/jwt'
import Order from '~/models/schemas/Order.schema'
import { ErrorWithStatus } from '~/models/Error'
import HTTP_STATUS from '~/constants/httpStatus'
import DishSnapshot from '~/models/schemas/DishSnapshot.schema'

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

    const dish_ids = orders.map((order) => new ObjectId(order.dish_id))
    const ordersResult = await Promise.all(
      dish_ids.map(async (dish_id) => {
        const dish = await databaseService.dishes.findOne({ _id: dish_id })
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

        const dishSnapshot = await databaseService.dishSnapshots.insertOne(
          new DishSnapshot({
            name: dish.name,
            price: dish.price,
            image: dish.image,
            description: dish.description,
            status: dish.status,
            dish_id: dish._id
          })
        )

        const order = await databaseService.orders.insertOne(
          new Order({
            dish_snapshot_id: dishSnapshot.insertedId,
            guest_id: new ObjectId(account_id),
            quantity: orders.find((order) => order.dish_id === dish_id.toString())?.quantity || 1,
            table_number: guest.table_number,
            status: OrderStatus.Pending,
            order_handler_id: null
          })
        )

        return await databaseService.orders
          .aggregate([
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
                from: 'guests',
                localField: 'guest_id',
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
          ])
          .toArray()
      })
    )

    return ordersResult.flat()
  }

  async getOrders(account_id: string) {
    const orders = await databaseService.orders
      .aggregate([
        {
          $match: {
            guest_id: new ObjectId(account_id)
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
          $project: {
            guest: {
              refresh_token: 0,
              refresh_token_exp: 0
            }
          }
        }
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
