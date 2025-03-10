import { CreateEmployeeReqBody } from '~/models/requests/Account.request'
import Account from '~/models/schemas/Account.schema'
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
    return { user_id }
  }
}

const accountsService = new AccountsService()
export default accountsService
