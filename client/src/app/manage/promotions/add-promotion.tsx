'use client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusCircle, HelpCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Form, FormControl, FormField, FormItem, FormMessage, FormDescription } from '@/components/ui/form'
import { getPromotionType, handleErrorApi } from '@/lib/utils'

import { PromotionType, PromotionTypeValues } from '@/constants/type'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

import { toast } from 'sonner'
import revalidateApiRequest from '@/apiRequests/revalidate'
import { CreatePromotionBody, CreatePromotionBodyType } from '@/schemaValidations/promotion.schema'
import { useCreatePromotionMutation } from '@/queries/usePromotion'
import { useState, useEffect } from 'react'

export default function AddPromotion() {
  const [open, setOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<string>(PromotionType.Discount)
  const createPromotionMutation = useCreatePromotionMutation()

  const form = useForm<CreatePromotionBodyType>({
    resolver: zodResolver(CreatePromotionBody),
    defaultValues: {
      name: '',
      description: '',
      discount_type: PromotionType.Discount,
      discount_value: 0,
      min_spend: 0,
      min_visits: 0,
      min_loyalty_points: 0,
      start_date: new Date(),
      end_date: new Date(),
      is_active: true
    }
  })

  // Reset form and selected type
  const reset = () => {
    form.reset()
    setSelectedType(PromotionType.Discount)
  }

  // Update the form when promotion type changes
  useEffect(() => {
    // Reset relevant fields when promotion type changes
    switch (selectedType) {
      case PromotionType.Discount:
        form.setValue('min_loyalty_points', 0)
        break
      case PromotionType.LoyaltyPoints:
        form.setValue('discount_value', 0)
        form.setValue('min_spend', 0)
        break
      case PromotionType.Percent:
        form.setValue('min_loyalty_points', 0)
        break
      case PromotionType.FreeItem:
        form.setValue('discount_value', 0)
        break
    }
  }, [selectedType, form])

  const onSubmit = async (values: CreatePromotionBodyType) => {
    if (createPromotionMutation.isPending) return
    try {
      const result = await createPromotionMutation.mutateAsync(values)
      await revalidateApiRequest('promotions')
      toast('Success', {
        description: result.payload.message
      })
      setOpen(false)
      reset()
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError
      })
    }
  }

  // Helper function to render appropriate value field label based on promotion type
  const getValueFieldLabel = (): string => {
    switch (selectedType) {
      case PromotionType.Discount:
        return 'Discount Amount ($)'
      case PromotionType.Percent:
        return 'Discount Percentage (%)'
      case PromotionType.FreeItem:
        return 'Minimum Purchase Amount ($)'
      default:
        return 'Value'
    }
  }

  // Helper function to determine if a field should be shown
  const shouldShowField = (fieldName: string): boolean => {
    switch (fieldName) {
      case 'discount_value':
        return (
          selectedType === PromotionType.Discount ||
          selectedType === PromotionType.Percent ||
          selectedType === PromotionType.LoyaltyPoints
        )
      case 'min_spend':
        return (
          selectedType === PromotionType.Discount ||
          selectedType === PromotionType.Percent ||
          selectedType === PromotionType.FreeItem
        )
      case 'min_visits':
        return true // Show for all types
      case 'min_loyalty_points':
        return selectedType === PromotionType.LoyaltyPoints
      default:
        return true
    }
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
        <Button size='lg' className='gap-2'>
          <PlusCircle className='h-3.5 w-3.5' />
          <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>Add Promotion</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px] max-h-screen overflow-auto'>
        <DialogHeader>
          <DialogTitle>Add Promotion</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className='grid auto-rows-max items-start gap-4 md:gap-8'
            id='add-promotion-form'
            onSubmit={form.handleSubmit(onSubmit, (e) => {
              console.log(e)
            })}
            onReset={reset}
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
                name='discount_type'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='discount_type' className='text-sm font-bold'>
                        Promotion Type
                      </Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value)
                            setSelectedType(value)
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder='Select Type' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PromotionTypeValues.map((type) => (
                              <SelectItem key={type} value={type}>
                                {getPromotionType(type)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {(() => {
                            switch (selectedType) {
                              case PromotionType.Discount:
                                return 'Fixed amount discount (e.g. $5 off)'
                              case PromotionType.Percent:
                                return 'Percentage discount (e.g. 10% off)'
                              case PromotionType.LoyaltyPoints:
                                return 'Earn loyalty points with purchase'
                              case PromotionType.FreeItem:
                                return 'Free item with minimum purchase'
                              default:
                                return ''
                            }
                          })()}
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />

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
                                {(() => {
                                  switch (selectedType) {
                                    case PromotionType.Discount:
                                      return 'Enter the fixed discount amount in dollars'
                                    case PromotionType.Percent:
                                      return 'Enter a percentage (1-100)'
                                    default:
                                      return 'Enter value'
                                  }
                                })()}
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
                            max={selectedType === PromotionType.Percent ? 100 : undefined}
                            step={selectedType === PromotionType.Percent ? 1 : 0.01}
                            placeholder={selectedType === PromotionType.Percent ? '10' : '5.00'}
                            {...field}
                          />
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
                  name='min_spend'
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
                  name='min_visits'
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
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                  name='min_loyalty_points'
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
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              )}

              <div className='border-t border-gray-200 pt-4 mt-2'>
                <h3 className='font-medium mb-2'>Promotion Period</h3>
              </div>

              <FormField
                control={form.control}
                name='start_date'
                render={({ field }) => (
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
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
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
                render={({ field }) => (
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
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(new Date(e.target.value))}
                        />
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
          <Button variant='outline' onClick={() => setOpen(false)} className='mr-2'>
            Cancel
          </Button>
          <Button type='submit' form='add-promotion-form'>
            Add Promotion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
