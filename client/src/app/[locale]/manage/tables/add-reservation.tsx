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
import { CalendarIcon, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { TimePicker } from '@/app/(public)/booking-tables/time-picker'
import { useReserveTableMutation } from '@/queries/useTable'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { CreateGuestBody, CreateGuestBodyType, GetListCustomersResType } from '@/schemaValidations/account.schema'
import { useCreateGuestMutation } from '@/queries/useAccount'
import CustomersDialog from '@/app/manage/orders/customers-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { useTranslations } from 'next-intl'

type CustomerItem = GetListCustomersResType['result'][0]

function AddReservationForm({ tableNumber, token }: { tableNumber: number; token: string }) {
  const t = useTranslations('table')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const reserveMutation = useReserveTableMutation()
  const createGuestMutation = useCreateGuestMutation()

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null)
  const [isCustomerMode, setIsCustomerMode] = useState(false)

  const form = useForm<CreateGuestBodyType & ReserveTableBodyType>({
    resolver: zodResolver(CreateGuestBody.merge(ReserveTableBody)),
    defaultValues: {
      name: '',
      phone: '',
      table_number: tableNumber,
      token: token,
      guest_id: undefined,
      customer_id: undefined,
      is_customer: false,
      reservation_time: new Date(),
      note: ''
    }
  })

  const handleCustomerSelect = (customer: CustomerItem) => {
    setSelectedCustomer(customer)
    form.setValue('name', customer.name)
    form.setValue('phone', customer.phone || '')
    form.setValue('customer_id', customer._id)
    form.setValue('is_customer', true)
  }

  const handleRemoveCustomer = () => {
    setSelectedCustomer(null)
    form.setValue('name', '')
    form.setValue('phone', '')
    form.setValue('customer_id', undefined)
    form.setValue('is_customer', false)
  }

  const handleModeChange = (checked: boolean) => {
    setIsCustomerMode(checked)
    if (!checked) {
      handleRemoveCustomer()
    }
    form.setValue('is_customer', checked)
  }

  const onSubmit = async (data: CreateGuestBodyType & ReserveTableBodyType) => {
    try {
      let guestId = data.guest_id
      let customerId = data.customer_id

      if (isCustomerMode && selectedCustomer) {
        // Reservation for existing customer
        customerId = selectedCustomer._id
      } else if (!isCustomerMode) {
        // Create new guest
        const result = await createGuestMutation.mutateAsync({
          name: data.name,
          phone: data.phone,
          table_number: data.table_number
        })
        guestId = result.payload.result._id
        customerId = undefined
      }

      const result = await reserveMutation.mutateAsync({
        guest_id: guestId,
        customer_id: customerId,
        table_number: data.table_number,
        token: data.token,
        is_customer: isCustomerMode,
        reservation_time: data.reservation_time,
        note: data.note
      })

      toast.success(result.payload.message)
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
          {/* Customer/Guest Mode Switch */}
          <div className='flex items-center space-x-2'>
            <Switch id='customer-mode' checked={isCustomerMode} onCheckedChange={handleModeChange} />
            <Label htmlFor='customer-mode' className='text-sm font-medium'>
              {t('bookForCustomer')}
            </Label>
          </div>

          {/* Customer Selection Section */}
          {isCustomerMode && (
            <div className='border rounded-lg p-4 bg-gray-50'>
              {selectedCustomer ? (
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <Avatar className='w-10 h-10'>
                      <AvatarImage src={selectedCustomer.avatar || undefined} alt={selectedCustomer.name} />
                      <AvatarFallback>
                        {selectedCustomer.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='font-medium'>{selectedCustomer.name}</p>
                      <p className='text-sm text-gray-600'>
                        {selectedCustomer.email} • {selectedCustomer.phone}
                      </p>
                    </div>
                  </div>
                  <Button type='button' variant='ghost' size='sm' onClick={handleRemoveCustomer}>
                    <X className='w-4 h-4' />
                  </Button>
                </div>
              ) : (
                <div className='text-center py-4'>
                  <p className='text-sm text-gray-600 mb-3'>{t('noCustomerSelected')}</p>
                  <CustomersDialog onChoose={handleCustomerSelect} />
                </div>
              )}
            </div>
          )}

          {/* Guest Details Section - Show only when not in customer mode or no customer selected */}
          {(!isCustomerMode || !selectedCustomer) && (
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <Label className='text-sm font-medium' htmlFor='name'>
                      {isCustomerMode ? t('customerName') : t('guestName')}
                    </Label>
                    <Input
                      id='name'
                      type='text'
                      placeholder={isCustomerMode ? t('selectCustomerAbove') : t('enterGuestName')}
                      className='mt-1.5'
                      required
                      disabled={isCustomerMode && !!selectedCustomer}
                      {...field}
                    />
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
                      {t('phoneNumber')}
                    </Label>
                    <Input
                      id='phone'
                      type='tel'
                      placeholder={isCustomerMode ? t('selectCustomerAbove') : t('enterPhoneNumber')}
                      className='mt-1.5'
                      required
                      disabled={isCustomerMode && !!selectedCustomer}
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <FormField
            control={form.control}
            name='reservation_time'
            render={({ field }) => (
              <FormItem className='flex flex-col'>
                <Label className='text-sm font-medium'>{t('reservationDateTime')}</Label>
                <div className='grid grid-cols-2 gap-2 mt-1.5'>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={'outline'}
                        className={cn('justify-start text-left font-normal', !field.value && 'text-muted-foreground')}
                      >
                        <CalendarIcon className='mr-2 h-4 w-4' />
                        {field.value ? format(field.value, 'PPP') : <span>{t('pickDate')}</span>}
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
                  {t('specialRequests')}
                </Label>
                <Textarea
                  id='note'
                  placeholder={t('anySpecialRequests')}
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
              disabled={
                createGuestMutation.isPending ||
                reserveMutation.isPending ||
                (isCustomerMode && !selectedCustomer && !form.getValues('name'))
              }
            >
              {createGuestMutation.isPending || reserveMutation.isPending ? t('addingReservation') : t('addReservation')}
            </Button>
            <Button type='button' variant='outline' className='flex-1' onClick={() => router.push('/manage/tables')}>
              {tCommon('cancel')}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}

export default function AddReservationDialog({ tableNumber, token }: { tableNumber: number; token: string }) {
  const t = useTranslations('table')
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{t('addReservation')}</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>{t('addNewReservation', { tableNumber })}</DialogTitle>
          <DialogDescription>
            {t('reservationDialogDesc')}
          </DialogDescription>
        </DialogHeader>
        <AddReservationForm tableNumber={tableNumber} token={token} />
      </DialogContent>
    </Dialog>
  )
}
