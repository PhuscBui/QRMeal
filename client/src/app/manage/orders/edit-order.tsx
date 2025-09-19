'use client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { UpdateOrderBody, type UpdateOrderBodyType } from '@/schemaValidations/order.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { formatCurrency, getOrderStatus, handleErrorApi } from '@/lib/utils'
import { OrderStatus, OrderStatusValues } from '@/constants/type'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DishesDialog } from '@/app/manage/orders/dishes-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useEffect, useState } from 'react'
import type { DishListResType } from '@/schemaValidations/dish.schema'
import { useGetOrderDetailQuery, useUpdateOrderMutation } from '@/queries/useOrder'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarDays, User, MapPin, Phone, Mail, Package, Edit3 } from 'lucide-react'

interface EditOrderProps {
  id?: string | undefined
  setId: (value: string | undefined) => void
  onSubmitSuccess?: () => void
}

export default function EditOrder({ id, setId, onSubmitSuccess }: EditOrderProps) {
  const [selectedDish, setSelectedDish] = useState<DishListResType['result'][0] | null>(null)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [selectedOrderIndex, setSelectedOrderIndex] = useState<number>(0)
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
      const orderGroup = data.payload.result

      // Get the selected order from the orders array
      const selectedOrder = orderGroup.orders[selectedOrderIndex]
      if (selectedOrder) {
        const { status, dish_snapshot, quantity } = selectedOrder

        form.reset({
          status,
          dish_id: dish_snapshot.dish_id ?? dish_snapshot._id,
          quantity
        })

        // Set selected order ID for update
        setSelectedOrderId(selectedOrder._id)

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
    }
  }, [data, form, selectedOrderIndex])

  const onSubmit = async (values: UpdateOrderBodyType) => {
    if (updateOrderMutation.isPending || !selectedOrderId) return

    try {
      const body: UpdateOrderBodyType & { order_id: string } = {
        order_id: selectedOrderId,
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
    setSelectedOrderId(null)
    setSelectedOrderIndex(0)
    form.reset()
  }

  if (error) {
    console.error('Error loading order:', error)
  }

  const orderGroup = data?.payload?.result
  const customer = orderGroup?.customer
  const guest = orderGroup?.guest

  return (
    <Dialog
      open={Boolean(id)}
      onOpenChange={(value) => {
        if (!value) {
          reset()
        }
      }}
    >
      <DialogContent className='sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col'>
        <DialogHeader className=''>
          <DialogTitle className='flex items-center gap-2 text-xl'>
            <Edit3 className='w-5 h-5' />
            Edit Order
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className='flex justify-center py-12'>
            <div className='text-center space-y-2'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
              <p className='text-sm text-muted-foreground'>Loading order details...</p>
            </div>
          </div>
        ) : error ? (
          <div className='flex justify-center py-12'>
            <div className='text-center space-y-2'>
              <div className='text-red-500 text-lg'>⚠️</div>
              <p className='text-red-500'>Error loading order details. Please try again.</p>
            </div>
          </div>
        ) : (
          orderGroup && (
            <div className='flex-1 overflow-auto'>
              <Tabs defaultValue='edit' className='w-full'>
                <TabsList className='grid w-full grid-cols-2 mb-2'>
                  <TabsTrigger value='info' className='flex items-center gap-2'>
                    <Package className='w-4 h-4' />
                    Order Info
                  </TabsTrigger>
                  <TabsTrigger value='edit' className='flex items-center gap-2'>
                    <Edit3 className='w-4 h-4' />
                    Edit Item
                  </TabsTrigger>
                </TabsList>

                <TabsContent value='info' className='space-y-6'>
                  <div className='grid gap-6'>
                    {/* Order Summary Card */}
                    <Card>
                      <CardHeader className=''>
                        <div className='flex items-center justify-between'>
                          <CardTitle className='text-lg'>Order Summary</CardTitle>
                          <Badge variant={orderGroup.status === OrderStatus.Delivered ? 'default' : 'secondary'}>
                            {getOrderStatus(orderGroup.status)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className='space-y-4'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          <div className='flex items-center gap-3'>
                            <CalendarDays className='w-4 h-4 text-muted-foreground' />
                            <div>
                              <p className='text-sm text-muted-foreground'>Created</p>
                              <p className='text-sm font-medium'>{new Date(orderGroup.created_at).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className='flex items-center gap-3'>
                            <MapPin className='w-4 h-4 text-muted-foreground' />
                            <div>
                              <p className='text-sm text-muted-foreground'>Type</p>
                              <Badge variant='outline'>
                                {orderGroup.order_type === 'dine-in' ? 'Dine In' : 'Delivery'}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {orderGroup.table_number && (
                          <div className='flex items-center gap-3'>
                            <MapPin className='w-4 h-4 text-muted-foreground' />
                            <div>
                              <p className='text-sm text-muted-foreground'>Table Number</p>
                              <p className='text-sm font-medium'>{orderGroup.table_number}</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Customer/Guest Info Card */}
                    {(customer || guest) && (
                      <Card>
                        <CardHeader className=''>
                          <CardTitle className='text-lg flex items-center gap-2'>
                            <User className='w-4 h-4' />
                            {customer ? 'Customer' : 'Guest'} Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {customer && (
                            <div className='space-y-3'>
                              <div>
                                <p className='text-sm text-muted-foreground'>Name</p>
                                <p className='font-medium'>{customer.name}</p>
                              </div>
                              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div className='flex items-center gap-2'>
                                  <Mail className='w-4 h-4 text-muted-foreground' />
                                  <span className='text-sm'>{customer.email}</span>
                                </div>
                                <div className='flex items-center gap-2'>
                                  <Phone className='w-4 h-4 text-muted-foreground' />
                                  <span className='text-sm'>{customer.phone}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {guest && (
                            <div className='space-y-3'>
                              <div>
                                <p className='text-sm text-muted-foreground'>Name</p>
                                <p className='font-medium'>{guest.name}</p>
                              </div>
                              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                {guest.table_number && (
                                  <div className='flex items-center gap-2'>
                                    <MapPin className='w-4 h-4 text-muted-foreground' />
                                    <span className='text-sm'>Table {guest.table_number}</span>
                                  </div>
                                )}
                                {guest.phone && (
                                  <div className='flex items-center gap-2'>
                                    <Phone className='w-4 h-4 text-muted-foreground' />
                                    <span className='text-sm'>{guest.phone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Order Items */}
                    <Card>
                      <CardHeader className=''>
                        <CardTitle className='text-lg'>Order Items</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {orderGroup.orders.length > 1 ? (
                          <div className='space-y-3'>
                            <p className='text-sm text-muted-foreground'>Select an item to edit:</p>
                            <div className='grid gap-3'>
                              {orderGroup.orders.map((order, index) => (
                                <button
                                  key={order._id}
                                  type='button'
                                  onClick={() => setSelectedOrderIndex(index)}
                                  className={`p-4 rounded-lg border text-left transition-all hover:shadow-sm ${
                                    selectedOrderIndex === index
                                      ? 'border-primary bg-primary/5 shadow-sm'
                                      : 'border-border hover:border-primary/50'
                                  }`}
                                >
                                  <div className='flex items-center justify-between'>
                                    <div className='flex-1'>
                                      <div className='font-medium'>{order.dish_snapshot.name}</div>
                                      <div className='text-sm text-muted-foreground mt-1'>
                                        Quantity: {order.quantity} •{' '}
                                        {formatCurrency(order.dish_snapshot.price * order.quantity)}
                                      </div>
                                      <Badge variant='outline' className='mt-2 text-xs'>
                                        {getOrderStatus(order.status)}
                                      </Badge>
                                    </div>
                                    {selectedOrderIndex === index && (
                                      <Badge variant='default' className='ml-3'>
                                        Selected
                                      </Badge>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className='flex items-center gap-4 p-4 bg-muted/50 rounded-lg'>
                            <Avatar className='w-12 h-12 rounded-md'>
                              <AvatarImage
                                src={orderGroup.orders[0].dish_snapshot.image || 'https://placehold.co/600x400'}
                              />
                              <AvatarFallback className='rounded-md'>
                                {orderGroup.orders[0].dish_snapshot.name?.charAt(0) || 'D'}
                              </AvatarFallback>
                            </Avatar>
                            <div className='flex-1'>
                              <div className='font-medium'>{orderGroup.orders[0].dish_snapshot.name}</div>
                              <div className='text-sm text-muted-foreground'>
                                Quantity: {orderGroup.orders[0].quantity} •{' '}
                                {formatCurrency(
                                  orderGroup.orders[0].dish_snapshot.price * orderGroup.orders[0].quantity
                                )}
                              </div>
                              <Badge variant='outline' className='mt-1 text-xs'>
                                {getOrderStatus(orderGroup.orders[0].status)}
                              </Badge>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value='edit' className='space-y-6'>
                  <div className='space-y-6'>
                    {/* Current Item Display */}
                    {selectedDish && (
                      <Card>
                        <CardHeader className=''>
                          <CardTitle className='text-lg'>Current Item</CardTitle>
                          {orderGroup.orders.length > 1 && (
                            <p className='text-sm text-muted-foreground'>
                              Editing item {selectedOrderIndex + 1} of {orderGroup.orders.length}
                            </p>
                          )}
                        </CardHeader>
                        <CardContent>
                          <div className='flex items-center gap-4'>
                            <Avatar className='w-16 h-16 rounded-lg'>
                              <AvatarImage src={selectedDish.image || 'https://placehold.co/600x400'} />
                              <AvatarFallback className='rounded-lg text-lg'>
                                {selectedDish.name?.charAt(0) || 'D'}
                              </AvatarFallback>
                            </Avatar>
                            <div className='flex-1'>
                              <h3 className='font-semibold text-lg'>{selectedDish.name}</h3>
                              <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>
                                {selectedDish.description}
                              </p>
                              <p className='text-lg font-bold text-green-600 mt-2'>
                                {formatCurrency(selectedDish.price)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Edit Form */}
                    <Card>
                      <CardHeader className=''>
                        <CardTitle className='text-lg'>Edit Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Form {...form}>
                          <form
                            noValidate
                            className='space-y-6'
                            id='edit-order-form'
                            onSubmit={form.handleSubmit(onSubmit)}
                          >
                            <FormField
                              control={form.control}
                              name='dish_id'
                              render={({ field }) => (
                                <FormItem className='space-y-3'>
                                  <FormLabel className='text-base font-medium'>Change Dish</FormLabel>
                                  <div>
                                    <DishesDialog
                                      onChoose={(dish) => {
                                        field.onChange(dish._id)
                                        setSelectedDish(dish)
                                      }}
                                    />
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name='quantity'
                              render={({ field }) => (
                                <FormItem className='space-y-3'>
                                  <FormLabel className='text-base font-medium'>Quantity</FormLabel>
                                  <div className='space-y-3'>
                                    <Input
                                      type='number'
                                      min='1'
                                      className='w-32 text-center text-lg'
                                      {...field}
                                      value={field.value || ''}
                                      onChange={(e) => {
                                        const value = e.target.value
                                        const numberValue = Number.parseInt(value, 10)
                                        if (!isNaN(numberValue) && numberValue > 0) {
                                          field.onChange(numberValue)
                                        } else if (value === '') {
                                          field.onChange('')
                                        }
                                      }}
                                    />
                                    {selectedDish && field.value && (
                                      <div className='p-3 bg-muted/50 rounded-lg'>
                                        <p className='text-sm text-muted-foreground'>Total Price</p>
                                        <p className='text-lg font-semibold text-green-600'>
                                          {formatCurrency(selectedDish.price * (field.value || 0))}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name='status'
                              render={({ field }) => (
                                <FormItem className='space-y-3'>
                                  <FormLabel className='text-base font-medium'>Status</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger className='w-full'>
                                        <SelectValue placeholder='Select status' />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {OrderStatusValues.map((status) => (
                                        <SelectItem key={status} value={status}>
                                          <div className='flex items-center gap-3'>
                                            <div
                                              className={`w-2 h-2 rounded-full ${
                                                status === OrderStatus.Delivered ? 'bg-green-500' : 'bg-gray-400'
                                              }`}
                                            />
                                            <span>{getOrderStatus(status)}</span>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )
        )}

        <DialogFooter className='pt-6 border-t'>
          <div className='flex gap-3 w-full sm:w-auto'>
            <Button
              variant='outline'
              onClick={() => reset()}
              disabled={updateOrderMutation.isPending}
              className='flex-1 sm:flex-none'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              form='edit-order-form'
              disabled={updateOrderMutation.isPending || isLoading || !selectedOrderId}
              className='flex-1 sm:flex-none min-w-[120px]'
            >
              {updateOrderMutation.isPending ? (
                <div className='flex items-center gap-2'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                  Updating...
                </div>
              ) : (
                'Update Order'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
