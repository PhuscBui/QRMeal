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
import { UpdateEmployeeAccountBody, UpdateEmployeeAccountBodyType } from '@/schemaValidations/account.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { useGetAccount, useUpdateAccountMutation } from '@/queries/useAccount'
import { useUploadMediaMutation } from '@/queries/useMedia'
import { toast } from 'sonner'
import { handleErrorApi } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export default function EditEmployee({
  id,
  setId,
  onSubmitSuccess
}: {
  id?: string | undefined
  setId: (value: string | undefined) => void
  onSubmitSuccess?: () => void
}) {
  const t = useTranslations('account')
  const tCommon = useTranslations('common')
  const [file, setFile] = useState<File | null>(null)
  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const { data } = useGetAccount({
    id: id as string,
    enabled: Boolean(id)
  })
  const updateAccountMutation = useUpdateAccountMutation()
  const uploadMediaMutation = useUploadMediaMutation()

  const form = useForm<UpdateEmployeeAccountBodyType>({
    resolver: zodResolver(UpdateEmployeeAccountBody),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      avatar: undefined,
      date_of_birth: undefined,
      password: '',
      confirm_password: '',
      change_password: false
    }
  })
  const avatar = form.watch('avatar')
  const name = form.watch('name')
  const changePassword = form.watch('change_password')
  const previewAvatarFromFile = file ? URL.createObjectURL(file) : avatar || undefined

  useEffect(() => {
    if (data) {
      const { name, avatar, email, date_of_birth, phone } = data.payload.result
      form.reset({
        name,
        avatar: avatar || undefined,
        email,
        date_of_birth: date_of_birth ? new Date(date_of_birth) : undefined,
        phone,
        change_password: form.getValues('change_password'),
        password: '',
        confirm_password: form.getValues('confirm_password') || ''
      })
    }
  }, [data, form])

  useEffect(() => {
    if (form.getValues('change_password') === false) {
      form.setValue('password', '')
      form.setValue('confirm_password', '')
    }
  }, [form])

  const onSubmit = async (values: UpdateEmployeeAccountBodyType) => {
    console.log('onSubmit', values)
    if (updateAccountMutation.isPending) return
    try {
      let body: UpdateEmployeeAccountBodyType & { id: string } = {
        id: id as string,
        ...values
      }

      if (!values.change_password) {
        delete body.password
        delete body.confirm_password
      }

      if (file) {
        const formData = new FormData()
        formData.append('image', file)
        const uploadImageResult = await uploadMediaMutation.mutateAsync(formData)
        const imageUrl = uploadImageResult.payload.result
        body = {
          ...body,
          avatar: imageUrl
        }
      }
      const result = await updateAccountMutation.mutateAsync(body)
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
    setFile(null)
    form.reset({
      name: '',
      email: '',
      avatar: undefined,
      date_of_birth: undefined,
      password: '',
      confirm_password: '',
      change_password: false
    })
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
          <DialogTitle>{t('updateAccount')}</DialogTitle>
          <DialogDescription>{t('updateAccountDesc')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            noValidate
            className='grid auto-rows-max items-start gap-4 md:gap-8'
            id='edit-employee-form'
            onSubmit={form.handleSubmit(onSubmit, console.log)}
          >
            <div className='grid gap-4 py-4'>
              <FormField
                control={form.control}
                name='avatar'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex gap-2 items-start justify-center'>
                      <Avatar className='aspect-square w-[100px] h-[100px] rounded-md object-cover'>
                        <AvatarImage src={previewAvatarFromFile || undefined} />
                        <AvatarFallback className='rounded-none'>{name || t('avatar')}</AvatarFallback>
                      </Avatar>
                      <input
                        type='file'
                        accept='image/*'
                        ref={avatarInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setFile(file)
                            field.onChange('http://localhost:3000/' + file.name)
                          }
                        }}
                        className='hidden'
                      />
                      <button
                        className='flex aspect-square w-[100px] items-center justify-center rounded-md border border-dashed'
                        type='button'
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        <Upload className='h-4 w-4 text-muted-foreground' />
                        <span className='sr-only'>{t('upload')}</span>
                      </button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                name='date_of_birth'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='date_of_birth' className='text-sm font-bold'>
                        {t('dateOfBirth')}
                      </Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Input
                          id='date_of_birth'
                          type='date'
                          className='w-fit'
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            const date = e.target.value ? new Date(e.target.value) : undefined
                            field.onChange(date)
                          }}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </div>
                      <FormMessage className='text-xs text-red-500' />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='phone' className='text-sm font-bold'>
                        {t('phone')}
                      </Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Input id='phone' className='w-full' {...field} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label htmlFor='email' className='text-sm font-bold'>
                        {t('email')}
                      </Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Input id='email' className='w-full' {...field} />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='change_password'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                      <Label className='text-sm font-bold'>{t('changePassword')}</Label>
                      <div className='col-span-3 w-full space-y-2'>
                        <Switch
                          checked={field.value}
                          onCheckedChange={() => {
                            field.onChange(!field.value)
                            form.setValue('password', '')
                            form.setValue('confirm_password', '')
                          }}
                        />

                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              {changePassword && (
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                        <Label htmlFor='password' className='text-sm font-bold'>
                          {t('newPassword')}
                        </Label>
                        <div className='col-span-3 w-full space-y-2'>
                          <Input id='password' className='w-full' type='password' {...field} />
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              )}
              {changePassword && (
                <FormField
                  control={form.control}
                  name='confirm_password'
                  render={({ field }) => (
                    <FormItem>
                      <div className='grid grid-cols-4 items-center justify-items-start gap-4'>
                        <Label htmlFor='confirmPassword' className='text-sm font-bold'>
                          {t('confirmNewPassword')}
                        </Label>
                        <div className='col-span-3 w-full space-y-2'>
                          <Input id='confirmPassword' className='w-full' type='password' {...field} />
                          <FormMessage />
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              )}
            </div>
          </form>
        </Form>
        <DialogFooter>
          <Button
            type='submit'
            form='edit-employee-form'
            disabled={updateAccountMutation.isPending || uploadMediaMutation.isPending}
          >
            {updateAccountMutation.isPending || uploadMediaMutation.isPending ? t('updatingEmployee') : t('update')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
