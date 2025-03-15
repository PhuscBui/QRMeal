import { CreateTableReqBody, UpdateTableReqBody } from '~/models/requests/Table.request'
import { Table } from '~/models/schemas/Table.schema'
import databaseService from '~/services/databases.service'
import { randomId } from '~/utils/common'

class TablesService {
  async checkTableExist(number: number) {
    const result = await databaseService.tables.findOne({ number })
    return Boolean(result)
  }

  async createTable(payload: CreateTableReqBody) {
    const token = randomId()
    const result = await databaseService.tables.insertOne(
      new Table({
        number: payload.number,
        capacity: payload.capacity,
        status: payload.status,
        token
      })
    )
    return await databaseService.tables.findOne({ _id: result.insertedId })
  }

  async getTables() {
    return await databaseService.tables.find().toArray()
  }

  async getTable(number: number) {
    return await databaseService.tables.findOne({ number })
  }

  async updateTable(number: number, payload: UpdateTableReqBody) {
    if (payload.changeToken) {
      const token = randomId()
      return await databaseService.tables.findOneAndUpdate(
        {
          number
        },
        {
          $set: {
            capacity: payload.capacity,
            status: payload.status,
            token
          },
          $currentDate: { updated_at: true }
        },
        { returnDocument: 'after' }
      )
    }
    return await databaseService.tables.findOneAndUpdate(
      {
        number
      },
      {
        $set: {
          capacity: payload.capacity,
          status: payload.status
        },
        $currentDate: { updated_at: true }
      },
      { returnDocument: 'after' }
    )
  }

  async deleteTable(number: number) {
    return await databaseService.tables.findOneAndDelete({ number })
  }
}

const tablesService = new TablesService()
export default tablesService
