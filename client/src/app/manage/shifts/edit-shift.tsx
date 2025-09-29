'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UpdateShiftBody, UpdateShiftBodyType } from '@/schemaValidations/shift.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Clock, User } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { useGetShift, useUpdateShiftMutation } from '@/queries/useShift'
import { useGetAccountList } from '@/queries/useAccount'
import { toast } from 'sonner'
import { handleErrorApi } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function EditShift({
  id,
  setId
}: {
  id?: string | undefined
  setId: (value: string | undefined) => void
}) {
  const { data } = useGetShift({
    id: id as string,
    enabled: Boolean(id)
  })

  const updateShiftMutation = useUpdateShiftMutation()
  const accountsQuery = useGetAccountList()

  const accounts = accountsQuery.data?.payload.result ?? []

  const form = useForm<UpdateShiftBodyType>({
    resolver: zodResolver(UpdateShiftBody),
    defaultValues: {
      staff_id: '',
      shift_date: undefined,
      start_time: '',
      end_time: ''
    }
  })

  useEffect(() => {
    if (data) {
      const { staff_id, shift_date, start_time, end_time } = data.payload.result
      form.reset({
        staff_id,
        shift_date: new Date(shift_date),
        start_time,
        end_time
      })
    }
  }, [data, form])

  const onSubmit = async (values: UpdateShiftBodyType) => {
    if (updateShiftMutation.isPending) return

    try {
      const result = await updateShiftMutation.mutateAsync({
        id: id as string,
        ...values
      })
      toast('Success', {
        description: result.payload.message
      })
      reset()
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError
      })
    }
  }

  const reset = () => {
    setId(undefined)
    form.reset({
      staff_id: '',
      shift_date: undefined,
      start_time: '',
      end_time: ''
    })
  }

  return (
    <Dialog
      open={Boolean(id)}
      onOpenChange={(value) => {
        if (!value) {
          reset()
        }
      }}
    >
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Edit Shift</DialogTitle>
          <DialogDescription>Update shift information for employee.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form noValidate className='grid gap-4' id='edit-shift-form' onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name='staff_id'
              render={({ field }) => (
                <FormItem>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label className='text-sm font-bold flex items-center gap-2'>
                      <User className='h-4 w-4' />
                      Staff
                    </Label>
                    <div className='col-span-3 space-y-2'>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder='Select staff member' />
                        </SelectTrigger>
                        <SelectContent>
                          {accounts.map((account) => (
                            <SelectItem key={account._id} value={account._id}>
                              {account.name} - {account.phone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='shift_date'
              render={({ field }) => (
                <FormItem>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label className='text-sm font-bold'>Date</Label>
                    <div className='col-span-3 space-y-2'>
                      <Input
                        type='date'
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='start_time'
              render={({ field }) => (
                <FormItem>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label className='text-sm font-bold flex items-center gap-2'>
                      <Clock className='h-4 w-4' />
                      Start Time
                    </Label>
                    <div className='col-span-3 space-y-2'>
                      <Input type='time' {...field} />
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='end_time'
              render={({ field }) => (
                <FormItem>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label className='text-sm font-bold flex items-center gap-2'>
                      <Clock className='h-4 w-4' />
                      End Time
                    </Label>
                    <div className='col-span-3 space-y-2'>
                      <Input type='time' {...field} />
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='edit-shift-form' disabled={updateShiftMutation.isPending}>
            {updateShiftMutation.isPending ? 'Updating...' : 'Update Shift'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
