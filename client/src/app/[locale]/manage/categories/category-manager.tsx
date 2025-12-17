'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Tag, Trash } from 'lucide-react'
import AddCategory from '@/app/manage/categories/add-category'
import EditCategory from '@/app/manage/categories/edit-category'
import { useCategoryListQuery, useDeleteCategoryMutation } from '@/queries/useCategory'
import { CategoryResType } from '@/schemaValidations/category.schema'
import { toast } from 'sonner'
import { handleErrorApi } from '@/lib/utils'
import { useState } from 'react'
import Loader from '@/components/loader'
import { useTranslations } from 'next-intl'

function AlertDialogDeleteCategory({
  categoryDelete,
  setCategoryDelete
}: {
  categoryDelete: CategoryResType['result'] | null
  setCategoryDelete: (category: CategoryResType['result'] | null) => void
}) {
  const t = useTranslations('category')
  const tCommon = useTranslations('common')
  const { mutateAsync } = useDeleteCategoryMutation()
  const deleteCategory = async () => {
    if (categoryDelete) {
      try {
        const result = await mutateAsync(categoryDelete._id)
        setCategoryDelete(null)
        toast(tCommon('success'), {
          description: result.payload.message
        })
      } catch (error) {
        handleErrorApi({
          error
        })
      }
    }
  }

  return (
    <AlertDialog
      open={Boolean(categoryDelete)}
      onOpenChange={(value) => {
        if (!value) {
          setCategoryDelete(null)
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deleteCategory')}</AlertDialogTitle>
          <AlertDialogDescription>
            <span className='bg-foreground text-primary-foreground rounded p-1'>{categoryDelete?.name}</span>{' '}
            {t('deleteConfirmation')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={deleteCategory}>{tCommon('continue')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function CategoryManager() {
  const t = useTranslations('category')
  const categoryListQuery = useCategoryListQuery()
  const data = categoryListQuery.data?.payload.result ?? []
  const [categoryDelete, setCategoryDelete] = useState<CategoryResType['result'] | null>(null)

  if (categoryListQuery.isLoading) {
    ;<div className='flex justify-center items-start h-screen'>
      <Loader className='w-4 h-4' />
    </div>
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <Input placeholder={t('filterByName')} className='max-w-sm' />
        <div className='ml-auto flex items-center gap-2'>
          <AddCategory />
        </div>
      </div>

      {/* Categories Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {data.map((category) => (
          <Card key={category._id} className='relative transition-shadow hover:shadow-lg rounded-xl'>
            <CardHeader className='pb-2'>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <CardTitle className='text-lg font-semibold flex items-center gap-2'>
                    {/* Icon Category */}
                    <span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary'>
                      <Tag className='h-4 w-4' />
                    </span>
                    {category.name}
                  </CardTitle>
                  <p className='text-sm text-muted-foreground mt-1'>
                    {category.dish_count ?? 0} {category.dish_count === 1 ? t('dish') : t('dishes')}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className='pt-0'>
              <CardDescription className='mb-3 line-clamp-2'>
                {category.description || t('noDescription')}
              </CardDescription>

              <div className='flex items-center justify-between pt-2 border-t'>
                <div className='flex gap-1'>
                  <EditCategory category={category} />
                  <Button variant='destructive' className='h-8 w-8 p-0' onClick={() => setCategoryDelete(category)}>
                    <Trash className='h-4 w-4' />
                  </Button>
                  <AlertDialogDeleteCategory categoryDelete={categoryDelete} setCategoryDelete={setCategoryDelete} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
