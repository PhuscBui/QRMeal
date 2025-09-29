import shiftApiRequest from '@/apiRequests/shift'
import {
  UpdateShiftBodyType,
  GetShiftsQueryType,
  UpdateShiftRequestBodyType,
  ReviewShiftRequestBodyType
} from '@/schemaValidations/shift.schema'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// Admin/Manager APIs
export const useGetShifts = (queryParams?: GetShiftsQueryType) => {
  return useQuery({
    queryKey: ['shifts', queryParams],
    queryFn: () => shiftApiRequest.list(queryParams)
  })
}

export const useGetShift = ({ id, enabled }: { id: string; enabled: boolean }) => {
  return useQuery({
    queryKey: ['shifts', id],
    queryFn: () => shiftApiRequest.getById(id),
    enabled
  })
}

export const useCreateShiftMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: shiftApiRequest.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['shifts']
      })
    }
  })
}

export const useEmployeeCreateShiftRequestMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: shiftApiRequest.createRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['my-shifts']
      })
      queryClient.invalidateQueries({
        queryKey: ['shifts', 'pending']
      })
    }
  })
}

export const useUpdateShiftMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateShiftBodyType & { id: string }) => shiftApiRequest.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['shifts']
      })
    }
  })
}

export const useDeleteShiftMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: shiftApiRequest.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['shifts']
      })
    }
  })
}

export const useGetPendingRequests = (queryParams?: GetShiftsQueryType) => {
  return useQuery({
    queryKey: ['shifts', 'pending', queryParams],
    queryFn: () => shiftApiRequest.getPendingRequests(queryParams)
  })
}

export const useReviewShiftRequestMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: ReviewShiftRequestBodyType & { id: string }) =>
      shiftApiRequest.reviewRequest(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['shifts']
      })
    }
  })
}

// Employee APIs
export const useCreateShiftRequestMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: shiftApiRequest.createRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['my-shifts']
      })
      queryClient.invalidateQueries({
        queryKey: ['shifts', 'pending']
      })
    }
  })
}

export const useUpdateShiftRequestMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: UpdateShiftRequestBodyType & { id: string }) =>
      shiftApiRequest.updateRequest(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['my-shifts']
      })
    }
  })
}

export const useCancelShiftRequestMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: shiftApiRequest.cancelRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['my-shifts']
      })
    }
  })
}

export const useGetMyShifts = (queryParams?: { from_date?: Date; to_date?: Date; status?: string }) => {
  return useQuery({
    queryKey: ['my-shifts', queryParams],
    queryFn: () => shiftApiRequest.getMyShifts(queryParams)
  })
}
