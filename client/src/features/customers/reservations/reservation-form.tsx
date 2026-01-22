'use client'

import { useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn, handleErrorApi } from '@/lib/utils'
import { ReserveTableBody, type ReserveTableBodyType } from '@/schemaValidations/table.schema'
import { useReserveTableMutation, useTableListQuery } from '@/queries/useTable'
import { useAccountMe } from '@/queries/useAccount'
import { TableStatus } from '@/constants/type'
import { TimePicker } from '@/features/guests/booking-tables/time-picker'

type FormValues = Pick<ReserveTableBodyType, 'table_number' | 'reservation_time' | 'note'>

export default function CustomerReservationForm({ setIsReserveOpen }: { setIsReserveOpen: (open: boolean) => void }) {
  const { data: tablesData, isLoading: tablesLoading } = useTableListQuery()
  const { data: accountData } = useAccountMe()
  const reserveMutation = useReserveTableMutation()

  const tables = useMemo(
    () => tablesData?.payload.result.filter((table) => table.status === TableStatus.Available) ?? [],
    [tablesData]
  )

  const [selectedTableNumber, setSelectedTableNumber] = useState<number | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(ReserveTableBody.pick({ table_number: true, reservation_time: true, note: true })),
    defaultValues: {
      table_number: undefined as unknown as number,
      reservation_time: new Date(),
      note: ''
    }
  })

  const selectedTable = useMemo(
    () => tables.find((t) => t.number === selectedTableNumber) || null,
    [tables, selectedTableNumber]
  )

  const onSubmit = async (data: FormValues) => {
    try {
      const user = accountData?.payload.result
      if (!user?._id) {
        toast.error('You need to be logged in to book a table')
        return
      }

      const table = tables.find((t) => t.number === data.table_number)
      if (!table) {
        toast.error('Please select a valid table')
        return
      }

      const result = await reserveMutation.mutateAsync({
        table_number: data.table_number,
        token: table.token,
        customer_id: user._id,
        is_customer: true,
        reservation_time: data.reservation_time,
        note: data.note
      })

      toast.success(result.payload.message)
      setIsReserveOpen(false)
    } catch (error) {
      handleErrorApi({ error, setError: form.setError })
    }
  }

  return (
    <Form {...form}>
      <form className='space-y-4' noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <div className='grid gap-4'>
          <FormField
            control={form.control}
            name='table_number'
            render={({ field }) => (
              <FormItem>
                <Label className='text-sm font-medium' htmlFor='table_number'>
                  Select Table
                </Label>
                <Select
                  onValueChange={(value) => {
                    const num = Number(value)
                    field.onChange(num)
                    setSelectedTableNumber(num)
                  }}
                  value={field.value ? String(field.value) : undefined}
                  disabled={tablesLoading}
                >
                  <SelectTrigger id='table_number' className='mt-1.5'>
                    <SelectValue placeholder={tablesLoading ? 'Loading tables...' : 'Choose a table'} />
                  </SelectTrigger>
                  <SelectContent>
                    {tables.map((t) => (
                      <SelectItem key={t._id} value={String(t.number)}>
                        Table {t.number} • {t.location} • {t.capacity} ppl
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedTable && (
            <div className='text-sm text-muted-foreground -mt-2'>
              Capacity: {selectedTable.capacity} • Location: {selectedTable.location}
            </div>
          )}

          <FormField
            control={form.control}
            name='reservation_time'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <Label className='text-sm font-medium'>Reservation Date & Time</Label>
                <div className='grid md:grid-cols-2 gap-2 mt-1.5 w-full'>
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
                      />
                    </PopoverContent>
                  </Popover>

                  <div className='flex items-center'>
                    <TimePicker setDate={(date) => field.onChange(date)} date={field.value} />
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
            <Button type='submit' className='flex-1' disabled={reserveMutation.isPending}>
              {reserveMutation.isPending ? 'Booking…' : 'Book Table'}
            </Button>
            <Button type='button' variant='outline' className='flex-1' onClick={() => setIsReserveOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
