'use client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UpdateOrderBody, UpdateOrderBodyType } from '@/schemaValidations/order.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { formatCurrency, getVietnameseOrderStatus, handleErrorApi } from '@/lib/utils'
import { OrderStatus, OrderStatusValues } from '@/constants/type'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DishesDialog } from '@/app/manage/orders/dishes-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useEffect, useState } from 'react'
import { DishListResType } from '@/schemaValidations/dish.schema'
import { useGetOrderDetailQuery, useUpdateOrderMutation } from '@/queries/useOrder'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CalendarDays, User, MapPin, Phone, Mail } from 'lucide-react'

interface EditOrderProps {
  id?: string | undefined
  setId: (value: string | undefined) => void
  onSubmitSuccess?: () => void
}

export default function EditOrder({ id, setId, onSubmitSuccess }: EditOrderProps) {
  const [selectedDish, setSelectedDish] = useState<DishListResType['result'][0] | null>(null)
  const updateOrderMutation = useUpdateOrderMutation()
  const { data, isLoading, error } = useGetOrderDetailQuery({
    id: id as string,
    enabled: Boolean(id)
  })

  const form = useForm<UpdateOrderBodyType>({
    resolver: zodResolver(UpdateOrderBody),
    defaultValues: {
      status: OrderStatus.Pending,
      dish_id: '',
      quantity: 1
    }
  })

  // Load order data into form when data is available
  useEffect(() => {
    if (data?.payload?.result) {
      const orderDetail = data.payload.result
      const { status, dish_snapshot, quantity } = orderDetail.orders[0]

      form.reset({
        status,
        dish_id: dish_snapshot.dish_id ?? dish_snapshot._id,
        quantity
      })

      // Set selected dish for display
      setSelectedDish({
        _id: dish_snapshot._id,
        name: dish_snapshot.name,
        image: dish_snapshot.image,
        price: dish_snapshot.price,
        description: dish_snapshot.description,
        status: dish_snapshot.status,
        category_ids: dish_snapshot.category_ids,
        created_at: dish_snapshot.created_at,
        updated_at: dish_snapshot.updated_at
      })
    }
  }, [data, form])

  const onSubmit = async (values: UpdateOrderBodyType) => {
    if (updateOrderMutation.isPending) return

    try {
      const body: UpdateOrderBodyType & { order_id: string } = {
        order_id: id as string,
        ...values
      }

      const result = await updateOrderMutation.mutateAsync(body)

      toast.success('Success', {
        description: result.payload.message || 'Order updated successfully'
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
    setSelectedDish(null)
    form.reset()
  }

  if (error) {
    console.error('Error loading order:', error)
  }

  const orderDetail = data?.payload?.result
  const orderGroup = orderDetail
  const customer = orderDetail?.customer
  const guest = orderDetail?.guest

  return (
    <Dialog
      open={Boolean(id)}
      onOpenChange={(value) => {
        if (!value) {
          reset()
        }
      }}
    >
      <DialogContent className='sm:max-w-[800px] max-h-screen overflow-auto'>
        <DialogHeader>
          <DialogTitle>Update Order</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className='flex justify-center py-8'>
            <div>Loading order details...</div>
          </div>
        ) : error ? (
          <div className='flex justify-center py-8 text-red-500'>
            <div>Error loading order details. Please try again.</div>
          </div>
        ) : (
          orderDetail && (
            <div className='space-y-6'>
              {/* Order Info Card */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-lg flex items-center justify-between'>
                    Order Information
                    <Badge variant={orderDetail.status === OrderStatus.Delivered ? 'default' : 'secondary'}>
                      {getVietnameseOrderStatus(orderDetail.status)}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='flex items-center space-x-2'>
                      <CalendarDays className='w-4 h-4 text-gray-500' />
                      <span className='text-sm text-gray-600'>Created:</span>
                      <span className='text-sm'>{new Date(orderDetail.created_at).toLocaleString()}</span>
                    </div>
                    {orderGroup && (
                      <div className='flex items-center space-x-2'>
                        <span className='text-sm text-gray-600'>Order Type:</span>
                        <Badge variant='outline'>{orderGroup.order_type === 'dine-in' ? 'Dine In' : 'Delivery'}</Badge>
                      </div>
                    )}
                  </div>

                  {/* Customer/Guest Info */}
                  {customer && (
                    <div className='space-y-2'>
                      <div className='flex items-center space-x-2'>
                        <User className='w-4 h-4 text-gray-500' />
                        <span className='text-sm font-medium'>Customer Information</span>
                      </div>
                      <div className='pl-6 space-y-1'>
                        <div className='flex items-center space-x-2'>
                          <span className='text-sm text-gray-600'>Name:</span>
                          <span className='text-sm'>{customer.name}</span>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <Mail className='w-4 h-4 text-gray-500' />
                          <span className='text-sm'>{customer.email}</span>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <Phone className='w-4 h-4 text-gray-500' />
                          <span className='text-sm'>{customer.phone}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {guest && (
                    <div className='space-y-2'>
                      <div className='flex items-center space-x-2'>
                        <User className='w-4 h-4 text-gray-500' />
                        <span className='text-sm font-medium'>Guest Information</span>
                      </div>
                      <div className='pl-6 space-y-1'>
                        <div className='flex items-center space-x-2'>
                          <span className='text-sm text-gray-600'>Name:</span>
                          <span className='text-sm'>{guest.name}</span>
                        </div>
                        {guest.table_number && (
                          <div className='flex items-center space-x-2'>
                            <MapPin className='w-4 h-4 text-gray-500' />
                            <span className='text-sm'>Table: {guest.table_number}</span>
                          </div>
                        )}
                        {guest.phone && (
                          <div className='flex items-center space-x-2'>
                            <Phone className='w-4 h-4 text-gray-500' />
                            <span className='text-sm'>{guest.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Separator />

              {/* Edit Form */}
              <Form {...form}>
                <form
                  noValidate
                  className='grid auto-rows-max items-start gap-4 md:gap-8'
                  id='edit-order-form'
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <div className='grid gap-6'>
                    {/* Current Dish Info */}
                    {selectedDish && (
                      <Card>
                        <CardContent className='pt-6'>
                          <div className='flex items-center space-x-4'>
                            <Avatar className='w-16 h-16 rounded-md'>
                              <AvatarImage src={selectedDish.image || 'https://placehold.co/600x400'} />
                              <AvatarFallback className='rounded-md text-sm'>
                                {selectedDish.name?.charAt(0) || 'D'}
                              </AvatarFallback>
                            </Avatar>
                            <div className='flex-1'>
                              <h3 className='font-medium text-lg'>{selectedDish.name}</h3>
                              <p className='text-sm text-gray-600 mt-1'>{selectedDish.description}</p>
                              <p className='text-lg font-semibold text-green-600 mt-2'>
                                {formatCurrency(selectedDish.price)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Dish Selection */}
                    <FormField
                      control={form.control}
                      name='dish_id'
                      render={({ field }) => (
                        <FormItem className='grid grid-cols-4 items-center justify-items-start gap-4'>
                          <FormLabel>Change Dish</FormLabel>
                          <div className='col-span-2'>
                            <DishesDialog
                              onChoose={(dish) => {
                                field.onChange(dish._id)
                                setSelectedDish(dish)
                              }}
                            />
                          </div>
                          <FormMessage className='col-span-4' />
                        </FormItem>
                      )}
                    />

                    {/* Quantity */}
                    <FormField
                      control={form.control}
                      name='quantity'
                      render={({ field }) => (
                        <FormItem>
                          <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                            <Label htmlFor='quantity'>Quantity</Label>
                            <div className='col-span-3 w-full space-y-2'>
                              <Input
                                id='quantity'
                                type='number'
                                min='1'
                                className='w-32 text-center'
                                {...field}
                                value={field.value || ''}
                                onChange={(e) => {
                                  const value = e.target.value
                                  const numberValue = parseInt(value, 10)
                                  if (!isNaN(numberValue) && numberValue > 0) {
                                    field.onChange(numberValue)
                                  } else if (value === '') {
                                    field.onChange('')
                                  }
                                }}
                              />
                              <FormMessage />
                              {/* Show total price */}
                              {selectedDish && field.value && (
                                <div className='text-sm text-gray-600'>
                                  Total: {formatCurrency(selectedDish.price * (field.value || 0))}
                                </div>
                              )}
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Status */}
                    <FormField
                      control={form.control}
                      name='status'
                      render={({ field }) => (
                        <FormItem>
                          <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                            <FormLabel>Status</FormLabel>
                            <div className='col-span-3'>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className='w-[250px]'>
                                    <SelectValue placeholder='Select status' />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {OrderStatusValues.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      <div className='flex items-center space-x-2'>
                                        <Badge
                                          variant={status === OrderStatus.Delivered ? 'default' : 'secondary'}
                                          className='w-2 h-2 p-0'
                                        />
                                        <span>{getVietnameseOrderStatus(status)}</span>
                                      </div>
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
                  </div>
                </form>
              </Form>
            </div>
          )
        )}

        <DialogFooter className='flex gap-2'>
          <Button variant='outline' onClick={() => reset()} disabled={updateOrderMutation.isPending}>
            Cancel
          </Button>
          <Button
            type='submit'
            form='edit-order-form'
            disabled={updateOrderMutation.isPending || isLoading}
            className='min-w-[120px]'
          >
            {updateOrderMutation.isPending ? 'Updating...' : 'Update Order'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
