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
import { useGetTableQuery, useUpdateTableMutation } from '@/queries/useTable'
import { toast } from 'sonner'
import QRCodeTable from '@/components/qrcode-table'

const locationOptions = [
  { label: 'Window', value: 'Window' },
  { label: 'Center', value: 'Center' },
  { label: 'Patio', value: 'Patio' },
  { label: 'Bar', value: 'Bar' },
  { label: 'Private Room', value: 'Private Room' }
]

export default function EditTable({
  id,
  setId,
  onSubmitSuccess
}: {
  id?: number | undefined
  setId: (value: number | undefined) => void
  onSubmitSuccess?: () => void
}) {
  const updateTableMutation = useUpdateTableMutation()

  const form = useForm<UpdateTableBodyType>({
    resolver: zodResolver(UpdateTableBody),
    defaultValues: {
      capacity: 2,
      status: TableStatus.Hidden,
      changeToken: false,
      location: ''
    }
  })
  const { data } = useGetTableQuery({ enabled: Boolean(id), id: id as number })
  console.log(data)
  useEffect(() => {
    if (data) {
      const { capacity, status, location } = data.payload.result
      form.reset({
        capacity,
        status,
        changeToken: form.getValues('changeToken'),
        location
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
      toast('Success', {
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
        className='sm:max-w-[600px] max-h-screen overflow-auto'
        onCloseAutoFocus={() => {
          form.reset()
          setId(undefined)
        }}
      >
        <DialogHeader>
          <DialogTitle>Update table</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className='grid auto-rows-max items-start gap-4 md:gap-8'
            onSubmit={form.handleSubmit(onSubmit, console.log)}
            id='edit-table-form'
          >
            <div className='grid gap-4 py-4'>
              <FormItem>
                <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                  <Label htmlFor='name' className='text-sm font-bold'>
                    Table number
                  </Label>
                  <div className='col-span-3 w-full space-y-2'>
                    <Input
                      id='number'
                      type='number'
                      className='w-full'
                      value={data?.payload.result.number ?? 0}
                      readOnly
                    />
                    <FormMessage />
                  </div>
                </div>
              </FormItem>
              <FormField
                control={form.control}
                name='capacity'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='price' className='text-sm font-bold'>
                        Capacity
                      </Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Input id='capacity' className='w-full' {...field} type='number' />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='status'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='description' className='text-sm font-bold'>
                        Status
                      </Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select status' />
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
                      </div>

                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='changeToken'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='price' className='text-sm font-bold'>
                        Change QR Code
                      </Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <div className='flex items-center space-x-2'>
                          <Switch id='changeToken' checked={field.value} onCheckedChange={field.onChange} />
                        </div>
                      </div>

                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormItem>
                <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                  <Label className='text-sm font-bold'>QR Code</Label>
                  <div className='col-span-3 w-full space-y-2'>
                    {data && <QRCodeTable token={data.payload.result.token} tableNumber={data.payload.result.number} />}
                  </div>
                </div>
              </FormItem>
              <FormItem>
                <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                  <Label className='text-sm font-bold'>URL order</Label>
                  <div className='col-span-3 w-full space-y-2'>
                    {data && (
                      <Link
                        href={getTableLink({
                          token: data.payload.result.token,
                          tableNumber: data.payload.result.number
                        })}
                        target='_blank'
                        className='break-all'
                      >
                        {getTableLink({
                          token: data.payload.result.token,
                          tableNumber: data.payload.result.number
                        })}
                      </Link>
                    )}
                  </div>
                </div>
              </FormItem>
              <FormField
                control={form.control}
                name='location'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='location' className='text-sm font-bold'>
                        Location
                      </Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select location' />
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
                      </div>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='edit-table-form'>
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
