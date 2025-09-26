import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { SHIFTS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { CreateShiftReqBody, UpdateShiftReqBody, GetShiftsQuery } from '~/models/requests/Shift.request'
import Shift from '~/models/schemas/Shift.schema'
import databaseService from '~/services/databases.service'

class ShiftsService {
  private calculateTotalHours(startTime: string, endTime: string): number {
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)

    const startMinutes = startHour * 60 + startMinute
    const endMinutes = endHour * 60 + endMinute

    return (endMinutes - startMinutes) / 60
  }

  async checkShiftConflict(
    staffId: string,
    shiftDate: Date,
    startTime: string,
    endTime: string,
    excludeShiftId?: string
  ) {
    const query: Record<string, unknown> = {
      staff_id: new ObjectId(staffId),
      shift_date: shiftDate,
      $or: [{ start_time: { $lt: endTime }, end_time: { $gt: startTime } }]
    }

    if (excludeShiftId) {
      query._id = { $ne: new ObjectId(excludeShiftId) }
    }

    const existingShift = await databaseService.shifts.findOne(query)
    return Boolean(existingShift)
  }

  async createShift(payload: CreateShiftReqBody) {
    const shiftDate = new Date(payload.shift_date)

    // Check for shift conflicts
    const hasConflict = await this.checkShiftConflict(payload.staff_id, shiftDate, payload.start_time, payload.end_time)

    if (hasConflict) {
      throw new ErrorWithStatus({
        message: SHIFTS_MESSAGES.SHIFT_TIME_CONFLICT,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const totalHours = this.calculateTotalHours(payload.start_time, payload.end_time)

    const result = await databaseService.shifts.insertOne(
      new Shift({
        staff_id: new ObjectId(payload.staff_id),
        shift_date: shiftDate,
        start_time: payload.start_time,
        end_time: payload.end_time,
        total_hours: totalHours
      })
    )

    return await databaseService.shifts.findOne({ _id: result.insertedId })
  }

  async getShifts(query: GetShiftsQuery) {
    const page = parseInt(query.page || '1')
    const limit = parseInt(query.limit || '10')
    const skip = (page - 1) * limit

    const matchCondition: {
      staff_id?: ObjectId
      shift_date?: { $gte?: Date; $lte?: Date }
    } = {}

    if (query.staff_id) {
      matchCondition.staff_id = new ObjectId(query.staff_id)
    }

    if (query.from_date || query.to_date) {
      matchCondition.shift_date = {}
      if (query.from_date) {
        matchCondition.shift_date.$gte = new Date(query.from_date)
      }
      if (query.to_date) {
        matchCondition.shift_date.$lte = new Date(query.to_date)
      }
    }

    const shifts = await databaseService.shifts
      .aggregate([
        { $match: matchCondition },
        {
          $lookup: {
            from: 'accounts',
            localField: 'staff_id',
            foreignField: '_id',
            as: 'staff_info'
          }
        },
        {
          $unwind: '$staff_info'
        },
        {
          $project: {
            _id: 1,
            staff_id: 1,
            shift_date: 1,
            start_time: 1,
            end_time: 1,
            total_hours: 1,
            'staff_info.name': 1,
            'staff_info.email': 1,
            'staff_info.phone': 1
          }
        },
        { $sort: { shift_date: -1, start_time: 1 } },
        { $skip: skip },
        { $limit: limit }
      ])
      .toArray()

    const total = await databaseService.shifts.countDocuments(matchCondition)

    return {
      shifts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  async getShiftById(id: string) {
    const shift = await databaseService.shifts
      .aggregate([
        { $match: { _id: new ObjectId(id) } },
        {
          $lookup: {
            from: 'accounts',
            localField: 'staff_id',
            foreignField: '_id',
            as: 'staff_info'
          }
        },
        {
          $unwind: '$staff_info'
        },
        {
          $project: {
            _id: 1,
            staff_id: 1,
            shift_date: 1,
            start_time: 1,
            end_time: 1,
            total_hours: 1,
            'staff_info.name': 1,
            'staff_info.email': 1,
            'staff_info.phone': 1
          }
        }
      ])
      .toArray()

    return shift[0] || null
  }

  async updateShift(id: string, payload: UpdateShiftReqBody) {
    const existingShift = await databaseService.shifts.findOne({ _id: new ObjectId(id) })
    if (!existingShift) {
      throw new ErrorWithStatus({
        message: SHIFTS_MESSAGES.SHIFT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const updateData: Partial<Shift> = {}

    if (payload.staff_id) {
      updateData.staff_id = new ObjectId(payload.staff_id)
    }
    if (payload.shift_date) {
      updateData.shift_date = new Date(payload.shift_date)
    }
    if (payload.start_time) {
      updateData.start_time = payload.start_time
    }
    if (payload.end_time) {
      updateData.end_time = payload.end_time
    }

    // Recalculate total hours if time is updated
    const startTime = updateData.start_time || existingShift.start_time
    const endTime = updateData.end_time || existingShift.end_time
    updateData.total_hours = this.calculateTotalHours(startTime, endTime)

    // Check for conflicts if staff_id, shift_date, or times are updated
    if (payload.staff_id || payload.shift_date || payload.start_time || payload.end_time) {
      const staffId = updateData.staff_id?.toString() || existingShift.staff_id.toString()
      const shiftDate = updateData.shift_date || existingShift.shift_date

      const hasConflict = await this.checkShiftConflict(staffId, shiftDate, startTime, endTime, id)

      if (hasConflict) {
        throw new ErrorWithStatus({
          message: SHIFTS_MESSAGES.SHIFT_TIME_CONFLICT,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
    }

    const result = await databaseService.shifts.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: updateData,
        $currentDate: { updated_at: true }
      },
      { returnDocument: 'after' }
    )

    return result
  }

  async deleteShift(id: string) {
    const shift = await databaseService.shifts.findOne({ _id: new ObjectId(id) })
    if (!shift) {
      throw new ErrorWithStatus({
        message: SHIFTS_MESSAGES.SHIFT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    await databaseService.shifts.deleteOne({ _id: new ObjectId(id) })
    return shift
  }

  async getShiftsByStaff(staffId: string, fromDate?: string, toDate?: string) {
    const matchCondition: {
      staff_id: ObjectId
      shift_date?: { $gte?: Date; $lte?: Date }
    } = { staff_id: new ObjectId(staffId) }

    if (fromDate || toDate) {
      matchCondition.shift_date = {}
      if (fromDate) {
        matchCondition.shift_date.$gte = new Date(fromDate)
      }
      if (toDate) {
        matchCondition.shift_date.$lte = new Date(toDate)
      }
    }

    const shifts = await databaseService.shifts.find(matchCondition).sort({ shift_date: -1, start_time: 1 }).toArray()

    const totalHours = shifts.reduce((sum, shift) => sum + (shift.total_hours || 0), 0)

    return {
      shifts,
      summary: {
        total_shifts: shifts.length,
        total_hours: totalHours
      }
    }
  }
}

const shiftsService = new ShiftsService()
export default shiftsService
