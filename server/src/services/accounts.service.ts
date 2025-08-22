import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { Role } from '~/constants/type'
import { ErrorWithStatus } from '~/models/Error'
import {
  CreateCustomerReqBody,
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

  async checkPhoneExist(phone: string) {
    const result = await databaseService.accounts.findOne({ phone })
    return Boolean(result)
  }

  async checkEmailExistForUpdate(email: string, id: string) {
    const account = await databaseService.accounts.findOne({ email })
    return !!(account && account._id.toString() !== id)
  }

  async checkPhoneExistForUpdate(phone: string, id: string) {
    const account = await databaseService.accounts.findOne({ phone })
    return !!(account && account._id.toString() !== id)
  }

  async getAccountCount() {
    return await databaseService.accounts.countDocuments()
  }

  async getOwnerId() {
    const result = await databaseService.accounts.findOne({ role: 'Owner' })
    return result?._id.toString()
  }

  async createAccount(payload: CreateEmployeeReqBody) {
    const emailExists = await this.checkEmailExist(payload.email)
    if (emailExists)
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.EMAIL_ALREADY_EXISTS,
        status: HTTP_STATUS.BAD_REQUEST
      })

    const phoneExists = await this.checkPhoneExist(payload.phone)
    if (phoneExists)
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.PHONE_ALREADY_EXISTS,
        status: HTTP_STATUS.BAD_REQUEST
      })

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
    if (payload.email) {
      const emailExists = await this.checkEmailExistForUpdate(payload.email, id)
      if (emailExists)
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.EMAIL_ALREADY_EXISTS,
          status: HTTP_STATUS.BAD_REQUEST
        })
    }

    if (payload.phone) {
      const phoneExists = await this.checkPhoneExistForUpdate(payload.phone, id)
      if (phoneExists)
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.PHONE_ALREADY_EXISTS,
          status: HTTP_STATUS.BAD_REQUEST
        })
    }

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
            phone: _payload.phone,
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
          phone: _payload.phone,
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
    if (payload.email) {
      const emailExists = await this.checkEmailExistForUpdate(payload.email, id)
      if (emailExists)
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.EMAIL_ALREADY_EXISTS,
          status: HTTP_STATUS.BAD_REQUEST
        })
    }

    if (payload.phone) {
      const phoneExists = await this.checkPhoneExistForUpdate(payload.phone, id)
      if (phoneExists)
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.PHONE_ALREADY_EXISTS,
          status: HTTP_STATUS.BAD_REQUEST
        })
    }

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
        role: Role.Guest,
        phone: payload.phone
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

  async getGuestById(id: string) {
    const guest = await databaseService.guests.findOne({ _id: new ObjectId(id) })
    return guest
  }

  async createCustomer(payload: CreateCustomerReqBody) {
    const { email, phone } = payload

    const emailExists = await this.checkEmailExist(email)
    if (emailExists)
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.EMAIL_ALREADY_EXISTS,
        status: HTTP_STATUS.BAD_REQUEST
      })

    const phoneExists = await this.checkPhoneExist(phone)
    if (phoneExists)
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.PHONE_ALREADY_EXISTS,
        status: HTTP_STATUS.BAD_REQUEST
      })

    const result = await databaseService.accounts.insertOne(
      new Account({
        ...payload,
        role: Role.Customer,
        phone: payload.phone,
        owner_id: null,
        password: hashPassword(payload.password),
        date_of_birth: new Date(payload.date_of_birth)
      })
    )
    const user_id = result.insertedId.toString()
    return await databaseService.accounts.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0
        }
      }
    )
  }

  async getCustomers() {
    const customers = await databaseService.accounts.find(
      { role: Role.Customer },
      {
        projection: {
          password: 0
        }
      }
    )
    return customers.toArray()
  }
}

const accountsService = new AccountsService()
export default accountsService
