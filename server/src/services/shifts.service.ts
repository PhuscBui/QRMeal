import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { SHIFTS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import {
  CreateShiftReqBody,
  UpdateShiftReqBody,
  GetShiftsQuery,
  CreateShiftRequestReqBody,
  UpdateShiftRequestReqBody,
  ReviewShiftRequestReqBody
} from '~/models/requests/Shift.request'
import Shift from '~/models/schemas/Shift.schema'
import databaseService from '~/services/databases.service'

class ShiftsService {
  private calculateTotalHours(startTime: string, endTime: string): number {
    const [startHour, startMinute] = startTime.split(':').map(Number)
    const [endHour, endMinute] = endTime.split(':').map(Number)

    const startMinutes = startHour * 60 + startMinute
    let endMinutes = endHour * 60 + endMinute

    // Handle overnight shifts
    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60 // Add 24 hours
    }

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
      status: { $in: ['Pending', 'Approved'] }, // Only check active shifts
      $or: [
        {
          $and: [{ start_time: { $lt: endTime } }, { end_time: { $gt: startTime } }]
        }
      ]
    }

    if (excludeShiftId) {
      query._id = { $ne: new ObjectId(excludeShiftId) }
    }

    const existingShift = await databaseService.shifts.findOne(query)
    return Boolean(existingShift)
  }

  async createShift(account_id: string, payload: CreateShiftReqBody) {
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
        status: 'Approved',
        total_hours: totalHours,
        reviewed_by: new ObjectId(account_id),
        reviewed_at: new Date()
      })
    )

    return await this.getShiftById(result.insertedId.toString())
  }

  async createShiftRequest(staff_id: string, payload: CreateShiftRequestReqBody) {
    const shiftDate = new Date(payload.shift_date)

    // Check for shift conflicts
    const hasConflict = await this.checkShiftConflict(staff_id, shiftDate, payload.start_time, payload.end_time)
    if (hasConflict) {
      throw new ErrorWithStatus({
        message: SHIFTS_MESSAGES.SHIFT_TIME_CONFLICT,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const totalHours = this.calculateTotalHours(payload.start_time, payload.end_time)

    const result = await databaseService.shifts.insertOne(
      new Shift({
        staff_id: new ObjectId(staff_id),
        shift_date: shiftDate,
        start_time: payload.start_time,
        end_time: payload.end_time,
        status: 'Pending',
        total_hours: totalHours,
        reason: payload.reason
      })
    )

    return await this.getShiftById(result.insertedId.toString())
  }

  async getShifts(query: GetShiftsQuery) {
    const page = parseInt(query.page || '1')
    const limit = parseInt(query.limit || '10')
    const skip = (page - 1) * limit

    const matchCondition: {
      staff_id?: ObjectId
      shift_date?: { $gte?: Date; $lte?: Date }
      status?: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled'
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

    if (query.status && ['Pending', 'Approved', 'Rejected', 'Cancelled'].includes(query.status)) {
      matchCondition.status = query.status as 'Pending' | 'Approved' | 'Rejected' | 'Cancelled'
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
          $lookup: {
            from: 'accounts',
            localField: 'reviewed_by',
            foreignField: '_id',
            as: 'reviewer_info'
          }
        },
        {
          $unwind: {
            path: '$reviewer_info',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            staff_id: 1,
            shift_date: 1,
            start_time: 1,
            end_time: 1,
            total_hours: 1,
            status: 1,
            reason: 1,
            review_note: 1,
            reviewed_at: 1,
            created_at: 1,
            updated_at: 1,
            'staff_info.name': 1,
            'staff_info.email': 1,
            'staff_info.phone': 1,
            'reviewer_info.name': 1
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
          $lookup: {
            from: 'accounts',
            localField: 'reviewed_by',
            foreignField: '_id',
            as: 'reviewer_info'
          }
        },
        {
          $unwind: {
            path: '$reviewer_info',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            staff_id: 1,
            shift_date: 1,
            start_time: 1,
            end_time: 1,
            total_hours: 1,
            status: 1,
            reason: 1,
            review_note: 1,
            reviewed_at: 1,
            created_at: 1,
            updated_at: 1,
            'staff_info.name': 1,
            'staff_info.email': 1,
            'staff_info.phone': 1,
            'reviewer_info.name': 1
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

  async updateShiftRequest(id: string, accountId: string, payload: UpdateShiftRequestReqBody) {
    const existingShift = await databaseService.shifts.findOne({
      _id: new ObjectId(id),
      staff_id: new ObjectId(accountId) // Ensure user can only update their own requests
    })

    if (!existingShift) {
      throw new ErrorWithStatus({
        message: SHIFTS_MESSAGES.SHIFT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (existingShift.status !== 'Pending') {
      throw new ErrorWithStatus({
        message: SHIFTS_MESSAGES.CANNOT_UPDATE_NON_PENDING_SHIFT,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const updateData: Partial<Shift> = {}

    if (payload.shift_date) {
      updateData.shift_date = new Date(payload.shift_date)
    }
    if (payload.start_time) {
      updateData.start_time = payload.start_time
    }
    if (payload.end_time) {
      updateData.end_time = payload.end_time
    }
    if (payload.reason !== undefined) {
      updateData.reason = payload.reason
    }

    // Recalculate total hours if time is updated
    const startTime = updateData.start_time || existingShift.start_time
    const endTime = updateData.end_time || existingShift.end_time
    const shiftDate = updateData.shift_date || existingShift.shift_date

    updateData.total_hours = this.calculateTotalHours(startTime, endTime)

    // Check for conflicts
    const hasConflict = await this.checkShiftConflict(accountId, shiftDate, startTime, endTime, id)

    if (hasConflict) {
      throw new ErrorWithStatus({
        message: SHIFTS_MESSAGES.SHIFT_TIME_CONFLICT,
        status: HTTP_STATUS.BAD_REQUEST
      })
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

  async reviewShiftRequest(id: string, accountId: string, payload: ReviewShiftRequestReqBody) {
    const existingShift = await databaseService.shifts.findOne({ _id: new ObjectId(id) })
    if (!existingShift) {
      throw new ErrorWithStatus({
        message: SHIFTS_MESSAGES.SHIFT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (existingShift.status !== 'Pending') {
      throw new ErrorWithStatus({
        message: SHIFTS_MESSAGES.SHIFT_NOT_PENDING,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // If approving, check for conflicts again
    if (payload.status === 'Approved') {
      const hasConflict = await this.checkShiftConflict(
        existingShift.staff_id.toString(),
        existingShift.shift_date,
        existingShift.start_time,
        existingShift.end_time,
        id
      )

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
        $set: {
          status: payload.status,
          review_note: payload.review_note,
          reviewed_by: new ObjectId(accountId),
          reviewed_at: new Date()
        },
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

  async cancelShiftRequest(id: string, accountId: string) {
    const existingShift = await databaseService.shifts.findOne({
      _id: new ObjectId(id),
      staff_id: new ObjectId(accountId) // Ensure user can only cancel their own requests
    })

    if (!existingShift) {
      throw new ErrorWithStatus({
        message: SHIFTS_MESSAGES.SHIFT_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (existingShift.status !== 'Pending') {
      throw new ErrorWithStatus({
        message: SHIFTS_MESSAGES.CANNOT_CANCEL_NON_PENDING_SHIFT,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const result = await databaseService.shifts.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: 'Cancelled',
          cancelled_by: new ObjectId(accountId),
          cancelled_at: new Date()
        },
        $currentDate: { updated_at: true }
      },
      { returnDocument: 'after' }
    )

    return result
  }

  async getShiftsByStaff(staffId: string, fromDate?: string, toDate?: string, status?: string) {
    const matchCondition: {
      staff_id: ObjectId
      shift_date?: { $gte?: Date; $lte?: Date }
      status?: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled'
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

    if (status && ['Pending', 'Approved', 'Rejected', 'Cancelled'].includes(status)) {
      matchCondition.status = status as 'Pending' | 'Approved' | 'Rejected' | 'Cancelled'
    }

    const shifts = await databaseService.shifts
      .aggregate([
        { $match: matchCondition },
        {
          $lookup: {
            from: 'accounts',
            localField: 'reviewed_by',
            foreignField: '_id',
            as: 'reviewer_info'
          }
        },
        {
          $unwind: {
            path: '$reviewer_info',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            shift_date: 1,
            start_time: 1,
            end_time: 1,
            total_hours: 1,
            status: 1,
            reason: 1,
            review_note: 1,
            reviewed_at: 1,
            created_at: 1,
            updated_at: 1,
            'reviewer_info.name': 1
          }
        },
        { $sort: { shift_date: -1, start_time: 1 } }
      ])
      .toArray()

    const approvedShifts = shifts.filter((shift) => shift.status === 'Approved')
    const totalHours = approvedShifts.reduce((sum, shift) => sum + (shift.total_hours || 0), 0)

    return {
      shifts,
      summary: {
        total_shifts: shifts.length,
        approved_shifts: approvedShifts.length,
        pending_shifts: shifts.filter((shift) => shift.status === 'Pending').length,
        rejected_shifts: shifts.filter((shift) => shift.status === 'Rejected').length,
        cancelled_shifts: shifts.filter((shift) => shift.status === 'Cancelled').length,
        total_hours: totalHours
      }
    }
  }
}

const shiftsService = new ShiftsService()
export default shiftsService
