'use client'

import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { handleErrorApi } from '@/lib/utils'
import { ReserveTableBody, type ReserveTableBodyType } from '@/schemaValidations/table.schema'
import { CalendarIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { TimePickerDemo } from '@/app/(public)/booking-tables/time-picker'
import { useReserveTableMutation } from '@/queries/useTable'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { CreateGuestBody, CreateGuestBodyType } from '@/schemaValidations/account.schema'
import { useCreateGuestMutation } from '@/queries/useAccount'

function AddReservationForm({ tableNumber, token }: { tableNumber: number; token: string }) {
  const router = useRouter()
  const reserveMutation = useReserveTableMutation()
  const createGuestMutation = useCreateGuestMutation()

  const form = useForm<CreateGuestBodyType & ReserveTableBodyType>({
    resolver: zodResolver(CreateGuestBody.merge(ReserveTableBody)),
    defaultValues: {
      name: '',
      phone: '',
      table_number: tableNumber,
      token: token,
      guest_id: '',
      reservation_time: new Date(),
      note: ''
    }
  })

  const onSubmit = async (data: CreateGuestBodyType & ReserveTableBodyType) => {
    try {
      const result = await createGuestMutation.mutateAsync({
        name: data.name,
        phone: data.phone,
        table_number: data.table_number
      })

      const guest = result.payload.result

      await reserveMutation.mutateAsync({
        guest_id: guest._id,
        table_number: data.table_number,
        token: data.token,
        reservation_time: data.reservation_time,
        note: data.note
      })

      toast.success('Reservation added successfully!')
      router.push('/manage/tables')
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError
      })
    }
  }

  return (
    <Form {...form}>
      <form className='space-y-4' noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <div className='grid gap-4'>
          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <Label className='text-sm font-medium' htmlFor='name'>
                    Guest Name
                  </Label>
                  <Input id='name' type='text' placeholder='Enter guest name' className='mt-1.5' required {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='phone'
              render={({ field }) => (
                <FormItem>
                  <Label className='text-sm font-medium' htmlFor='phone'>
                    Phone Number
                  </Label>
                  <Input
                    id='phone'
                    type='tel'
                    placeholder='Enter phone number'
                    className='mt-1.5'
                    required
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='reservation_time'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <Label className='text-sm font-medium'>Reservation Date & Time</Label>
                <div className='grid grid-cols-2 gap-2 mt-1.5'>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={'outline'}
                        className={cn('justify-start text-left font-normal', !field.value && 'text-muted-foreground')}
                      >
                        <CalendarIcon className='mr-2 h-4 w-4' />
                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) {
                            const currentDate = new Date(field.value)
                            date.setHours(currentDate.getHours())
                            date.setMinutes(currentDate.getMinutes())
                            field.onChange(date)
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <div className='flex items-center'>
                    <TimePickerDemo setDate={(date) => field.onChange(date)} date={field.value} />
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='note'
            render={({ field }) => (
              <FormItem>
                <Label className='text-sm font-medium' htmlFor='note'>
                  Special Requests (Optional)
                </Label>
                <Textarea
                  id='note'
                  placeholder='Any special requests or notes?'
                  className='mt-1.5 resize-none'
                  rows={3}
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <div className='flex gap-3 pt-2'>
            <Button
              type='submit'
              className='flex-1'
              disabled={createGuestMutation.isPending || reserveMutation.isPending}
            >
              {createGuestMutation.isPending || reserveMutation.isPending ? 'Adding Reservation...' : 'Add Reservation'}
            </Button>
            <Button type='button' variant='outline' className='flex-1' onClick={() => router.push('/manage/tables')}>
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}

export default function AddReservationDialog({ tableNumber, token }: { tableNumber: number; token: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Reservation</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Add New Reservation for Table {tableNumber}</DialogTitle>
          <DialogDescription>Fill in the guest details and reservation information.</DialogDescription>
        </DialogHeader>
        <AddReservationForm tableNumber={tableNumber} token={token} />
      </DialogContent>
    </Dialog>
  )
}
