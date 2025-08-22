import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { TABLES_MESSAGES } from '~/constants/messages'
import { Role, TableStatus } from '~/constants/type'
import { ErrorWithStatus } from '~/models/Error'
import {
  CancelReservationReqBody,
  CreateTableReqBody,
  ReserveTableReqBody,
  UpdateStatusTableReqBody,
  UpdateTableReqBody
} from '~/models/requests/Table.request'
import { Table } from '~/models/schemas/Table.schema'
import { TableReservation } from '~/models/schemas/TableReservation.schema'
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
        token,
        location: payload.location,
        reservation: null
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
      const [table] = await Promise.all([
        databaseService.tables.findOneAndUpdate(
          {
            number
          },
          {
            $set: {
              capacity: payload.capacity,
              status: payload.status,
              token,
              location: payload.location
            },
            $currentDate: { updated_at: true }
          },
          { returnDocument: 'after' }
        ),
        databaseService.guests.updateMany(
          { table_number: number },
          {
            $set: {
              refresh_token: null,
              refresh_token_exp: null
            }
          }
        )
      ])
      return table
    }
    return await databaseService.tables.findOneAndUpdate(
      {
        number
      },
      {
        $set: {
          capacity: payload.capacity,
          status: payload.status,
          location: payload.location
        },
        $currentDate: { updated_at: true }
      },
      { returnDocument: 'after' }
    )
  }

  async deleteTable(number: number) {
    return await databaseService.tables.findOneAndDelete({ number })
  }

  async reserveTable(payload: ReserveTableReqBody) {
    const table = await databaseService.tables.findOne({ number: payload.table_number })
    if (!table) {
      throw new ErrorWithStatus({
        message: TABLES_MESSAGES.TABLE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    if (table.status !== TableStatus.Available) {
      throw new ErrorWithStatus({
        message: TABLES_MESSAGES.TABLE_NOT_AVAILABLE,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    let reservation: TableReservation | null = null
    if (payload.is_customer) {
      reservation = new TableReservation({
        customer_id: new ObjectId(payload.customer_id),
        reservation_time: payload.reservation_time,
        note: payload.note,
        is_customer: true
      })
    } else {
      reservation = new TableReservation({
        guest_id: new ObjectId(payload.guest_id),
        reservation_time: payload.reservation_time,
        note: payload.note,
        is_customer: false
      })
    }

    const result = await databaseService.tables.findOneAndUpdate(
      { number: payload.table_number, token: payload.token },
      { $set: { reservation, status: TableStatus.Reserved }, $currentDate: { updated_at: true } },
      { returnDocument: 'after' }
    )
    return result
  }

  async cancelReservation(payload: CancelReservationReqBody, account_id: string, role: string) {
    const table = await databaseService.tables.findOne({ number: payload.table_number, token: payload.token })
    if (!table) {
      throw new ErrorWithStatus({
        message: TABLES_MESSAGES.TABLE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (!table.reservation) {
      throw new ErrorWithStatus({
        message: TABLES_MESSAGES.TABLE_NOT_RESERVED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    if (
      table.reservation.is_customer &&
      table.reservation.customer_id &&
      table.reservation.customer_id.toString() !== account_id &&
      role !== Role.Employee &&
      role !== Role.Owner
    ) {
      throw new ErrorWithStatus({
        message: TABLES_MESSAGES.YOU_ARE_NOT_ALLOWED_TO_CANCEL_THIS_RESERVATION,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    if (
      !table.reservation.is_customer &&
      table.reservation.guest_id &&
      table.reservation.guest_id.toString() !== account_id &&
      role !== Role.Employee &&
      role !== Role.Owner
    ) {
      throw new ErrorWithStatus({
        message: TABLES_MESSAGES.YOU_ARE_NOT_ALLOWED_TO_CANCEL_THIS_RESERVATION,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    return await databaseService.tables.findOneAndUpdate(
      { number: payload.table_number, token: payload.token },
      { $set: { reservation: null, status: TableStatus.Available }, $currentDate: { updated_at: true } },
      { returnDocument: 'after' }
    )
  }

  async updateStatusTable(account_id: string, role: string, number: number, payload: UpdateStatusTableReqBody) {
    const table = await databaseService.tables.findOne({ number })

    if (
      table?.reservation &&
      table?.reservation?.customer_id?.toString() !== account_id &&
      table?.reservation?.guest_id?.toString() !== account_id &&
      role !== Role.Employee &&
      role !== Role.Owner
    ) {
      throw new ErrorWithStatus({
        message: TABLES_MESSAGES.YOU_ARE_NOT_ALLOWED_TO_UPDATE_THIS_TABLE_STATUS,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    if (!table) {
      throw new ErrorWithStatus({
        message: TABLES_MESSAGES.TABLE_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    if (table.status === payload.status) {
      throw new ErrorWithStatus({
        message: TABLES_MESSAGES.TABLE_STATUS_NOT_CHANGED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }
    return await databaseService.tables.findOneAndUpdate(
      { number },
      { $set: { status: payload.status, reservation: null }, $currentDate: { updated_at: true } },
      { returnDocument: 'after' }
    )
  }
}

const tablesService = new TablesService()
export default tablesService
