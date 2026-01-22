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
import { Textarea } from '@/components/ui/textarea'
import { UpdateShiftRequestBody, UpdateShiftRequestBodyType } from '@/schemaValidations/shift.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Clock, Calendar } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { useGetShift, useUpdateShiftRequestMutation } from '@/queries/useShift'
import { toast } from 'sonner'
import { handleErrorApi } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export default function EditShiftRequest({
  id,
  setId
}: {
  id?: string | undefined
  setId: (value: string | undefined) => void
}) {
  const t = useTranslations('shift')
  const tCommon = useTranslations('common')
  const { data } = useGetShift({
    id: id as string,
    enabled: Boolean(id)
  })

  const updateShiftRequestMutation = useUpdateShiftRequestMutation()

  const form = useForm<UpdateShiftRequestBodyType>({
    resolver: zodResolver(UpdateShiftRequestBody),
    defaultValues: {
      shift_date: undefined,
      start_time: '',
      end_time: '',
      reason: ''
    }
  })

  useEffect(() => {
    if (data) {
      const { shift_date, start_time, end_time, reason } = data.payload.result
      form.reset({
        shift_date: new Date(shift_date),
        start_time,
        end_time,
        reason: reason || ''
      })
    }
  }, [data, form])

  const onSubmit = async (values: UpdateShiftRequestBodyType) => {
    if (updateShiftRequestMutation.isPending) return

    try {
      const result = await updateShiftRequestMutation.mutateAsync({
        id: id as string,
        ...values
      })
      toast(tCommon('success'), {
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
      shift_date: undefined,
      start_time: '',
      end_time: '',
      reason: ''
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
          <DialogTitle>{t('editShiftRequest')}</DialogTitle>
          <DialogDescription>
            {t('editShiftRequestDesc')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form noValidate className='grid gap-4' id='edit-shift-request-form' onSubmit={form.handleSubmit(onSubmit)}>
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
                      <Label className='text-sm font-bold flex items-center gap-2'>
                        <Calendar className='h-4 w-4' />
                        {t('date')}
                      </Label>
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
                      <Input 
                        type='time' 
                        value={field.value || ''} 
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
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
                      <Input 
                        type='time' 
                        value={field.value || ''} 
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
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
                    <Label className='text-sm font-bold'>{t('reason')}</Label>
                    <div className='col-span-3 space-y-2'>
                      <Textarea
                        placeholder={t('reasonPlaceholder')}
                        className='resize-none'
                        value={field.value || ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
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
          <Button type='submit' form='edit-shift-request-form' disabled={updateShiftRequestMutation.isPending}>
            {updateShiftRequestMutation.isPending ? t('updating') : t('updateRequest')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
