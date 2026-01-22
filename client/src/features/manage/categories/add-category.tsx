'use client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { handleErrorApi } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import revalidateApiRequest from '@/apiRequests/revalidate'
import { useAddCategoryMutation } from '@/queries/useCategory'
import { CreateCategoryBody, CreateCategoryBodyType } from '@/schemaValidations/category.schema'
import { useTranslations } from 'next-intl'

export default function AddCategory() {
  const t = useTranslations('category')
  const tCommon = useTranslations('common')
  const [open, setOpen] = useState(false)
  const addCategoryMutation = useAddCategoryMutation()

  const form = useForm<CreateCategoryBodyType>({
    resolver: zodResolver(CreateCategoryBody),
    defaultValues: {
      name: '',
      description: ''
    }
  })

  const reset = () => {
    form.reset()
  }
  const onSubmit = async (values: CreateCategoryBodyType) => {
    if (addCategoryMutation.isPending) return
    try {
      const result = await addCategoryMutation.mutateAsync(values)
      await revalidateApiRequest('categories')
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
          <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>{t('addCategory')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px] max-h-screen overflow-auto'>
        <DialogHeader>
          <DialogTitle>{t('addCategory')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className='grid auto-rows-max items-start gap-4 md:gap-8'
            id='add-dish-form'
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
                        {t('name')}
                      </Label>
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
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='description' className='text-sm font-bold'>
                        {t('description')}
                      </Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Textarea id='description' className='w-full' {...field} />
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
          <Button type='submit' form='add-dish-form' disabled={addCategoryMutation.isPending}>
            {addCategoryMutation.isPending ? t('addingCategory') : t('addCategory')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
