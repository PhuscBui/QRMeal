import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Error'
import Attendance from '~/models/schemas/Attendance.schema'
import databaseService from '~/services/databases.service'

interface GetAttendanceQuery {
  staff_id?: string
  fromDate?: string
  toDate?: string
  page?: string
  limit?: string
}

class AttendanceService {
  private calculateStatus(checkInTime: Date, shiftStartTime?: string): 'on_time' | 'late' {
    if (!shiftStartTime) return 'on_time'

    const [shiftHour, shiftMinute] = shiftStartTime.split(':').map(Number)
    const shiftDateTime = new Date(checkInTime)
    shiftDateTime.setHours(shiftHour, shiftMinute, 0, 0)

    // Allow 15 minutes grace period
    const gracePeriod = 15 * 60 * 1000 // 15 minutes in milliseconds
    const checkInTimeMs = checkInTime.getTime()
    const shiftTimeMs = shiftDateTime.getTime()

    if (checkInTimeMs <= shiftTimeMs + gracePeriod) {
      return 'on_time'
    }
    return 'late'
  }

  async checkIn(staffId: string, shiftId?: string) {
    const now = new Date()
    
    // Check if already checked in today
    // Use UTC to avoid timezone issues
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))
    const todayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999))

    const existingAttendance = await databaseService.attendances.findOne({
      staff_id: new ObjectId(staffId),
      check_in: {
        $gte: todayStart,
        $lte: todayEnd
      },
      $or: [
        { check_out: { $exists: false } },
        { check_out: null }
      ]
    })

    if (existingAttendance) {
      throw new ErrorWithStatus({
        message: 'Bạn đã chấm công vào hôm nay. Vui lòng chấm công ra trước.',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Validate: Check if staff has an approved shift for today
    let shift: { _id: ObjectId; start_time: string; shift_date: Date } | null = null

    if (shiftId) {
      // If shiftId is provided, validate it
      const foundShift = await databaseService.shifts.findOne({ 
        _id: new ObjectId(shiftId),
        staff_id: new ObjectId(staffId),
        status: 'Approved'
      })
      
      if (!foundShift) {
        throw new ErrorWithStatus({
          message: 'Ca làm việc không tồn tại hoặc chưa được duyệt.',
          status: HTTP_STATUS.BAD_REQUEST
        })
      }

      // Check if shift is for today
      const shiftDate = new Date(foundShift.shift_date)
      const shiftDateStart = new Date(Date.UTC(shiftDate.getUTCFullYear(), shiftDate.getUTCMonth(), shiftDate.getUTCDate(), 0, 0, 0, 0))
      const shiftDateEnd = new Date(Date.UTC(shiftDate.getUTCFullYear(), shiftDate.getUTCMonth(), shiftDate.getUTCDate(), 23, 59, 59, 999))
      
      if (now < shiftDateStart || now > shiftDateEnd) {
        throw new ErrorWithStatus({
          message: 'Ca làm việc không phải của ngày hôm nay.',
          status: HTTP_STATUS.BAD_REQUEST
        })
      }

      shift = {
        _id: foundShift._id,
        start_time: foundShift.start_time,
        shift_date: foundShift.shift_date
      }
    } else {
      // If shiftId is not provided, find today's approved shift
      const foundShift = await databaseService.shifts.findOne({
        staff_id: new ObjectId(staffId),
        shift_date: {
          $gte: todayStart,
          $lte: todayEnd
        },
        status: 'Approved'
      })

      if (!foundShift) {
        throw new ErrorWithStatus({
          message: 'Bạn không có ca làm việc được duyệt trong ngày hôm nay. Vui lòng liên hệ quản lý để được phân ca.',
          status: HTTP_STATUS.BAD_REQUEST
        })
      }

      shift = {
        _id: foundShift._id,
        start_time: foundShift.start_time,
        shift_date: foundShift.shift_date
      }
    }

    // Calculate status based on shift start time
    const status = this.calculateStatus(now, shift.start_time)

    const attendance = new Attendance({
      staff_id: new ObjectId(staffId),
      shift_id: shift._id,
      check_in: now,
      status
    })

    const result = await databaseService.attendances.insertOne(attendance)
    return await databaseService.attendances.findOne({ _id: result.insertedId })
  }

  async checkOut(staffId: string) {
    const now = new Date()
    
    // Find the most recent check-in without check-out
    // This approach is more reliable than filtering by date range
    const attendance = await databaseService.attendances.findOne(
      {
        staff_id: new ObjectId(staffId),
        check_in: { $exists: true },
        $or: [
          { check_out: { $exists: false } },
          { check_out: null }
        ]
      },
      {
        sort: { check_in: -1 } // Get the most recent one
      }
    )

    if (!attendance) {
      throw new ErrorWithStatus({
        message: 'Bạn chưa chấm công vào hoặc đã chấm công ra rồi.',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // Verify that check-in exists
    if (!attendance.check_in) {
      throw new ErrorWithStatus({
        message: 'Dữ liệu chấm công không hợp lệ.',
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    await databaseService.attendances.updateOne(
      { _id: attendance._id },
      {
        $set: {
          check_out: now,
          updated_at: now
        }
      }
    )

    return await databaseService.attendances.findOne({ _id: attendance._id })
  }

  async getMyAttendance(staffId: string, query: GetAttendanceQuery) {
    const limit = typeof query.limit === 'string' ? Number(query.limit) : typeof query.limit === 'number' ? query.limit : 10
    const page = typeof query.page === 'string' ? Number(query.page) : typeof query.page === 'number' ? query.page : 1
    const skip = (page - 1) * limit

    const matchCondition: Record<string, unknown> = {
      staff_id: new ObjectId(staffId)
    }

    if (query.fromDate || query.toDate) {
      matchCondition.check_in = {}
      if (query.fromDate) {
        matchCondition.check_in = { ...matchCondition.check_in, $gte: new Date(query.fromDate) }
      }
      if (query.toDate) {
        matchCondition.check_in = { ...matchCondition.check_in, $lte: new Date(query.toDate) }
      }
    }

    const pipeline = [
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
        $lookup: {
          from: 'shifts',
          localField: 'shift_id',
          foreignField: '_id',
          as: 'shift_info'
        }
      },
      {
        $addFields: {
          staff: { $arrayElemAt: ['$staff_info', 0] },
          shift: { $arrayElemAt: ['$shift_info', 0] }
        }
      },
      {
        $project: {
          _id: 1,
          check_in: 1,
          check_out: 1,
          status: 1,
          notes: 1,
          created_at: 1,
          'staff._id': 1,
          'staff.name': 1,
          'staff.email': 1,
          'shift._id': 1,
          'shift.shift_date': 1,
          'shift.start_time': 1,
          'shift.end_time': 1
        }
      },
      { $sort: { check_in: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]

    const [attendances, total] = await Promise.all([
      databaseService.attendances.aggregate(pipeline).toArray(),
      databaseService.attendances.countDocuments(matchCondition)
    ])

    return { attendances, total }
  }

  async getAllAttendance(query: GetAttendanceQuery) {
    const limit = typeof query.limit === 'string' ? Number(query.limit) : typeof query.limit === 'number' ? query.limit : 10
    const page = typeof query.page === 'string' ? Number(query.page) : typeof query.page === 'number' ? query.page : 1
    const skip = (page - 1) * limit

    const matchCondition: Record<string, unknown> = {}

    if (query.staff_id) {
      matchCondition.staff_id = new ObjectId(query.staff_id)
    }

    if (query.fromDate || query.toDate) {
      matchCondition.check_in = {}
      if (query.fromDate) {
        matchCondition.check_in = { ...matchCondition.check_in, $gte: new Date(query.fromDate) }
      }
      if (query.toDate) {
        matchCondition.check_in = { ...matchCondition.check_in, $lte: new Date(query.toDate) }
      }
    }

    const pipeline = [
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
        $lookup: {
          from: 'shifts',
          localField: 'shift_id',
          foreignField: '_id',
          as: 'shift_info'
        }
      },
      {
        $addFields: {
          staff: { $arrayElemAt: ['$staff_info', 0] },
          shift: { $arrayElemAt: ['$shift_info', 0] }
        }
      },
      {
        $project: {
          _id: 1,
          check_in: 1,
          check_out: 1,
          status: 1,
          notes: 1,
          created_at: 1,
          'staff._id': 1,
          'staff.name': 1,
          'staff.email': 1,
          'shift._id': 1,
          'shift.shift_date': 1,
          'shift.start_time': 1,
          'shift.end_time': 1
        }
      },
      { $sort: { check_in: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]

    const [attendances, total] = await Promise.all([
      databaseService.attendances.aggregate(pipeline).toArray(),
      databaseService.attendances.countDocuments(matchCondition)
    ])

    return { attendances, total }
  }

  async getTodayAttendance(staffId: string) {
    const now = new Date()
    // Use UTC to avoid timezone issues
    const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0))
    const todayEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999))

    const attendance = await databaseService.attendances.findOne({
      staff_id: new ObjectId(staffId),
      check_in: {
        $gte: todayStart,
        $lte: todayEnd
      }
    })

    return attendance
  }
}

const attendanceService = new AttendanceService()
export default attendanceService

