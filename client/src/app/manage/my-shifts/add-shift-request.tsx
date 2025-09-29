'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CreateShiftRequestBody, CreateShiftRequestBodyType } from '@/schemaValidations/shift.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusCircle, Clock, Calendar } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { useCreateShiftRequestMutation } from '@/queries/useShift'
import { toast } from 'sonner'
import { handleErrorApi } from '@/lib/utils'

export default function AddShiftRequest() {
  const [open, setOpen] = useState(false)
  const createShiftRequestMutation = useCreateShiftRequestMutation()

  const form = useForm<CreateShiftRequestBodyType>({
    resolver: zodResolver(CreateShiftRequestBody),
    defaultValues: {
      shift_date: new Date(),
      start_time: '09:00',
      end_time: '17:00',
      reason: ''
    }
  })

  const reset = () => {
    form.reset({
      shift_date: new Date(),
      start_time: '09:00',
      end_time: '17:00',
      reason: ''
    })
  }

  const onSubmit = async (values: CreateShiftRequestBodyType) => {
    if (createShiftRequestMutation.isPending) return

    try {
      const result = await createShiftRequestMutation.mutateAsync(values)
      toast('Success', {
        description: result.payload.message
      })
      reset()
      setOpen(false)
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError
      })
    }
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button size='lg' className='gap-2'>
          <PlusCircle className='h-3.5 w-3.5' />
          <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>Request Shift</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Request New Shift</DialogTitle>
          <DialogDescription>
            Submit a request for a new work shift. Your manager will review and approve it.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className='grid gap-4'
            id='add-shift-request-form'
            onSubmit={form.handleSubmit(onSubmit)}
            onReset={reset}
          >
            <FormField
              control={form.control}
              name='shift_date'
              render={({ field }) => (
                <FormItem>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label className='text-sm font-bold flex items-center gap-2'>
                      <Calendar className='h-4 w-4' />
                      Date
                    </Label>
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

            <FormField
              control={form.control}
              name='reason'
              render={({ field }) => (
                <FormItem>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label className='text-sm font-bold'>Reason</Label>
                    <div className='col-span-3 space-y-2'>
                      <Textarea
                        placeholder='Explain why you need this shift (optional)'
                        className='resize-none'
                        {...field}
                      />
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='add-shift-request-form' disabled={createShiftRequestMutation.isPending}>
            {createShiftRequestMutation.isPending ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
