import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import { Role } from '~/constants/type'
import {
  CreateEmployeeReqBody,
  CreateGuestReqBody,
  UpdateEmployeeReqBody,
  UpdateMeReqBody
} from '~/models/requests/Account.request'
import Account from '~/models/schemas/Account.schema'
import Guest from '~/models/schemas/Guest.schema'
import databaseService from '~/services/databases.service'
import { hashPassword } from '~/utils/crypto'

class AccountsService {
  async checkEmailExist(email: string) {
    const result = await databaseService.accounts.findOne({ email })
    return Boolean(result)
  }

  async getAccountCount() {
    return await databaseService.accounts.countDocuments()
  }

  async getOwnerId() {
    const result = await databaseService.accounts.findOne({ role: 'Owner' })
    return result?._id.toString()
  }

  async createAccount(payload: CreateEmployeeReqBody) {
    const result = await databaseService.accounts.insertOne(
      new Account({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password)
      })
    )
    const user_id = result.insertedId.toString()
    const user = await databaseService.accounts.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0
        }
      }
    )
    return user
  }

  async getAccounts() {
    const owner_id = await this.getOwnerId()
    const accounts = await databaseService.accounts
      .find(
        { owner_id: new ObjectId(owner_id) },
        {
          projection: {
            password: 0
          }
        }
      )
      .toArray()
    return accounts
  }

  async getAccountById(id: string) {
    return await databaseService.accounts.findOne(
      { _id: new ObjectId(id) },
      {
        projection: {
          password: 0
        }
      }
    )
  }

  async updateAccount(id: string, payload: UpdateEmployeeReqBody) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload
    if (_payload.change_password) {
      _payload.password = hashPassword(_payload.password as string)
      const result = await databaseService.accounts.findOneAndUpdate(
        {
          _id: new ObjectId(id)
        },
        {
          $set: {
            name: _payload.name,
            email: _payload.email,
            avatar: _payload.avatar || '',
            date_of_birth: _payload.date_of_birth as Date,
            password: _payload.password
          },
          $currentDate: { updated_at: true }
        },
        {
          returnDocument: 'after',
          projection: {
            password: 0
          }
        }
      )
      return result
    }
    const result = await databaseService.accounts.findOneAndUpdate(
      {
        _id: new ObjectId(id)
      },
      {
        $set: {
          name: _payload.name,
          email: _payload.email,
          avatar: _payload.avatar || '',
          date_of_birth: _payload.date_of_birth as Date
        },
        $currentDate: { updated_at: true }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0
        }
      }
    )
    return result
  }

  async deleteAccount(id: string) {
    return await databaseService.accounts.findOneAndDelete(
      { _id: new ObjectId(id) },
      {
        projection: {
          password: 0
        }
      }
    )
  }

  async updateMe(id: string, payload: UpdateMeReqBody) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload
    const result = await databaseService.accounts.findOneAndUpdate(
      {
        _id: new ObjectId(id)
      },
      {
        $set: {
          ...(_payload as UpdateMeReqBody & { date_of_birth?: Date })
        },
        $currentDate: { updated_at: true }
      },
      {
        returnDocument: 'after',
        projection: {
          password: 0
        }
      }
    )
    return result
  }

  async changePassword(user_id: string, password: string) {
    await databaseService.accounts.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          password: hashPassword(password)
        },
        $currentDate: { updated_at: true }
      }
    )
    return {
      message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS
    }
  }

  async createGuest(payload: CreateGuestReqBody) {
    const result = await databaseService.guests.insertOne(
      new Guest({
        ...payload,
        role: Role.Guest
      })
    )
    return await databaseService.guests.findOne(
      { _id: result.insertedId },
      {
        projection: {
          refresh_token: 0,
          refresh_token_exp: 0
        }
      }
    )
  }

  async getGuests(fromDate?: string, toDate?: string) {
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
    const guests = databaseService.guests.aggregate([
      {
        $match: matchCondition
      },
      {
        $project: {
          refresh_token: 0,
          refresh_token_exp: 0
        }
      }
    ])
    return guests.toArray()
  }
}

const accountsService = new AccountsService()
export default accountsService
