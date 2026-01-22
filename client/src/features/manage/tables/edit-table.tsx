'use client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { getTableLink, getTableStatus, handleErrorApi } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UpdateTableBody, UpdateTableBodyType } from '@/schemaValidations/table.schema'
import { TableStatus, TableStatusValues } from '@/constants/type'
import { Switch } from '@/components/ui/switch'
import Link from 'next/link'
import { useEffect } from 'react'
import { useGetTableQuery, useUpdateTableMutation, useTableListQuery } from '@/queries/useTable'
import { toast } from 'sonner'
import QRCodeTable from '@/components/qrcode-table'
import { useTranslations } from 'next-intl'
import FloorMapPicker from '@/components/floor-map-picker'

export default function EditTable({
  id,
  setId,
  onSubmitSuccess
}: {
  id?: number | undefined
  setId: (value: number | undefined) => void
  onSubmitSuccess?: () => void
}) {
  const t = useTranslations('table')
  const tCommon = useTranslations('common')
  
  const locationOptions = [
    { label: t('window'), value: 'Window' },
    { label: t('center'), value: 'Center' },
    { label: t('patio'), value: 'Patio' },
    { label: t('bar'), value: 'Bar' },
    { label: t('privateRoom'), value: 'Private Room' }
  ]
  
  const updateTableMutation = useUpdateTableMutation()
  const tablesQuery = useTableListQuery()
  const existingTables = tablesQuery.data?.payload.result ?? []

  const form = useForm<UpdateTableBodyType>({
    resolver: zodResolver(UpdateTableBody),
    defaultValues: {
      capacity: 2,
      status: TableStatus.Hidden,
      changeToken: false,
      location: '',
      x: undefined,
      y: undefined,
      shape: undefined
    }
  })
  const { data } = useGetTableQuery({ enabled: Boolean(id), id: id as number })
  console.log(data)
  useEffect(() => {
    if (data) {
      const { capacity, status, location, x, y, shape } = data.payload.result
      form.reset({
        capacity,
        status,
        changeToken: form.getValues('changeToken'),
        location: location || '',
        x: x ?? undefined,
        y: y ?? undefined,
        shape: shape ?? undefined
      })
    }
  }, [data, form])
  const onSubmit = async (values: UpdateTableBodyType) => {
    console.log(values)
    if (updateTableMutation.isPending) return
    try {
      const body: UpdateTableBodyType & { id: number } = {
        id: id as number,
        ...values
      }
      const result = await updateTableMutation.mutateAsync(body)
      toast(tCommon('success'), {
        description: result.payload.message
      })
      reset()
      if (onSubmitSuccess) {
        onSubmitSuccess()
      }
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError
      })
    }
  }
  const reset = () => {
    setId(undefined)
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
      <DialogContent
        className='sm:max-w-[700px] max-h-screen overflow-auto'
        onCloseAutoFocus={() => {
          form.reset()
          setId(undefined)
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">{t('updateTable')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className='space-y-6'
            onSubmit={form.handleSubmit(onSubmit, console.log)}
            id='edit-table-form'
          >
            {/* Thông tin cơ bản */}
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold text-foreground/80 pb-2 border-b'>
                {t('basicInfo') || 'Thông tin cơ bản'}
              </h3>
              <FormItem>
                <Label htmlFor='number' className='text-sm font-medium'>
                  {t('tableNumber')}
                </Label>
                <Input
                  id='number'
                  type='number'
                  className='w-full'
                  value={data?.payload.result.number ?? 0}
                  readOnly
                />
                <FormMessage />
              </FormItem>
              <div className='grid gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='capacity'
                  render={({ field }) => (
                    <FormItem>
                      <Label htmlFor='capacity' className='text-sm font-medium'>
                        {t('capacity')}
                      </Label>
                      <FormControl>
                        <Input id='capacity' className='w-full' {...field} type='number' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='status'
                  render={({ field }) => (
                    <FormItem>
                      <Label className='text-sm font-medium'>
                        {tCommon('status')}
                      </Label>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectStatus')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TableStatusValues.map((status) => (
                            <SelectItem key={status} value={status}>
                              {getTableStatus(status)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name='location'
                render={({ field }) => (
                  <FormItem>
                    <Label className='text-sm font-medium'>
                      {t('location')}
                    </Label>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectLocation')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* QR Code và URL */}
            <div className='space-y-4 rounded-lg border p-4 bg-muted/30'>
              <h3 className='text-sm font-semibold text-foreground/80 pb-2 border-b'>
                {t('qrCode')} & {t('urlOrder')}
              </h3>
              <FormField
                control={form.control}
                name='changeToken'
                render={({ field }) => (
                  <FormItem className='flex items-center justify-between space-y-0'>
                    <div className='space-y-0.5'>
                      <Label htmlFor='changeToken' className='text-sm font-medium'>
                        {t('changeQRCode')}
                      </Label>
                      <p className='text-xs text-muted-foreground'>
                        Bật để tạo mã QR mới cho bàn này
                      </p>
                    </div>
                    <FormControl>
                      <Switch id='changeToken' checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              {data && (
                <>
                  <FormItem>
                    <Label className='text-sm font-medium'>{t('qrCode')}</Label>
                    <div className='mt-2'>
                      <QRCodeTable token={data.payload.result.token} tableNumber={data.payload.result.number} />
                    </div>
                  </FormItem>
                  <FormItem>
                    <Label className='text-sm font-medium'>{t('urlOrder')}</Label>
                    <div className='mt-2'>
                      <Link
                        href={getTableLink({
                          token: data.payload.result.token,
                          tableNumber: data.payload.result.number
                        })}
                        target='_blank'
                        className='break-all text-sm text-primary hover:underline'
                      >
                        {getTableLink({
                          token: data.payload.result.token,
                          tableNumber: data.payload.result.number
                        })}
                      </Link>
                    </div>
                  </FormItem>
                </>
              )}
            </div>

            {/* Vị trí trên sơ đồ */}
            <div className='space-y-4 rounded-lg border p-4 bg-muted/30'>
              <div className='space-y-4'>
                <FormField
                  control={form.control}
                  name='x'
                  render={({ field }) => (
                    <FormItem className='hidden'>
                      <FormControl>
                        <Input 
                          type='hidden' 
                          value={field.value ?? ''} 
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='y'
                  render={({ field }) => (
                    <FormItem className='hidden'>
                      <FormControl>
                        <Input 
                          type='hidden' 
                          value={field.value ?? ''} 
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FloorMapPicker
                  onPositionSelect={(position) => {
                    if (position) {
                      form.setValue('x', position.x)
                      form.setValue('y', position.y)
                    } else {
                      form.setValue('x', undefined)
                      form.setValue('y', undefined)
                    }
                  }}
                  initialPosition={
                    form.watch('x') !== undefined && form.watch('y') !== undefined
                      ? { x: form.watch('x')!, y: form.watch('y')! }
                      : undefined
                  }
                  existingTables={existingTables}
                  excludeTableId={id}
                />
                <FormField
                  control={form.control}
                  name='shape'
                  render={({ field }) => (
                    <FormItem>
                      <Label className='text-sm font-medium'>
                        {t('shape') || 'Hình dạng'}
                      </Label>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectShape') || 'Chọn hình dạng'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='circle'>{t('circle') || 'Tròn'}</SelectItem>
                          <SelectItem value='rect'>{t('rect') || 'Vuông'}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </form>
        </Form>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            type='button' 
            variant='outline' 
            onClick={() => reset()}
          >
            {tCommon('cancel') || 'Hủy'}
          </Button>
          <Button 
            type='submit' 
            form='edit-table-form'
            disabled={updateTableMutation.isPending}
          >
            {updateTableMutation.isPending ? tCommon('updating') || 'Đang cập nhật...' : tCommon('update')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
