'use client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { zodResolver } from '@hookform/resolvers/zod'
import { Edit } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { handleErrorApi } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import revalidateApiRequest from '@/apiRequests/revalidate'
import { useUpdateCategoryMutation } from '@/queries/useCategory'
import { CategoryResType, UpdateCategoryBody, UpdateCategoryBodyType } from '@/schemaValidations/category.schema'
import { useTranslations } from 'next-intl'

export default function EditCategory({ category }: { category: CategoryResType['result'] }) {
  const t = useTranslations('category')
  const tCommon = useTranslations('common')
  const [open, setOpen] = useState(false)
  const updateCategoryMutation = useUpdateCategoryMutation()

  const form = useForm<UpdateCategoryBodyType>({
    resolver: zodResolver(UpdateCategoryBody),
    defaultValues: {
      name: category.name,
      description: category.description
    }
  })

  useEffect(() => {
    form.reset({
      name: category.name,
      description: category.description
    })
  }, [category, form, form.reset])

  const reset = () => {
    form.reset()
  }
  const onSubmit = async (values: UpdateCategoryBodyType) => {
    if (updateCategoryMutation.isPending) return
    try {
      const result = await updateCategoryMutation.mutateAsync({ id: category._id, ...values })
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
        <Button variant='outline' size='sm' className='h-8 w-8 p-0'>
          <Edit className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px] max-h-screen overflow-auto'>
        <DialogHeader>
          <DialogTitle>{t('editCategory')}</DialogTitle>
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
          <Button type='submit' form='add-dish-form' disabled={updateCategoryMutation.isPending}>
            {updateCategoryMutation.isPending ? t('updatingCategory') : t('updateCategory')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
