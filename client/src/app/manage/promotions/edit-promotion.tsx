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
import { zodResolver } from '@hookform/resolvers/zod'
import { HelpCircle, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormMessage, FormDescription } from '@/components/ui/form'
import { handleErrorApi } from '@/lib/utils'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import revalidateApiRequest from '@/apiRequests/revalidate'
import { PromotionCategoryValues, DiscountTypeValues, ApplicableToValues } from '@/constants/type'
import { UpdatePromotionBody, UpdatePromotionBodyType } from '@/schemaValidations/promotion.schema'
import { usePromotionDetailQuery, useUpdatePromotionMutation } from '@/queries/usePromotion'
import { useDishListQuery } from '@/queries/useDish'

export default function EditPromotion({
  id,
  setId,
  onSubmitSuccess
}: {
  id?: string | undefined
  setId: (value: string | undefined) => void
  onSubmitSuccess?: () => void
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('discount')
  const [selectedDiscountType, setSelectedDiscountType] = useState<string>('fixed')
  const [selectedDishes, setSelectedDishes] = useState<string[]>([])
  const updatePromotionMutation = useUpdatePromotionMutation()
  const { data } = usePromotionDetailQuery({ enabled: Boolean(id), id: id as string })
  const { data: dishData } = useDishListQuery()

  const dishes = dishData?.payload.result || []

  const form = useForm<UpdatePromotionBodyType>({
    resolver: zodResolver(UpdatePromotionBody),
    defaultValues: {
      name: '',
      description: '',
      category: 'discount',
      discount_type: 'fixed',
      discount_value: 0,
      conditions: {
        min_spend: 0,
        min_visits: 0,
        min_loyalty_points: 0,
        buy_quantity: 0,
        get_quantity: 0,
        applicable_items: []
      },
      start_date: undefined,
      end_date: undefined,
      is_active: true,
      applicable_to: 'both'
    }
  })

  // Update the form when category or discount type changes
  useEffect(() => {
    // Reset relevant fields when category changes
    switch (selectedCategory) {
      case 'discount':
        form.setValue('conditions.buy_quantity', 0)
        form.setValue('conditions.get_quantity', 0)
        form.setValue('conditions.applicable_items', [])
        setSelectedDishes([])
        break
      case 'loyalty_points':
        form.setValue('discount_value', 0)
        form.setValue('conditions.min_spend', 0)
        form.setValue('discount_type', undefined)
        form.setValue('conditions.applicable_items', [])
        setSelectedDishes([])
        break
      case 'buy_x_get_y':
        form.setValue('discount_value', 0)
        form.setValue('discount_type', undefined)
        // Keep applicable_items for buy_x_get_y
        break
      case 'freeship':
        form.setValue('discount_value', 0)
        form.setValue('discount_type', undefined)
        form.setValue('conditions.buy_quantity', 0)
        form.setValue('conditions.get_quantity', 0)
        form.setValue('conditions.applicable_items', [])
        setSelectedDishes([])
        break
    }
  }, [selectedCategory, form])

  // Update form when selectedDishes changes
  useEffect(() => {
    form.setValue('conditions.applicable_items', selectedDishes)
  }, [selectedDishes, form])

  useEffect(() => {
    if (data) {
      const {
        name,
        description,
        category,
        discount_type,
        discount_value,
        conditions,
        start_date,
        end_date,
        is_active,
        applicable_to
      } = data.payload.result

      // Update the selected states
      setSelectedCategory(category)
      setSelectedDiscountType(discount_type || 'fixed')
      setSelectedDishes(conditions?.applicable_items || [])

      form.reset({
        name,
        description,
        category,
        discount_type,
        discount_value,
        conditions: {
          min_spend: conditions?.min_spend || 0,
          min_visits: conditions?.min_visits || 0,
          min_loyalty_points: conditions?.min_loyalty_points || 0,
          buy_quantity: conditions?.buy_quantity || 0,
          get_quantity: conditions?.get_quantity || 0,
          applicable_items: conditions?.applicable_items || []
        },
        start_date: start_date ? new Date(start_date) : undefined,
        end_date: end_date ? new Date(end_date) : undefined,
        is_active,
        applicable_to
      })
    }
  }, [data, form])

  const reset = () => {
    setId(undefined)
    setSelectedCategory('discount')
    setSelectedDiscountType('fixed')
    setSelectedDishes([])
    form.reset()
  }

  const onSubmit = async (values: UpdatePromotionBodyType) => {
    if (updatePromotionMutation.isPending) return
    try {
      // Clean up the conditions object - remove zero/empty values
      const cleanConditions = Object.fromEntries(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Object.entries(values.conditions || {}).filter(([_, value]) => {
          if (Array.isArray(value)) return value.length > 0
          return value !== 0 && value !== undefined && value !== null
        })
      )

      const body = {
        ...values,
        conditions: Object.keys(cleanConditions).length > 0 ? cleanConditions : undefined
      }

      const result = await updatePromotionMutation.mutateAsync({ promotionId: id as string, body })
      await revalidateApiRequest('promotions')
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

  // Helper function to render appropriate value field label based on discount type
  const getValueFieldLabel = (): string => {
    switch (selectedDiscountType) {
      case 'fixed':
        return 'Discount Amount ($)'
      case 'percentage':
        return 'Discount Percentage (%)'
      default:
        return 'Value'
    }
  }

  // Helper function to determine if a field should be shown
  const shouldShowField = (fieldName: string): boolean => {
    switch (fieldName) {
      case 'discount_type':
      case 'discount_value':
        return selectedCategory === 'discount'
      case 'min_spend':
        return selectedCategory === 'discount' || selectedCategory === 'freeship'
      case 'min_visits':
        return true // Show for all categories
      case 'min_loyalty_points':
        return selectedCategory === 'loyalty_points'
      case 'buy_quantity':
      case 'get_quantity':
        return selectedCategory === 'buy_x_get_y'
      case 'applicable_items':
        return selectedCategory === 'buy_x_get_y' || selectedCategory === 'combo'
      default:
        return true
    }
  }

  // Helper function to get category description
  const getCategoryDescription = (category: string): string => {
    switch (category) {
      case 'discount':
        return 'Fixed amount or percentage discount'
      case 'loyalty_points':
        return 'Earn loyalty points with purchase'
      case 'buy_x_get_y':
        return 'Buy X items, get Y items (free or discounted)'
      case 'freeship':
        return 'Free shipping with minimum purchase'
      default:
        return ''
    }
  }

  // Helper function to format date string or return empty string
  const formatDateValue = (dateValue: Date | undefined): string => {
    if (!dateValue) return ''
    try {
      return new Date(dateValue).toISOString().split('T')[0]
    } catch (error) {
      console.error('Error formatting date:', error)
      return ''
    }
  }

  // Handle dish selection
  const handleDishSelect = (dishId: string) => {
    if (dishId && !selectedDishes.includes(dishId)) {
      const newSelectedDishes = [...selectedDishes, dishId]
      setSelectedDishes(newSelectedDishes)
      // Reset the select value to placeholder
      const selectElement = document.querySelector('[data-dish-select-edit]') as HTMLElement
      if (selectElement) {
        selectElement.click() // Close the select
      }
    }
  }

  // Handle dish removal
  const handleDishRemove = (dishId: string) => {
    const newSelectedDishes = selectedDishes.filter((id) => id !== dishId)
    setSelectedDishes(newSelectedDishes)
  }

  // Get dish name by ID
  const getDishName = (dishId: string) => {
    const dish = dishes.find((d) => d._id === dishId)
    return dish?.name || 'Unknown Dish'
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
      <DialogContent className='sm:max-w-[600px] max-h-screen overflow-auto'>
        <DialogHeader>
          <DialogTitle>Update Promotion</DialogTitle>
          <DialogDescription>Update promotion details and submit to save changes</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className='grid auto-rows-max items-start gap-4 md:gap-8'
            id='edit-promotion-form'
            onSubmit={form.handleSubmit(onSubmit, console.log)}
          >
            <div className='grid gap-4 py-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='name' className='text-sm font-bold'>
                        Name
                      </Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Input id='name' className='w-full' placeholder='Summer Sale' {...field} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='description' className='text-sm font-bold'>
                        Description
                      </Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Textarea
                          id='description'
                          className='w-full'
                          placeholder='Brief description of the promotion'
                          {...field}
                        />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='category' className='text-sm font-bold'>
                        Promotion Category
                      </Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value)
                            setSelectedCategory(value)
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select Category' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PromotionCategoryValues.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>{getCategoryDescription(selectedCategory)}</FormDescription>
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              {shouldShowField('discount_type') && (
                <FormField
                  control={form.control}
                  name='discount_type'
                  render={({ field }) => (
                    <FormItem>
                      <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                        <Label htmlFor='discount_type' className='text-sm font-bold'>
                          Discount Type
                        </Label>
                        <div className='col-span-3 w-full space-y-2'>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value)
                              setSelectedDiscountType(value)
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder='Select Discount Type' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {DiscountTypeValues.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type.charAt(0).toUpperCase() + type.slice(1)}
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
              )}

              {shouldShowField('discount_value') && (
                <FormField
                  control={form.control}
                  name='discount_value'
                  render={({ field }) => (
                    <FormItem>
                      <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                        <div className='flex items-center gap-2'>
                          <Label htmlFor='discount_value' className='text-sm font-bold'>
                            {getValueFieldLabel()}
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className='h-4 w-4 opacity-70' />
                              </TooltipTrigger>
                              <TooltipContent>
                                {selectedDiscountType === 'fixed'
                                  ? 'Enter the fixed discount amount in dollars'
                                  : 'Enter a percentage (1-100)'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className='col-span-3 w-full space-y-2'>
                          <Input
                            id='discount_value'
                            type='number'
                            className='w-full'
                            min={0}
                            max={selectedDiscountType === 'percentage' ? 100 : undefined}
                            step={selectedDiscountType === 'percentage' ? 1 : 0.01}
                            placeholder={selectedDiscountType === 'percentage' ? '10' : '5.00'}
                            {...field}
                          />
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              )}

              {shouldShowField('buy_quantity') && (
                <FormField
                  control={form.control}
                  name='conditions.buy_quantity'
                  render={({ field }) => (
                    <FormItem>
                      <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                        <Label htmlFor='buy_quantity' className='text-sm font-bold'>
                          Buy Quantity
                        </Label>
                        <div className='col-span-3 w-full space-y-2'>
                          <Input
                            id='buy_quantity'
                            type='number'
                            className='w-full'
                            min={1}
                            placeholder='2'
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              )}

              {shouldShowField('get_quantity') && (
                <FormField
                  control={form.control}
                  name='conditions.get_quantity'
                  render={({ field }) => (
                    <FormItem>
                      <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                        <Label htmlFor='get_quantity' className='text-sm font-bold'>
                          Get Quantity
                        </Label>
                        <div className='col-span-3 w-full space-y-2'>
                          <Input
                            id='get_quantity'
                            type='number'
                            className='w-full'
                            min={1}
                            placeholder='1'
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              )}

              {shouldShowField('applicable_items') && (
                <FormField
                  control={form.control}
                  name='conditions.applicable_items'
                  render={() => (
                    <FormItem>
                      <div className='grid grid-cols-4 items-start justify-items-start gap-4'>
                        <div className='flex items-center gap-2'>
                          <Label className='text-sm font-bold'>Applicable Dishes</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className='h-4 w-4 opacity-70' />
                              </TooltipTrigger>
                              <TooltipContent>Select dishes that this promotion applies to</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className='col-span-3 w-full space-y-2'>
                          <Select onValueChange={handleDishSelect} value=''>
                            <SelectTrigger data-dish-select-edit>
                              <SelectValue placeholder='Select dishes...' />
                            </SelectTrigger>
                            <SelectContent>
                              {dishes
                                .filter((dish) => !selectedDishes.includes(dish._id))
                                .map((dish) => (
                                  <SelectItem key={dish._id} value={dish._id}>
                                    {dish.name} - ${dish.price}
                                  </SelectItem>
                                ))}
                              {dishes.filter((dish) => !selectedDishes.includes(dish._id)).length === 0 && (
                                <div className='py-2 px-2 text-sm text-gray-500'>No more dishes to select</div>
                              )}
                            </SelectContent>
                          </Select>

                          {selectedDishes.length > 0 && (
                            <div className='flex flex-wrap gap-2 mt-2'>
                              {selectedDishes.map((dishId) => (
                                <Badge key={dishId} variant='secondary' className='flex items-center gap-1'>
                                  {getDishName(dishId)}
                                  <button
                                    type='button'
                                    onClick={(e) => {
                                      e.preventDefault()
                                      handleDishRemove(dishId)
                                    }}
                                    className='ml-1 hover:bg-gray-200 rounded-full p-0.5'
                                  >
                                    <X className='h-3 w-3 cursor-pointer' />
                                  </button>
                                </Badge>
                              ))}
                            </div>
                          )}
                          <FormDescription>Selected dishes: {selectedDishes.length}</FormDescription>
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              )}

              {shouldShowField('min_spend') && (
                <FormField
                  control={form.control}
                  name='conditions.min_spend'
                  render={({ field }) => (
                    <FormItem>
                      <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                        <Label htmlFor='min_spend' className='text-sm font-bold'>
                          Min Spend ($)
                        </Label>
                        <div className='col-span-3 w-full space-y-2'>
                          <Input
                            id='min_spend'
                            type='number'
                            className='w-full'
                            min={0}
                            step={0.01}
                            placeholder='25.00'
                            {...field}
                          />
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              )}

              {shouldShowField('min_visits') && (
                <FormField
                  control={form.control}
                  name='conditions.min_visits'
                  render={({ field }) => (
                    <FormItem>
                      <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                        <div className='flex items-center gap-2'>
                          <Label htmlFor='min_visits' className='text-sm font-bold'>
                            Min Visits
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className='h-4 w-4 opacity-70' />
                              </TooltipTrigger>
                              <TooltipContent>Number of visits required to qualify for this promotion</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className='col-span-3 w-full space-y-2'>
                          <Input
                            id='min_visits'
                            type='number'
                            className='w-full'
                            min={0}
                            placeholder='0'
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              )}

              {shouldShowField('min_loyalty_points') && (
                <FormField
                  control={form.control}
                  name='conditions.min_loyalty_points'
                  render={({ field }) => (
                    <FormItem>
                      <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                        <div className='flex items-center gap-2'>
                          <Label htmlFor='min_loyalty_points' className='text-sm font-bold'>
                            Loyalty Points
                          </Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className='h-4 w-4 opacity-70' />
                              </TooltipTrigger>
                              <TooltipContent>Points earned or required for this promotion</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <div className='col-span-3 w-full space-y-2'>
                          <Input
                            id='min_loyalty_points'
                            type='number'
                            className='w-full'
                            min={0}
                            placeholder='100'
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name='applicable_to'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='applicable_to' className='text-sm font-bold'>
                        Applicable To
                      </Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select Applicability' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ApplicableToValues.map((value) => (
                              <SelectItem key={value} value={value}>
                                {value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ')}
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

              <div className='border-t border-gray-200 pt-4 mt-2'>
                <h3 className='font-medium mb-2'>Promotion Period</h3>
              </div>

              <FormField
                control={form.control}
                name='start_date'
                render={({ field: { value, onChange, ...restField } }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='start_date' className='text-sm font-bold'>
                        Start Date
                      </Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Input
                          id='start_date'
                          type='date'
                          className='w-full'
                          value={formatDateValue(value)}
                          onChange={(e) => {
                            const dateValue = e.target.value ? new Date(e.target.value) : null
                            onChange(dateValue)
                          }}
                          {...restField}
                        />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='end_date'
                render={({ field: { value, onChange, ...restField } }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='end_date' className='text-sm font-bold'>
                        End Date
                      </Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Input
                          id='end_date'
                          type='date'
                          className='w-full'
                          value={formatDateValue(value)}
                          onChange={(e) => {
                            const dateValue = e.target.value ? new Date(e.target.value) : null
                            onChange(dateValue)
                          }}
                          {...restField}
                        />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='is_active'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='is_active' className='text-sm font-bold'>
                        Status
                      </Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Select
                          onValueChange={(value) => field.onChange(value === 'true')}
                          value={field.value ? 'true' : 'false'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select Status' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value='true'>Active</SelectItem>
                            <SelectItem value='false'>Inactive</SelectItem>
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
        <DialogFooter>
          <Button variant='outline' onClick={() => setId(undefined)} className='mr-2'>
            Cancel
          </Button>
          <Button type='submit' form='edit-promotion-form'>
            Update Promotion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
