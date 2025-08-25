'use client'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PlusCircle } from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { GuestLoginBody, GuestLoginBodyType } from '@/schemaValidations/guest.schema'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { TablesDialog } from '@/app/manage/orders/tables-dialog'
import { GetListCustomersResType, GetListGuestsResType } from '@/schemaValidations/account.schema'
import { Switch } from '@/components/ui/switch'
import GuestsDialog from '@/app/manage/orders/guests-dialog'
import CustomersDialog from '@/app/manage/orders/customers-dialog'
import { CreateOrderGroupBodyType } from '@/schemaValidations/order.schema'
import Quantity from '@/app/guest/menu/quantity'
import Image from 'next/image'
import { cn, formatCurrency, handleErrorApi } from '@/lib/utils'
import { DishStatus } from '@/constants/type'
import { useDishListQuery } from '@/queries/useDish'
import { useCreateOrderMutation } from '@/queries/useOrder'
import { useCreateGuestMutation } from '@/queries/useAccount'
import { toast } from 'sonner'

export default function AddOrder() {
  const [open, setOpen] = useState(false)
  const [selectedGuest, setSelectedGuest] = useState<GetListGuestsResType['result'][0] | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<GetListCustomersResType['result'][0] | null>(null)
  const [isNewGuest, setIsNewGuest] = useState(true)
  const [isCustomer, setIsCustomer] = useState(false)
  const [orderType, setOrderType] = useState<'dine-in' | 'delivery'>('dine-in')
  const [deliveryInfo, setDeliveryInfo] = useState({
    address: '',
    receiver_name: '',
    receiver_phone: ''
  })
  const [orders, setOrders] = useState<CreateOrderGroupBodyType['orders']>([])
  const { data } = useDishListQuery()
  const dishes = useMemo(() => data?.payload.result ?? [], [data])

  // Auto reset order type when switching between guest/customer
  useEffect(() => {
    if (!isCustomer) {
      // Guest can only dine-in
      setOrderType('dine-in')
    }
  }, [isCustomer])

  const totalPrice = useMemo(() => {
    return dishes.reduce((result, dish) => {
      const order = orders.find((order) => order.dish_id === dish._id)
      if (!order) return result
      return result + order.quantity * dish.price
    }, 0)
  }, [dishes, orders])

  const createOrderMutation = useCreateOrderMutation()
  const createGuestMutation = useCreateGuestMutation()

  const form = useForm<GuestLoginBodyType>({
    resolver: zodResolver(GuestLoginBody),
    defaultValues: {
      name: '',
      table_number: 0,
      token: ''
    }
  })
  const name = form.watch('name')

  const handleQuantityChange = (dish_id: string, quantity: number) => {
    setOrders((prevOrders) => {
      if (quantity === 0) {
        return prevOrders.filter((order) => order.dish_id !== dish_id)
      }
      const index = prevOrders.findIndex((order) => order.dish_id === dish_id)
      if (index === -1) {
        return [...prevOrders, { dish_id, quantity }]
      }
      const newOrders = [...prevOrders]
      newOrders[index] = { ...newOrders[index], quantity }
      return newOrders
    })
  }

  const handleOrder = async () => {
    if (createOrderMutation.isPending) return

    try {
      let guestId = selectedGuest?._id
      const customerId = selectedCustomer?._id
      let tableNumber: number | null = null

      // Handle customer order
      if (isCustomer) {
        if (!customerId) {
          toast.error('Error', {
            description: 'Please select a customer'
          })
          return
        }

        // For customer dine-in orders, table is required
        if (orderType === 'dine-in') {
          const table_number = form.getValues('table_number')

          if (!table_number) {
            toast.error('Error', {
              description: 'Please select a table for dine-in order'
            })
            return
          }
          tableNumber = table_number
        } else {
          // For delivery orders, table is not required
          tableNumber = null
        }
      } else {
        // Handle guest order (always dine-in)
        if (isNewGuest) {
          // Validate form data first
          const isValid = await form.trigger()
          if (!isValid) {
            toast.error('Error', {
              description: 'Please fill in all required fields'
            })
            return
          }

          const guestRes = await createGuestMutation.mutateAsync({
            name,
            table_number: form.getValues('table_number'),
            phone: '',
            token: form.getValues('token')
          })
          guestId = guestRes.payload.result._id
          tableNumber = guestRes.payload.result.table_number
        } else {
          if (!guestId) {
            toast.error('Error', {
              description: 'Please select a guest'
            })
            return
          }
          tableNumber = selectedGuest?.table_number ?? null
        }
      }

      if (orders.length === 0) {
        toast.error('Error', {
          description: 'Please add at least one dish to the order'
        })
        return
      }

      // Validate delivery info for delivery orders
      if (orderType === 'delivery') {
        if (!deliveryInfo.address || !deliveryInfo.receiver_name || !deliveryInfo.receiver_phone) {
          toast.error('Error', {
            description: 'Please fill in all delivery information'
          })
          return
        }
      }

      // Create order group
      const orderData: CreateOrderGroupBodyType = {
        customer_id: customerId,
        guest_id: guestId,
        table_number: tableNumber,
        order_type: orderType,
        orders
      }

      // Add delivery info if it's a delivery order
      if (orderType === 'delivery') {
        orderData.delivery_info = deliveryInfo
      }

      await createOrderMutation.mutateAsync(orderData)

      toast.success('Success', {
        description: 'Order created successfully'
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
    form.reset()
    setSelectedGuest(null)
    setSelectedCustomer(null)
    setIsNewGuest(true)
    setIsCustomer(false)
    setOrderType('dine-in')
    setDeliveryInfo({
      address: '',
      receiver_name: '',
      receiver_phone: ''
    })
    setOrders([])
    setOpen(false)
  }

  return (
    <Dialog
      onOpenChange={(value) => {
        if (!value) {
          reset()
        }
        setOpen(value)
      }}
      open={open}
    >
      <DialogTrigger asChild>
        <Button size='lg' className='h-8 gap-1'>
          <PlusCircle className='h-3.5 w-3.5' />
          <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>Create Order</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px] max-h-screen overflow-auto'>
        <DialogHeader>
          <DialogTitle>Create Order</DialogTitle>
        </DialogHeader>

        {/* Customer/Guest Selection */}
        <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
          <Label htmlFor='isCustomer'>Customer</Label>
          <div className='col-span-3 flex items-center'>
            <Switch id='isCustomer' checked={isCustomer} onCheckedChange={setIsCustomer} />
          </div>
        </div>

        {/* Order Type Selection - Only show for customers */}
        {isCustomer && (
          <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
            <Label htmlFor='orderType'>Order Type</Label>
            <div className='col-span-3 flex gap-4'>
              <Button
                type='button'
                variant={orderType === 'dine-in' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setOrderType('dine-in')}
              >
                Dine In
              </Button>
              <Button
                type='button'
                variant={orderType === 'delivery' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setOrderType('delivery')}
              >
                Delivery
              </Button>
            </div>
          </div>
        )}

        {/* Info for guests */}
        {!isCustomer && (
          <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
            <Label>Order Type</Label>
            <div className='col-span-3 text-sm text-gray-600'>Dine In (Guests can only eat at the restaurant)</div>
          </div>
        )}

        {!isCustomer && (
          <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
            <Label htmlFor='isNewGuest'>New guest</Label>
            <div className='col-span-3 flex items-center'>
              <Switch id='isNewGuest' checked={isNewGuest} onCheckedChange={setIsNewGuest} />
            </div>
          </div>
        )}

        {/* Delivery Information - Only show for customer delivery orders */}
        {isCustomer && orderType === 'delivery' && (
          <div className='space-y-4 p-4 border rounded-lg bg-gray-50'>
            <Label className='text-base font-medium'>Delivery Information</Label>
            <div className='grid gap-4'>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='deliveryAddress'>Address</Label>
                <Input
                  id='deliveryAddress'
                  className='col-span-3'
                  value={deliveryInfo.address}
                  onChange={(e) => setDeliveryInfo((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder='Enter delivery address'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='receiverName'>Receiver Name</Label>
                <Input
                  id='receiverName'
                  className='col-span-3'
                  value={deliveryInfo.receiver_name}
                  onChange={(e) => setDeliveryInfo((prev) => ({ ...prev, receiver_name: e.target.value }))}
                  placeholder='Enter receiver name'
                />
              </div>
              <div className='grid grid-cols-4 items-center gap-4'>
                <Label htmlFor='receiverPhone'>Receiver Phone</Label>
                <Input
                  id='receiverPhone'
                  className='col-span-3'
                  value={deliveryInfo.receiver_phone}
                  onChange={(e) => setDeliveryInfo((prev) => ({ ...prev, receiver_phone: e.target.value }))}
                  placeholder='Enter receiver phone number'
                />
              </div>
            </div>
          </div>
        )}

        {/* Customer Selection */}
        {isCustomer && (
          <div className='space-y-4'>
            <CustomersDialog
              onChoose={(customer) => {
                setSelectedCustomer(customer)
                // Auto-fill delivery info if it's a delivery order
                if (orderType === 'delivery') {
                  setDeliveryInfo((prev) => ({
                    ...prev,
                    receiver_name: customer.name,
                    receiver_phone: customer.phone
                  }))
                }
              }}
            />
            {selectedCustomer && (
              <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                <Label htmlFor='selectedCustomer'>Selected customer</Label>
                <div className='col-span-3 w-full gap-4 flex items-center'>
                  <div>
                    {selectedCustomer.name} ({selectedCustomer.email})
                  </div>
                  <div>Phone: {selectedCustomer.phone}</div>
                </div>
              </div>
            )}

            {/* Table selection for customer dine-in */}
            {selectedCustomer && orderType === 'dine-in' && (
              <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                <Label htmlFor='customerTable'>Select table</Label>
                <div className='col-span-3 w-full space-y-2'>
                  <div className='flex items-center gap-4'>
                    <div>Table {form.watch('table_number') || 'Not selected'}</div>
                    <TablesDialog
                      onChoose={(table) => {
                        form.setValue('table_number', table.number)
                        form.setValue('token', table.token)
                      }}
                      showOccupiedTables={true}
                      occupiedByCustomerId={selectedCustomer._id}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* New Guest Form */}
        {!isCustomer && isNewGuest && (
          <Form {...form}>
            <form noValidate className='grid auto-rows-max items-start gap-4 md:gap-8' id='add-order-form'>
              <div className='grid gap-4 py-4'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                        <Label htmlFor='name'>Guest name</Label>
                        <div className='col-span-3 w-full space-y-2'>
                          <Input id='name' className='w-full' {...field} />
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='table_number'
                  render={({ field }) => (
                    <FormItem>
                      <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                        <Label htmlFor='tableNumber'>Select table</Label>
                        <div className='col-span-3 w-full space-y-2'>
                          <div className='flex items-center gap-4'>
                            <div>Table {field.value}</div>
                            <TablesDialog
                              onChoose={(table) => {
                                form.setValue('table_number', table.number)
                                form.setValue('token', table.token)
                              }}
                            />
                          </div>
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        )}

        {/* Existing Guest Selection */}
        {!isCustomer && !isNewGuest && (
          <div className='space-y-4'>
            <GuestsDialog
              onChoose={(guest) => {
                setSelectedGuest(guest)
              }}
            />
            {selectedGuest && (
              <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                <Label htmlFor='selectedGuest'>Selected guest</Label>
                <div className='col-span-3 w-full gap-4 flex items-center'>
                  <div>
                    {selectedGuest.name} (#{selectedGuest._id})
                  </div>
                  <div>Table: {selectedGuest.table_number}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dish Selection */}
        <div className='space-y-4 max-h-96 overflow-y-auto'>
          <Label>Select dishes</Label>
          {dishes
            .filter((dish) => dish.status !== DishStatus.Hidden)
            .map((dish) => (
              <div
                key={dish._id}
                className={cn('flex gap-4 p-2 border rounded-lg', {
                  'pointer-events-none opacity-50': dish.status === DishStatus.Unavailable
                })}
              >
                <div className='flex-shrink-0 relative'>
                  {dish.status === DishStatus.Unavailable && (
                    <span className='absolute inset-0 flex items-center justify-center text-xs bg-red-500 text-white rounded-md'>
                      Out of stock
                    </span>
                  )}
                  <Image
                    src={dish.image || 'https://placehold.co/600x400'}
                    alt={dish.name}
                    height={80}
                    width={80}
                    quality={100}
                    className='object-cover w-[80px] h-[80px] rounded-md'
                  />
                </div>
                <div className='flex-1 space-y-1'>
                  <h3 className='text-sm font-medium'>{dish.name}</h3>
                  <p className='text-xs text-gray-600'>{dish.description}</p>
                  <p className='text-xs font-semibold text-green-600'>{formatCurrency(dish.price)}</p>
                </div>
                <div className='flex-shrink-0 ml-auto flex justify-center items-center'>
                  <Quantity
                    onChange={(value) => handleQuantityChange(dish._id, value)}
                    value={orders.find((order) => order.dish_id === dish._id)?.quantity ?? 0}
                  />
                </div>
              </div>
            ))}
        </div>

        <DialogFooter>
          <Button
            className='w-full justify-between'
            onClick={handleOrder}
            disabled={orders.length === 0 || createOrderMutation.isPending}
          >
            <span>
              {createOrderMutation.isPending
                ? 'Creating order...'
                : `Order ${orders.length} item${orders.length > 1 ? 's' : ''}`}
            </span>
            <span>{formatCurrency(totalPrice)}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
