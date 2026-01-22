import attendanceApiRequest from '@/apiRequests/attendance'
import { CheckInBodyType, GetAttendanceQueryType } from '@/schemaValidations/attendance.schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const useTodayAttendanceQuery = (enabled: boolean) => {
  return useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: () => attendanceApiRequest.getToday(),
    enabled
  })
}

export const useMyAttendanceQuery = (enabled: boolean, query?: GetAttendanceQueryType) => {
  return useQuery({
    queryKey: ['attendance', 'my', query],
    queryFn: () => attendanceApiRequest.getMyAttendance(query),
    enabled
  })
}

export const useAllAttendanceQuery = (enabled: boolean, query?: GetAttendanceQueryType) => {
  return useQuery({
    queryKey: ['attendance', 'all', query],
    queryFn: () => attendanceApiRequest.getAllAttendance(query),
    enabled
  })
}

export const useCheckInMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body?: CheckInBodyType) => attendanceApiRequest.checkIn(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
    }
  })
}

export const useCheckOutMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => attendanceApiRequest.checkOut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
    }
  })
}

