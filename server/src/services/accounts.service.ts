import { CreateAccountReqBody } from '~/models/requests/Account.request'
import Account from '~/models/schemas/Account.schema'
import databaseService from '~/services/databases.service'
import { hashPassword } from '~/utils/crypto'

class AccountsService {
  async createAccount(payload: CreateAccountReqBody) {
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
