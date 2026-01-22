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
import { CreateShiftBody, CreateShiftBodyType } from '@/schemaValidations/shift.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusCircle, Clock, User } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { useCreateShiftMutation } from '@/queries/useShift'
import { useGetAccountList } from '@/queries/useAccount'
import { toast } from 'sonner'
import { handleErrorApi } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslations } from 'next-intl'

export default function AddShift() {
  const t = useTranslations('shift')
  const tCommon = useTranslations('common')
  const [open, setOpen] = useState(false)
  const createShiftMutation = useCreateShiftMutation()
  const accountsQuery = useGetAccountList()

  const accounts = accountsQuery.data?.payload.result ?? []

  const form = useForm<CreateShiftBodyType>({
    resolver: zodResolver(CreateShiftBody),
    defaultValues: {
      staff_id: '',
      shift_date: new Date(),
      start_time: '09:00',
      end_time: '17:00'
    }
  })

  const reset = () => {
    form.reset({
      staff_id: '',
      shift_date: new Date(),
      start_time: '09:00',
      end_time: '17:00'
    })
  }

  const onSubmit = async (values: CreateShiftBodyType) => {
    if (createShiftMutation.isPending) return

    try {
      const result = await createShiftMutation.mutateAsync(values)
      toast(tCommon('success'), {
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
          <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>{t('addShift')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>{t('createNewShift')}</DialogTitle>
          <DialogDescription>{t('createNewShiftDesc')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className='grid gap-4'
            id='add-shift-form'
            onSubmit={form.handleSubmit(onSubmit)}
            onReset={reset}
          >
            <FormField
              control={form.control}
              name='staff_id'
              render={({ field }) => (
                <FormItem>
                    <div className='grid grid-cols-4 items-center gap-4'>
                      <Label className='text-sm font-bold flex items-center gap-2'>
                        <User className='h-4 w-4' />
                        {t('staff')}
                      </Label>
                      <div className='col-span-3 space-y-2'>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectStaffMember')} />
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
              render={({ field }) => {
                // Ensure value is always a string (never undefined)
                const dateValue = field.value
                  ? (() => {
                      const date = field.value instanceof Date ? field.value : new Date(field.value)
                      return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : ''
                    })()
                  : ''
                
                return (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center gap-4'>
                      <Label className='text-sm font-bold'>{t('date')}</Label>
                      <div className='col-span-3 space-y-2'>
                        <Input
                          type='date'
                          value={dateValue}
                          onChange={(e) => {
                            const value = e.target.value
                            if (value) {
                              const date = new Date(value)
                              field.onChange(!isNaN(date.getTime()) ? date : undefined)
                            } else {
                              field.onChange(undefined)
                            }
                          }}
                        />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )
              }}
            />

            <FormField
              control={form.control}
              name='start_time'
              render={({ field }) => (
                <FormItem>
                  <div className='grid grid-cols-4 items-center gap-4'>
                    <Label className='text-sm font-bold flex items-center gap-2'>
                      <Clock className='h-4 w-4' />
                      {t('startTime')}
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
                      {t('endTime')}
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
          <Button type='submit' form='add-shift-form' disabled={createShiftMutation.isPending}>
            {createShiftMutation.isPending ? t('creating') : t('createShift')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
