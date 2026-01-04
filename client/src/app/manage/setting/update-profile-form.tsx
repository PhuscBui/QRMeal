'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { UpdateMeBody, UpdateMeBodyType } from '@/schemaValidations/account.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useEffect, useRef, useState } from 'react'
import { useAccountMe, useUpdateMeMutation } from '@/queries/useAccount'
import { useUploadMediaMutation } from '@/queries/useMedia'
import { toast } from 'sonner'
import { handleErrorApi } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { useTranslations } from 'next-intl'

export default function UpdateProfileForm() {
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')
  const [file, setFile] = useState<File | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const { data, refetch } = useAccountMe()
  const updateMeMutation = useUpdateMeMutation()
  const uploadMediaMutation = useUploadMediaMutation()
  const form = useForm<UpdateMeBodyType>({
    resolver: zodResolver(UpdateMeBody),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      avatar: undefined,
      date_of_birth: undefined
    }
  })

  const avatar = form.watch('avatar')
  const name = form.watch('name')
  useEffect(() => {
    if (data) {
      const { name, avatar, date_of_birth, email, phone } = data.payload.result
      form.reset({
        name,
        avatar: avatar ?? undefined,
        date_of_birth: date_of_birth ? new Date(date_of_birth) : undefined,
        email,
        phone
      })
    }
  }, [form, data])

  const previewAvatar = file ? URL.createObjectURL(file) : avatar

  const reset = () => {
    form.reset()
    setFile(null)
  }
  const onSubmit = async (values: UpdateMeBodyType) => {
    if (updateMeMutation.isPending) return
    try {
      let body = values
      if (file) {
        const formData = new FormData()
        formData.append('image', file)
        const uploadImageResult = await uploadMediaMutation.mutateAsync(formData)
        const imageUrl = uploadImageResult.payload.result
        body = {
          ...values,
          avatar: imageUrl
        }
      }
      console.log(body)
      const result = await updateMeMutation.mutateAsync(body)

      toast(tCommon('success'), {
        description: result.payload.message
      })
      refetch()
    } catch (error) {
      console.log(error)
      handleErrorApi({
        error,
        setError: form.setError
      })
    }
  }
  return (
    <Form {...form}>
      <form
        noValidate
        className='grid auto-rows-max md:col-span-2 items-start gap-4 md:gap-8'
        onReset={reset}
        onSubmit={form.handleSubmit(onSubmit, (e) => {
          console.log(e)
        })}
      >
        <Card x-chunk='dashboard-07-chunk-0'>
          <CardHeader>
            <CardTitle className='text-center text-2xl'>{t('personalInformation')}</CardTitle>
            <div className='flex w-full justify-center items-center gap-4'>
              <Badge variant='outline' className='mt-2'>
                {data?.payload.result.role}
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <div className='grid gap-6'>
              <FormField
                control={form.control}
                name='avatar'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex gap-2  justify-center items-center pb-1'>
                      <Avatar className='aspect-square w-[120px] h-[120px] rounded-md object-cover'>
                        <AvatarImage src={previewAvatar} />
                        <AvatarFallback className='rounded-none'>{name}</AvatarFallback>
                      </Avatar>
                      <input
                        type='file'
                        accept='image/*'
                        className='hidden'
                        ref={avatarInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setFile(file)
                            field.onChange('http://localhost:3000/' + field.name)
                          }
                        }}
                      />
                      <button
                        className='flex aspect-square w-[120px] items-center justify-center rounded-md border border-dashed hover:cursor-pointer'
                        type='button'
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        <Upload className='h-4 w-4 text-muted-foreground' />
                        <span className='sr-only'>{tCommon('upload')}</span>
                      </button>
                    </div>
                  </FormItem>
                )}
              />

              <div className='grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <div className='grid gap-2'>
                        <Label htmlFor='name' className='text-sm font-bold'>
                          {t('name')}
                        </Label>
                        <Input id='name' type='text' className='w-full' placeholder={t('enterName')} {...field} />
                        <FormMessage className='text-xs text-red-500' />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <div className='grid gap-2'>
                        <Label htmlFor='email' className='text-sm font-bold'>
                          {t('email')}
                        </Label>
                        <Input id='email' type='text' className='w-full' placeholder={t('enterEmail')} {...field} />
                        <FormMessage className='text-xs text-red-500' />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='phone'
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <div className='grid gap-2'>
                        <Label htmlFor='phone' className='text-sm font-bold'>
                          {t('phone')}
                        </Label>
                        <Input
                          id='phone'
                          type='text'
                          className='w-full'
                          placeholder={t('enterPhone')}
                          {...field}
                        />
                        <FormMessage className='text-xs text-red-500' />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='date_of_birth'
                  render={({ field }) => {
                    // Ensure value is always a string (never undefined)
                    const dateValue = field.value
                      ? (() => {
                          const date = field.value instanceof Date ? field.value : new Date(field.value)
                          return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : ''
                        })()
                      : ''
                    
                    return (
                      <FormItem className='w-full'>
                        <div className='grid gap-2'>
                          <Label htmlFor='date_of_birth' className='text-sm font-bold'>
                            {t('dateOfBirth')}
                          </Label>
                          <Input
                            id='date_of_birth'
                            type='date'
                            className='w-fit'
                            value={dateValue}
                            onChange={(e) => {
                              const value = e.target.value
                              if (value) {
                                const date = new Date(value)
                                field.onChange(!isNaN(date.getTime()) ? date : undefined)
                              } else {
                                field.onChange(undefined)
                              }
                            }}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                          <FormMessage className='text-xs text-red-500' />
                        </div>
                      </FormItem>
                    )
                  }}
                />
              </div>

              <div className=' items-center gap-2 md:ml-auto flex'>
                <Button variant='outline' size='sm' type='reset'>
                  {t('reset')}
                </Button>
                <Button size='sm' type='submit' disabled={updateMeMutation.isPending || uploadMediaMutation.isPending}>
                  {updateMeMutation.isPending || uploadMediaMutation.isPending ? t('saving') : t('save')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}
