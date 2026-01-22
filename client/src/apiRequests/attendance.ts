import http from '@/lib/http'
import {
  AttendanceListResType,
  AttendanceResType,
  CheckInBodyType,
  GetAttendanceQueryType
} from '@/schemaValidations/attendance.schema'
import queryString from 'query-string'

const attendanceApiRequest = {
  checkIn: (body?: CheckInBodyType) => http.post<AttendanceResType>('/attendance/check-in', body || {}),
  checkOut: () => http.post<AttendanceResType>('/attendance/check-out', {}),
  getToday: () => http.get<AttendanceResType>('/attendance/today'),
  getMyAttendance: (query?: GetAttendanceQueryType) =>
    http.get<AttendanceListResType>(
      '/attendance/my-attendance' + (query ? `?${queryString.stringify(query)}` : '')
    ),
  getAllAttendance: (query?: GetAttendanceQueryType) =>
    http.get<AttendanceListResType>('/attendance' + (query ? `?${queryString.stringify(query)}` : ''))
}

export default attendanceApiRequest

